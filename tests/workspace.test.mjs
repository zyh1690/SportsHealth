import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EXAMPLE_CONDITION_IDS,
  WORKSPACE_KEY,
  addExampleConditions,
  createBlankWorkspace,
  loadWorkspace,
  normalizeWorkspace,
  saveWorkspace,
} from '../src/stores/workspace-core.mjs'

function memoryStorage(seed = {}) {
  const values = new Map(Object.entries(seed))
  return {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
    values,
  }
}

test('first run starts blank', () => {
  assert.deepEqual(loadWorkspace(memoryStorage()), createBlankWorkspace())
})

test('versioned state persists selection and shared completion', () => {
  const storage = memoryStorage()
  const saved = saveWorkspace(storage, {
    version: 2,
    selectedConditionIds: ['cond-a', 'cond-a'],
    completedExerciseIds: ['ex-a'],
  })
  assert.deepEqual(saved.selectedConditionIds, ['cond-a'])
  assert.deepEqual(loadWorkspace(storage).completedExerciseIds, ['ex-a'])
})

test('old or malformed payloads do not silently migrate', () => {
  assert.deepEqual(normalizeWorkspace({ version: 1, selectedConditionIds: EXAMPLE_CONDITION_IDS }), createBlankWorkspace())
})

test('example remains an explicit action and clear returns blank state', () => {
  const storage = memoryStorage({
    [WORKSPACE_KEY]: {
      version: 2,
      selectedConditionIds: EXAMPLE_CONDITION_IDS,
      completedExerciseIds: ['ex-dead-bug'],
    },
  })
  assert.deepEqual(loadWorkspace(storage).selectedConditionIds, EXAMPLE_CONDITION_IDS)
  saveWorkspace(storage, createBlankWorkspace())
  assert.deepEqual(loadWorkspace(storage), createBlankWorkspace())
})

test('loading the example can add conditions without replacing existing progress', () => {
  const existing = {
    version: 2,
    selectedConditionIds: ['cond-existing'],
    completedExerciseIds: ['ex-existing'],
  }
  const merged = addExampleConditions(existing)
  assert.deepEqual(merged.selectedConditionIds, ['cond-existing', ...EXAMPLE_CONDITION_IDS])
  assert.deepEqual(merged.completedExerciseIds, ['ex-existing'])
})

test('writing v2 state leaves legacy keys untouched', () => {
  const storage = memoryStorage({ 'profile-conditions': ['legacy-condition'], 'profile-done-exercises': ['legacy-exercise'] })
  saveWorkspace(storage, createBlankWorkspace())
  assert.deepEqual(storage.values.get('profile-conditions'), ['legacy-condition'])
  assert.deepEqual(storage.values.get('profile-done-exercises'), ['legacy-exercise'])
})
