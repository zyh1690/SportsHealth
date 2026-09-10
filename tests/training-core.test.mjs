import assert from 'node:assert/strict'
import test from 'node:test'
import {
  trainingDayExerciseGroups,
  resolveSelectedSplit,
  splitDayForWeekday,
  sportModuleSuggestion,
} from '../src/data/training-core.mjs'

const conditionFixtures = [
  { id: 'ankle', regions: ['region-ankle-right'], rehabExercises: ['knee-to-wall'], prevention: ['calf-raise'] },
  { id: 'pelvis', regions: ['region-pelvis'], rehabExercises: ['clamshell', 'dead-bug'], prevention: ['bird-dog'] },
  { id: 'thoracic', regions: ['region-thoracic-spine'], rehabExercises: ['cat-cow', 'thoracic-rotation'], prevention: [] },
  { id: 'scapula', regions: ['region-scapula-right'], rehabExercises: ['ytw', 'face-pull'], prevention: [] },
  { id: 'shoulder', regions: ['region-shoulder-right'], rehabExercises: ['external-rotation', 'doorway-stretch'], prevention: [] },
]

const splits = [
  { id: 'default', days: [{ weekday: 1, focus: '胸' }, { weekday: 2, focus: '腿' }] },
  { id: 'other', days: [{ weekday: 1, focus: '上肢' }] },
]

test('split resolution keeps the confirmed default and maps recovery days explicitly', () => {
  assert.equal(resolveSelectedSplit(splits, 'missing', 'default').id, 'default')
  assert.equal(splitDayForWeekday(splits[0], 1).focus, '胸')
  assert.equal(splitDayForWeekday(splits[0], 0), null)
})

test('sport suggestions rotate all standard modules but only Fitness primary A and C', () => {
  const running = { id: 'running', modules: [{ id: 'prep' }, { id: 'capacity' }, { id: 'recovery' }] }
  const fitness = {
    id: 'fitness',
    modules: [
      { id: 'a', priority: 'primary' },
      { id: 'b', priority: 'optional' },
      { id: 'c', priority: 'primary' },
    ],
  }
  assert.equal(sportModuleSuggestion(running, 1).id, 'capacity')
  assert.equal(sportModuleSuggestion(fitness, 0).id, 'a')
  assert.equal(sportModuleSuggestion(fitness, 1).id, 'c')
  assert.equal(sportModuleSuggestion(fitness, 2).id, 'a')
})

test('chest day separates template preparation from at most three relevant rehab actions', () => {
  const result = trainingDayExerciseGroups({
    conditions: conditionFixtures,
    selectedConditionIds: conditionFixtures.map((item) => item.id),
    day: {
      focus: '胸 · 推 B',
      supportExerciseIds: ['cat-cow', 'ytw', 'external-rotation'],
    },
  })
  assert.deepEqual(result.preparationIds, ['cat-cow', 'ytw', 'external-rotation'])
  assert.deepEqual(result.personalRehabIds, ['thoracic-rotation', 'face-pull', 'doorway-stretch'])
  assert.deepEqual(result.allIds, [
    'cat-cow', 'ytw', 'external-rotation',
    'thoracic-rotation', 'face-pull', 'doorway-stretch',
  ])
  assert.ok(!result.allIds.some((id) => ['knee-to-wall', 'calf-raise', 'clamshell', 'dead-bug', 'bird-dog'].includes(id)))
})

test('leg day selects lower-chain rehab without duplicating template actions', () => {
  const result = trainingDayExerciseGroups({
    conditions: conditionFixtures,
    selectedConditionIds: conditionFixtures.map((item) => item.id),
    day: { focus: '腿 · 蹲 A', supportExerciseIds: ['knee-to-wall'] },
  })
  assert.deepEqual(result.preparationIds, ['knee-to-wall'])
  assert.deepEqual(result.personalRehabIds, ['clamshell', 'dead-bug', 'calf-raise'])
  assert.equal(result.personalRehabIds.length, 3)
})
