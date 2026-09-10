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
