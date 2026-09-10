export function resolveSelectedSplit(splits, selectedId, defaultId) {
  const list = Array.isArray(splits) ? splits : []
  return list.find((item) => item.id === selectedId)
    || list.find((item) => item.id === defaultId)
    || list[0]
    || null
}

export function splitDayForWeekday(split, weekday) {
  if (!split || !Array.isArray(split.days)) return null
  return split.days.find((day) => day.weekday === weekday) || null
}

const UPPER_FOCUS = /胸|背|肩|手臂|上肢|推|拉/
const LOWER_FOCUS = /腿|下肢|蹲|髋/
const UPPER_REGIONS = /thoracic|scapula|shoulder|neck|elbow|chest/
const LOWER_REGIONS = /ankle|knee|hip|pelvis|lumbar/

function focusArea(focus = '') {
  if (focus.includes('全身')) return 'all'
  if (UPPER_FOCUS.test(focus)) return 'upper'
  if (LOWER_FOCUS.test(focus)) return 'lower'
  return 'all'
}

function conditionMatchesArea(condition, area) {
  if (area === 'all') return true
  const regionText = (condition.regions || []).join(' ')
  return area === 'upper' ? UPPER_REGIONS.test(regionText) : LOWER_REGIONS.test(regionText)
}

function uniqueStrings(items) {
  return [...new Set(items.filter((item) => typeof item === 'string' && item.length > 0))]
}

export function trainingDayExerciseGroups({
  conditions = [],
  selectedConditionIds = [],
  day,
  personalLimit = 3,
} = {}) {
  const preparationIds = uniqueStrings(day?.supportExerciseIds || [])
  if (!day || day.isRest) return { preparationIds: [], personalRehabIds: [], allIds: [] }

  const selectedSet = new Set(selectedConditionIds)
  const area = focusArea(day.focus)
  const relevantConditions = conditions.filter((condition) =>
    selectedSet.has(condition.id) && conditionMatchesArea(condition, area))
  const candidates = uniqueStrings([
    ...relevantConditions.flatMap((condition) => condition.rehabExercises || []),
    ...relevantConditions.flatMap((condition) => condition.prevention || []),
  ])
  const preparationSet = new Set(preparationIds)
  const limit = Math.max(0, Math.trunc(Number.isFinite(personalLimit) ? personalLimit : 3))
  const personalRehabIds = candidates.filter((id) => !preparationSet.has(id)).slice(0, limit)
  return {
    preparationIds,
    personalRehabIds,
    allIds: [...preparationIds, ...personalRehabIds],
  }
}

export function sportModuleSuggestion(track, rotationIndex = 0) {
  if (!track || !Array.isArray(track.modules) || !track.modules.length) return null
  const candidates = track.id === 'fitness'
    ? track.modules.filter((module) => module.priority === 'primary')
    : track.modules
  if (!candidates.length) return null
  const normalizedIndex = Math.abs(Number.isFinite(rotationIndex) ? Math.trunc(rotationIndex) : 0)
  return candidates[normalizedIndex % candidates.length]
}

export function weekRotationIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1)
  const dayOffset = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000)
  return Math.floor((dayOffset + start.getDay()) / 7)
}
