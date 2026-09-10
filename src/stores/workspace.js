import { computed, ref } from 'vue'
import {
  WORKSPACE_VERSION,
  addExampleConditions,
  createBlankWorkspace,
  currentCompletionIds,
  loadWorkspace,
  localDateKey,
  normalizeWorkspace,
  saveWorkspace,
  withExerciseCompletion,
} from './workspace-core.mjs'

const selectedConditionIds = ref([])
const selectedSplitId = ref('')
const selectedSportTrackId = ref('')
const completionByDate = ref({})
const completedExerciseIds = ref([])
const ready = ref(false)
let activeDateKey = ''

const storage = {
  getItem(key) {
    return uni.getStorageSync(key)
  },
  setItem(key, value) {
    uni.setStorageSync(key, value)
  },
}

function snapshot() {
  const dateKey = activeDateKey || localDateKey()
  const datedCompletion = { ...completionByDate.value }
  if (completedExerciseIds.value.length) datedCompletion[dateKey] = [...completedExerciseIds.value]
  else delete datedCompletion[dateKey]
  return normalizeWorkspace({
    version: WORKSPACE_VERSION,
    selectedConditionIds: [...selectedConditionIds.value],
    selectedSplitId: selectedSplitId.value,
    selectedSportTrackId: selectedSportTrackId.value,
    completionByDate: datedCompletion,
  })
}

function applyWorkspace(workspace, dateKey = localDateKey()) {
  const normalized = normalizeWorkspace(workspace)
  selectedConditionIds.value = normalized.selectedConditionIds
  selectedSplitId.value = normalized.selectedSplitId
  selectedSportTrackId.value = normalized.selectedSportTrackId
  completionByDate.value = normalized.completionByDate
  activeDateKey = dateKey
  completedExerciseIds.value = currentCompletionIds(normalized, dateKey)
}

function persist() {
  const saved = saveWorkspace(storage, snapshot())
  completionByDate.value = saved.completionByDate
}

function initWorkspace() {
  if (ready.value) return
  const dateKey = localDateKey()
  applyWorkspace(loadWorkspace(storage, dateKey), dateKey)
  ready.value = true
}

function syncCurrentDate() {
  initWorkspace()
  const dateKey = localDateKey()
  if (dateKey === activeDateKey) return
  const saved = saveWorkspace(storage, snapshot())
  applyWorkspace(saved, dateKey)
}

function toggleCondition(id) {
  syncCurrentDate()
  selectedConditionIds.value = selectedConditionIds.value.includes(id)
    ? selectedConditionIds.value.filter((item) => item !== id)
    : [...selectedConditionIds.value, id]
  persist()
}

function toggleExercise(id, completed) {
  syncCurrentDate()
  const updated = withExerciseCompletion(snapshot(), id, completed, activeDateKey)
  applyWorkspace(updated, activeDateKey)
  persist()
}

function setSelectedSplit(id) {
  syncCurrentDate()
  if (!id || selectedSplitId.value === id) return
  selectedSplitId.value = id
  persist()
}

function setSelectedSportTrack(id) {
  syncCurrentDate()
  const next = typeof id === 'string' ? id : ''
  if (selectedSportTrackId.value === next) return
  selectedSportTrackId.value = next
  persist()
}

function loadExample() {
  syncCurrentDate()
  applyWorkspace(addExampleConditions(snapshot()), activeDateKey)
  persist()
}

function clearWorkspace() {
  const dateKey = localDateKey()
  applyWorkspace(createBlankWorkspace(), dateKey)
  ready.value = true
  persist()
}

export function useWorkspace() {
  syncCurrentDate()
  return {
    selectedConditionIds,
    selectedSplitId,
    selectedSportTrackId,
    completionByDate,
    completedExerciseIds,
    selectedSet: computed(() => new Set(selectedConditionIds.value)),
    completedSet: computed(() => new Set(completedExerciseIds.value)),
    toggleCondition,
    toggleExercise,
    setSelectedSplit,
    setSelectedSportTrack,
    loadExample,
    clearWorkspace,
    syncCurrentDate,
  }
}
