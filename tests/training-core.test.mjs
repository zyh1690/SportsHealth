import assert from 'node:assert/strict'
import test from 'node:test'
import {
  resolveSelectedSplit,
  splitDayForWeekday,
  sportModuleSuggestion,
} from '../src/data/training-core.mjs'

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
