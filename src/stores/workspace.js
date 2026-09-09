import { computed, ref } from 'vue'
import {
  WORKSPACE_VERSION,
  addExampleConditions,
  createBlankWorkspace,
  loadWorkspace,
  saveWorkspace,
} from './workspace-core.mjs'

const selectedConditionIds = ref([])
const completedExerciseIds = ref([])
const ready = ref(false)

const storage = {
  getItem(key) {
    return uni.getStorageSync(key)
  },
  setItem(key, value) {
    uni.setStorageSync(key, value)
  },
}

function snapshot() {
  return {
    version: WORKSPACE_VERSION,
    selectedConditionIds: [...selectedConditionIds.value],
    completedExerciseIds: [...completedExerciseIds.value],
  }
}

function persist() {
  saveWorkspace(storage, snapshot())
}

function initWorkspace() {
  if (ready.value) return
  const saved = loadWorkspace(storage)
  selectedConditionIds.value = saved.selectedConditionIds
  completedExerciseIds.value = saved.completedExerciseIds
  ready.value = true
}

function toggleCondition(id) {
  initWorkspace()
  selectedConditionIds.value = selectedConditionIds.value.includes(id)
    ? selectedConditionIds.value.filter((item) => item !== id)
    : [...selectedConditionIds.value, id]
  persist()
}

function toggleExercise(id, completed) {
  initWorkspace()
  const exists = completedExerciseIds.value.includes(id)
  const next = completed === undefined ? !exists : completed
  if (next === exists) return
  completedExerciseIds.value = next
    ? [...completedExerciseIds.value, id]
    : completedExerciseIds.value.filter((item) => item !== id)
  persist()
}

function loadExample() {
  initWorkspace()
  const example = addExampleConditions(snapshot())
  selectedConditionIds.value = example.selectedConditionIds
  completedExerciseIds.value = example.completedExerciseIds
  persist()
}

function clearWorkspace() {
  const blank = createBlankWorkspace()
  selectedConditionIds.value = blank.selectedConditionIds
  completedExerciseIds.value = blank.completedExerciseIds
  ready.value = true
  persist()
}

export function useWorkspace() {
  initWorkspace()
  return {
    selectedConditionIds,
    completedExerciseIds,
    selectedSet: computed(() => new Set(selectedConditionIds.value)),
    completedSet: computed(() => new Set(completedExerciseIds.value)),
    toggleCondition,
    toggleExercise,
    loadExample,
    clearWorkspace,
  }
}
