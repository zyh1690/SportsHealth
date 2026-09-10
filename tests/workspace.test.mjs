import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_SPLIT_ID,
  EXAMPLE_CONDITION_IDS,
  LEGACY_WORKSPACE_KEY,
  WORKSPACE_KEY,
  addExampleConditions,
  createBlankWorkspace,
  currentCompletionIds,
  loadWorkspace,
  normalizeWorkspace,
  pruneCompletionByDate,
  saveWorkspace,
  withExerciseCompletion,
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
    version: 3,
    selectedConditionIds: ['cond-a', 'cond-a'],
    selectedSplitId: 'split-upper-lower',
    selectedSportTrackId: 'running',
    completionByDate: { '2026-09-09': ['ex-a', 'ex-a'] },
  })
  assert.deepEqual(saved.selectedConditionIds, ['cond-a'])
  assert.equal(saved.selectedSplitId, 'split-upper-lower')
  assert.equal(saved.selectedSportTrackId, 'running')
  assert.deepEqual(currentCompletionIds(loadWorkspace(storage, '2026-09-09'), '2026-09-09'), ['ex-a'])
})

test('old or malformed payloads do not silently migrate', () => {
  assert.deepEqual(normalizeWorkspace({ version: 1, selectedConditionIds: EXAMPLE_CONDITION_IDS }), createBlankWorkspace())
})

test('example remains an explicit action and clear returns blank state', () => {
  const storage = memoryStorage({
    [WORKSPACE_KEY]: {
      version: 3,
      selectedConditionIds: EXAMPLE_CONDITION_IDS,
      selectedSplitId: DEFAULT_SPLIT_ID,
      selectedSportTrackId: '',
      completionByDate: { '2026-09-09': ['ex-dead-bug'] },
    },
  })
  assert.deepEqual(loadWorkspace(storage).selectedConditionIds, EXAMPLE_CONDITION_IDS)
  saveWorkspace(storage, createBlankWorkspace())
  assert.deepEqual(loadWorkspace(storage), createBlankWorkspace())
})

test('loading the example can add conditions without replacing existing progress', () => {
  const existing = {
    version: 3,
    selectedConditionIds: ['cond-existing'],
    selectedSplitId: 'split-five-way',
    selectedSportTrackId: 'fitness',
    completionByDate: { '2026-09-09': ['ex-existing'] },
  }
  const merged = addExampleConditions(existing)
  assert.deepEqual(merged.selectedConditionIds, ['cond-existing', ...EXAMPLE_CONDITION_IDS])
  assert.deepEqual(currentCompletionIds(merged, '2026-09-09'), ['ex-existing'])
})

test('writing v3 state leaves legacy keys untouched', () => {
  const storage = memoryStorage({ 'profile-conditions': ['legacy-condition'], 'profile-done-exercises': ['legacy-exercise'] })
  saveWorkspace(storage, createBlankWorkspace())
  assert.deepEqual(storage.values.get('profile-conditions'), ['legacy-condition'])
  assert.deepEqual(storage.values.get('profile-done-exercises'), ['legacy-exercise'])
})

test('v2 state migrates once into the current local date without rewriting v2', () => {
  const legacy = {
    version: 2,
    selectedConditionIds: ['cond-a'],
    completedExerciseIds: ['ex-a', 'ex-a'],
  }
  const storage = memoryStorage({ [LEGACY_WORKSPACE_KEY]: legacy })
  const loaded = loadWorkspace(storage, '2026-09-09')
  assert.equal(loaded.version, 3)
  assert.equal(loaded.selectedSplitId, DEFAULT_SPLIT_ID)
  assert.equal(loaded.selectedSportTrackId, '')
  assert.deepEqual(loaded.selectedConditionIds, ['cond-a'])
  assert.deepEqual(currentCompletionIds(loaded, '2026-09-09'), ['ex-a'])
  assert.deepEqual(storage.values.get(LEGACY_WORKSPACE_KEY), legacy)
  assert.deepEqual(storage.values.get(WORKSPACE_KEY), loaded)
})

test('completion is date-scoped and template changes do not affect it', () => {
  const initial = createBlankWorkspace()
  const completed = withExerciseCompletion(initial, 'ex-a', true, '2026-09-09')
  const switched = { ...completed, selectedSplitId: 'split-upper-lower', selectedSportTrackId: 'hyrox' }
  assert.deepEqual(currentCompletionIds(switched, '2026-09-09'), ['ex-a'])
  assert.deepEqual(currentCompletionIds(switched, '2026-09-10'), [])
})

test('completion retention keeps the most recent 28 natural dates', () => {
  const entries = Object.fromEntries(Array.from({ length: 31 }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return [`2026-08-${day}`, [`ex-${day}`]]
  }))
  const pruned = pruneCompletionByDate(entries)
  assert.equal(Object.keys(pruned).length, 28)
  assert.equal(pruned['2026-08-01'], undefined)
  assert.deepEqual(pruned['2026-08-31'], ['ex-31'])
})

test('completion retention rejects impossible calendar dates', () => {
  const pruned = pruneCompletionByDate({
    '2026-02-28': ['valid'],
    '2026-02-29': ['not-a-leap-day'],
    '2026-13-01': ['invalid-month'],
    '2024-02-29': ['valid-leap-day'],
  })
  assert.deepEqual(pruned, {
    '2024-02-29': ['valid-leap-day'],
    '2026-02-28': ['valid'],
  })
})
