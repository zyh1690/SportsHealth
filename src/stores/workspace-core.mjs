export const WORKSPACE_VERSION = 2
export const WORKSPACE_KEY = `sportshealth:workspace:v${WORKSPACE_VERSION}`

export const EXAMPLE_CONDITION_IDS = [
  'cond-ankle-dorsiflex-right',
  'cond-pelvic-rotation',
  'cond-thoracic-shift-right',
  'cond-scapular-weakness-right',
  'cond-humeral-anterior-glide',
]

export function createBlankWorkspace() {
  return {
    version: WORKSPACE_VERSION,
    selectedConditionIds: [],
    completedExerciseIds: [],
  }
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item) => typeof item === 'string' && item.length > 0))]
}

export function normalizeWorkspace(value) {
  if (!value || value.version !== WORKSPACE_VERSION) return createBlankWorkspace()
  return {
    version: WORKSPACE_VERSION,
    selectedConditionIds: uniqueStrings(value.selectedConditionIds),
    completedExerciseIds: uniqueStrings(value.completedExerciseIds),
  }
}

export function addExampleConditions(workspace) {
  const normalized = normalizeWorkspace(workspace)
  return {
    ...normalized,
    selectedConditionIds: [...new Set([...normalized.selectedConditionIds, ...EXAMPLE_CONDITION_IDS])],
  }
}

export function loadWorkspace(storage) {
  try {
    return normalizeWorkspace(storage.getItem(WORKSPACE_KEY))
  } catch (_) {
    return createBlankWorkspace()
  }
}

export function saveWorkspace(storage, workspace) {
  const normalized = normalizeWorkspace(workspace)
  storage.setItem(WORKSPACE_KEY, normalized)
  return normalized
}
