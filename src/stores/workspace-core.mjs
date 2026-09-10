export const WORKSPACE_VERSION = 3
export const WORKSPACE_KEY = `sportshealth:workspace:v${WORKSPACE_VERSION}`
export const LEGACY_WORKSPACE_KEY = 'sportshealth:workspace:v2'
export const DEFAULT_SPLIT_ID = 'split-chest-legs-back'
export const COMPLETION_RETENTION_DAYS = 28

export const EXAMPLE_CONDITION_IDS = [
  'cond-ankle-dorsiflex-right',
  'cond-pelvic-rotation',
  'cond-thoracic-shift-right',
  'cond-scapular-weakness-right',
  'cond-humeral-anterior-glide',
]

function uniqueStrings(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item) => typeof item === 'string' && item.length > 0))]
}

function isDateKey(value) {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function pruneCompletionByDate(value, limit = COMPLETION_RETENTION_DAYS) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const keys = Object.keys(value).filter(isDateKey).sort().slice(-limit)
  return Object.fromEntries(keys.map((key) => [key, uniqueStrings(value[key])]))
}

export function createBlankWorkspace() {
  return {
    version: WORKSPACE_VERSION,
    selectedConditionIds: [],
    selectedSplitId: DEFAULT_SPLIT_ID,
    selectedSportTrackId: '',
    completionByDate: {},
  }
}

export function normalizeWorkspace(value) {
  if (!value || value.version !== WORKSPACE_VERSION) return createBlankWorkspace()
  return {
    version: WORKSPACE_VERSION,
    selectedConditionIds: uniqueStrings(value.selectedConditionIds),
    selectedSplitId: typeof value.selectedSplitId === 'string' && value.selectedSplitId
      ? value.selectedSplitId
      : DEFAULT_SPLIT_ID,
    selectedSportTrackId: typeof value.selectedSportTrackId === 'string'
      ? value.selectedSportTrackId
      : '',
    completionByDate: pruneCompletionByDate(value.completionByDate),
  }
}

function normalizeLegacyWorkspace(value) {
  if (!value || value.version !== 2) return null
  return {
    selectedConditionIds: uniqueStrings(value.selectedConditionIds),
    completedExerciseIds: uniqueStrings(value.completedExerciseIds),
  }
}

export function migrateV2Workspace(value, dateKey = localDateKey()) {
  const legacy = normalizeLegacyWorkspace(value)
  if (!legacy) return createBlankWorkspace()
  return normalizeWorkspace({
    version: WORKSPACE_VERSION,
    selectedConditionIds: legacy.selectedConditionIds,
    selectedSplitId: DEFAULT_SPLIT_ID,
    selectedSportTrackId: '',
    completionByDate: legacy.completedExerciseIds.length
      ? { [dateKey]: legacy.completedExerciseIds }
      : {},
  })
}

export function currentCompletionIds(workspace, dateKey = localDateKey()) {
  const normalized = normalizeWorkspace(workspace)
  return normalized.completionByDate[dateKey] || []
}

export function withExerciseCompletion(workspace, exerciseId, completed, dateKey = localDateKey()) {
  const normalized = normalizeWorkspace(workspace)
  const existing = currentCompletionIds(normalized, dateKey)
  const exists = existing.includes(exerciseId)
  const nextCompleted = completed === undefined ? !exists : completed
  if (nextCompleted === exists) return normalized
  const nextIds = nextCompleted
    ? [...existing, exerciseId]
    : existing.filter((id) => id !== exerciseId)
  return normalizeWorkspace({
    ...normalized,
    completionByDate: {
      ...normalized.completionByDate,
      [dateKey]: nextIds,
    },
  })
}

export function addExampleConditions(workspace) {
  const normalized = normalizeWorkspace(workspace)
  return {
    ...normalized,
    selectedConditionIds: [...new Set([...normalized.selectedConditionIds, ...EXAMPLE_CONDITION_IDS])],
  }
}

export function loadWorkspace(storage, dateKey = localDateKey()) {
  try {
    const current = storage.getItem(WORKSPACE_KEY)
    if (current && current.version === WORKSPACE_VERSION) return normalizeWorkspace(current)
    const legacy = normalizeLegacyWorkspace(storage.getItem(LEGACY_WORKSPACE_KEY))
    if (!legacy) return createBlankWorkspace()
    const migrated = migrateV2Workspace({ version: 2, ...legacy }, dateKey)
    storage.setItem(WORKSPACE_KEY, migrated)
    return migrated
  } catch (_) {
    return createBlankWorkspace()
  }
}

export function saveWorkspace(storage, workspace) {
  const normalized = normalizeWorkspace(workspace)
  storage.setItem(WORKSPACE_KEY, normalized)
  return normalized
}
