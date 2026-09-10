<template>
  <view class="workspace-page">
    <view class="workspace-main">
      <view class="page-header training-header">
        <view>
          <text class="page-title">训练</text>
          <text class="page-subtitle">选择适合当前节奏的训练结构，再按目标补充专项运动能力。</text>
        </view>
        <view class="progress-pill"><PhCheckCircle :size="17" weight="fill" /> 今日 {{ completedExerciseIds.length }}</view>
      </view>

      <view class="segmented-control training-tabs">
        <view v-for="tab in tabs" :key="tab.id" class="segmented-item" :class="{ active: mode === tab.id }" @tap="mode = tab.id">{{ tab.label }}</view>
      </view>

      <view v-if="mode === 'today'" class="training-view">
        <view v-if="todayDay && !todayDay.isRest" class="session-summary surface-card">
          <view class="summary-icon"><PhCalendarCheck :size="28" weight="duotone" /></view>
          <view class="summary-copy">
            <text class="summary-kicker">{{ selectedSplit.shortName }} · {{ todayDay.day }}</text>
            <text class="summary-title">{{ todayDay.focus }}</text>
            <text class="summary-count">{{ todayActionSummary }}</text>
            <text class="summary-note">{{ todayDay.target }}</text>
          </view>
        </view>
        <view v-else class="empty-state rest-state">
          <text class="empty-state-title">{{ todayDay?.day || '今天' }}是恢复日</text>
          <text class="empty-state-copy">{{ todayDay?.target || '可以轻松走动、补充睡眠，或回看动作库。' }}</text>
          <view class="secondary-button" @tap="mode = 'library'">打开动作库</view>
        </view>

        <template v-if="todayDay && !todayDay.isRest">
          <view class="section-heading"><view><text class="section-title">训练日准备</text><text class="section-note">只保留与今天训练主题直接相关的准备动作</text></view></view>
          <ExerciseCard
            v-for="exercise in todayPreparationExercises"
            :key="exercise.id"
            :exercise="exercise"
            trackable
            :done="completedSet.has(exercise.id)"
            @update:done="toggleExercise(exercise.id, $event)"
          />
          <template v-if="todayPersonalRehabExercises.length">
            <view class="section-heading rehab-heading"><view><text class="section-title">个人康复任务</text><text class="section-note">按今天的训练部位筛选 · 每天最多 3 项 · 不计入热身</text></view></view>
            <ExerciseCard
              v-for="exercise in todayPersonalRehabExercises"
              :key="exercise.id"
              :exercise="exercise"
              role="个人康复"
              trackable
              :done="completedSet.has(exercise.id)"
              @update:done="toggleExercise(exercise.id, $event)"
            />
          </template>
        </template>
      </view>

      <view v-else-if="mode === 'splits'" class="training-view">
        <view class="section-heading compact-heading"><view><text class="section-title">选择训练分化</text><text class="section-note">结构是可调整的参考，不是固定重量处方</text></view></view>
        <view class="split-selector">
          <view
            v-for="split in db.trainingSplits"
            :key="split.id"
            class="split-card"
            :class="{ active: selectedSplit.id === split.id }"
            @tap="chooseSplit(split.id)"
          >
            <view class="split-card-top"><text>{{ split.shortName }}</text><PhCheckCircle v-if="selectedSplit.id === split.id" :size="18" weight="fill" /></view>
            <text class="split-frequency">{{ split.frequency }}</text>
            <text v-if="split.id === db.defaultSplitId" class="default-tag">默认</text>
          </view>
        </view>

        <view class="split-overview surface-card">
          <view class="overview-top">
            <view><text class="overview-kicker">当前结构</text><text class="overview-title">{{ selectedSplit.name }}</text></view>
            <text class="overview-frequency">{{ selectedSplit.frequency }}</text>
          </view>
          <text class="overview-summary">{{ selectedSplit.summary }}</text>
          <view class="overview-grid">
            <view><text class="guidance-label">适合谁</text><text class="guidance-copy">{{ selectedSplit.audience }}</text></view>
            <view><text class="guidance-label">恢复要求</text><text class="guidance-copy">{{ selectedSplit.recovery }}</text></view>
          </view>
          <view class="pros-cons">
            <view class="info-list"><text class="guidance-label">优势</text><text v-for="item in selectedSplit.advantages" :key="item">{{ item }}</text></view>
            <view class="info-list"><text class="guidance-label">需要留意</text><text v-for="item in selectedSplit.tradeoffs" :key="item">{{ item }}</text></view>
          </view>
        </view>

        <view class="split-plan-layout">
          <view class="day-selector">
            <view
              v-for="day in orderedDays"
              :key="day.weekday"
              class="day-card"
              :class="{ active: selectedDay.weekday === day.weekday, rest: day.isRest }"
              @tap="selectedWeekday = day.weekday"
            >
              <view><text class="day-name">{{ day.day }}</text><text class="day-split">{{ day.focus }}</text></view>
              <text class="day-count">{{ day.isRest ? '恢复' : `${countDayExercises(day)} 项` }}</text>
            </view>
          </view>
          <view class="day-detail">
            <view class="day-detail-head surface-card">
              <text class="day-detail-title">{{ selectedDay.day }} · {{ selectedDay.focus }}</text>
              <text class="day-detail-copy">{{ selectedDay.target }}</text>
              <text v-if="selectedDay.postNote" class="day-detail-assumption">{{ selectedDay.postNote }}</text>
            </view>
            <template v-if="!selectedDay.isRest">
              <view class="section-heading"><view><text class="section-title">准备与功能支持</text><text class="section-note">主训练重量、组数和动作按个人情况安排</text></view></view>
              <ExerciseCard
                v-for="exercise in exercisesForDay(selectedDay)"
                :key="exercise.id"
                :exercise="exercise"
                trackable
                :done="completedSet.has(exercise.id)"
                @update:done="toggleExercise(exercise.id, $event)"
              />
            </template>
          </view>
        </view>
      </view>

      <view v-else-if="mode === 'sport'" class="training-view">
        <view class="section-heading compact-heading"><view><text class="section-title">专项功能训练</text><text class="section-note">选择一个当前目标；其它专区仍可浏览</text></view></view>
        <view class="track-selector">
          <view
            v-for="track in db.functionalTracks"
            :key="track.id"
            class="track-card"
            :class="{ active: activeTrack.id === track.id }"
            @tap="openTrack(track.id)"
          >
            <view class="track-icon"><PhBarbell :size="21" weight="duotone" /></view>
            <view><text class="track-name">{{ track.name }}</text><text class="track-tagline">{{ track.tagline }}</text></view>
          </view>
        </view>

        <view class="track-overview surface-card">
          <view class="track-overview-top">
            <view><text class="overview-kicker">专项说明</text><text class="overview-title">{{ activeTrack.name }}</text></view>
            <view class="track-choice" :class="{ selected: selectedSportTrackId === activeTrack.id }" @tap="setSelectedSportTrack(activeTrack.id)">
              <PhCheckCircle :size="17" :weight="selectedSportTrackId === activeTrack.id ? 'fill' : 'regular'" />
              {{ selectedSportTrackId === activeTrack.id ? '当前目标' : '设为当前' }}
            </view>
          </view>
          <text class="overview-summary">{{ activeTrack.description }}</text>
          <text class="track-audience">适合：{{ activeTrack.audience }}</text>
        </view>

        <view class="module-selector">
          <view
            v-for="module in activeTrack.modules"
            :key="module.id"
            class="module-card"
            :class="{ active: activeModule.id === module.id, optional: module.priority === 'optional' }"
            @tap="activeModuleId = module.id"
          >
            <view class="module-code">{{ module.code }}</view>
            <view class="module-card-copy"><text>{{ module.name }}</text><text>{{ module.duration }} · {{ module.priority === 'optional' ? '可选补充' : '优先推荐' }}</text></view>
          </view>
        </view>

        <view class="module-intro surface-card">
          <view class="module-intro-top"><view><text class="overview-kicker">{{ activeModule.code }} 模块</text><text class="overview-title">{{ activeModule.name }}</text></view><text class="priority-tag" :class="activeModule.priority">{{ priorityLabel(activeModule.priority) }}</text></view>
          <text class="overview-summary">{{ activeModule.purpose }}</text>
          <view class="module-meta-grid">
            <view><text>时长</text><view>{{ activeModule.duration }}</view></view>
            <view><text>频率</text><view>{{ activeModule.frequency }}</view></view>
            <view class="placement"><text>如何安排</text><view>{{ activeModule.placement }}</view></view>
          </view>
        </view>

        <view class="section-heading"><view><text class="section-title">动作与用途</text><text class="section-note">{{ activeModuleExercises.length }} 个动作 · 用途优先于堆数量</text></view></view>
        <view v-for="item in activeModuleExercises" :key="item.exerciseId" class="module-exercise">
          <view class="purpose-strip"><text>为什么做</text><view>{{ item.purpose }}</view></view>
          <ExerciseCard
            :exercise="item.exercise"
            trackable
            :done="completedSet.has(item.exerciseId)"
            @update:done="toggleExercise(item.exerciseId, $event)"
          />
        </view>
      </view>

      <view v-else class="training-view">
        <view class="library-toolbar">
          <view class="search-field surface-card">
            <PhMagnifyingGlass :size="19" />
            <input v-model="query" placeholder="搜索动作、用途或目标肌群" aria-label="搜索动作" />
            <view v-if="query" class="clear-search" @tap="query = ''"><PhX :size="16" /></view>
          </view>
          <view class="category-row">
            <view v-for="category in categories" :key="category.id" class="category-chip" :class="{ active: categoryId === category.id }" @tap="categoryId = category.id">{{ category.label }}</view>
          </view>
        </view>
        <view class="section-heading"><view><text class="section-title">动作库</text><text class="section-note">{{ filteredExercises.length }} 个动作 · 点击展开完整说明与来源</text></view></view>
        <view class="exercise-grid">
          <ExerciseCard
            v-for="exercise in filteredExercises"
            :key="exercise.id"
            :exercise="exercise"
            trackable
            :done="completedSet.has(exercise.id)"
            @update:done="toggleExercise(exercise.id, $event)"
          />
        </view>
      </view>

      <view class="legal-note">训练结构与剂量是保守参考，不是个体化处方。动作出现锐痛、明显肿胀、麻木、进行性无力或失控时应停止并寻求评估。</view>
    </view>
    <AppNav current="training" />
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { PhBarbell, PhCalendarCheck, PhCheckCircle, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import AppNav from '../../components/AppNav.vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import {
  db,
  exerciseIdsForPlanDay,
  exercisesForFunctionalModule,
  getExercise,
  selectedTrainingSplit,
  trainingSessionGroups,
  trainingDayForSplit,
} from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'

const tabs = [
  { id: 'today', label: '今日' },
  { id: 'splits', label: '分化计划' },
  { id: 'sport', label: '专项功能' },
  { id: 'library', label: '动作库' },
]
const categories = [
  { id: 'all', label: '全部' },
  { id: 'mobility', label: '活动度' },
  { id: 'stability', label: '稳定' },
  { id: 'activate', label: '控制' },
  { id: 'strength', label: '力量' },
  { id: 'power', label: '爆发' },
  { id: 'carry', label: '负重行走' },
]

const mode = ref('today')
const query = ref('')
const categoryId = ref('all')
const selectedWeekday = ref(new Date().getDay())
const activeTrackId = ref('')
const activeModuleId = ref('')
const {
  selectedConditionIds,
  selectedSplitId,
  selectedSportTrackId,
  completedExerciseIds,
  completedSet,
  toggleExercise,
  setSelectedSplit,
  setSelectedSportTrack,
} = useWorkspace()

const selectedSplit = computed(() => selectedTrainingSplit(selectedSplitId.value))
const todayDay = computed(() => trainingDayForSplit(selectedSplitId.value))
const orderedDays = computed(() => [1, 2, 3, 4, 5, 6, 0].map((weekday) => selectedSplit.value.days.find((day) => day.weekday === weekday)))
const selectedDay = computed(() => selectedSplit.value.days.find((day) => day.weekday === selectedWeekday.value) || selectedSplit.value.days[0])
const todayGroups = computed(() => trainingSessionGroups(selectedConditionIds.value, todayDay.value))
const todayPreparationExercises = computed(() => todayGroups.value.preparationIds.map(getExercise).filter(Boolean))
const todayPersonalRehabExercises = computed(() => todayGroups.value.personalRehabIds.map(getExercise).filter(Boolean))
const todayActionSummary = computed(() => {
  const preparationCount = todayPreparationExercises.value.length
  const rehabCount = todayPersonalRehabExercises.value.length
  return rehabCount ? `${preparationCount} 个准备 · ${rehabCount} 个个人康复` : `${preparationCount} 个准备动作`
})

const activeTrack = computed(() => db.functionalTracks.find((track) => track.id === activeTrackId.value) || db.functionalTracks[0])
const activeModule = computed(() => activeTrack.value.modules.find((module) => module.id === activeModuleId.value) || activeTrack.value.modules[0])
const activeModuleExercises = computed(() => exercisesForFunctionalModule(activeModule.value))

const exerciseUsageText = (() => {
  const usages = new Map()
  db.functionalTracks.forEach((track) => track.modules.forEach((module) => module.exercises.forEach((item) => {
    const text = `${track.name} ${module.name} ${item.purpose}`
    usages.set(item.exerciseId, `${usages.get(item.exerciseId) || ''} ${text}`)
  })))
  return usages
})()

const filteredExercises = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return db.exercises.filter((exercise) => {
    const categoryMatches = categoryId.value === 'all' || exercise.category === categoryId.value
    const text = [exercise.name, exercise.purpose, ...(exercise.targetMuscles || []), exerciseUsageText.get(exercise.id) || ''].join(' ').toLowerCase()
    return categoryMatches && (!keyword || text.includes(keyword))
  })
})

watch(activeTrack, (track) => {
  if (!track.modules.some((module) => module.id === activeModuleId.value)) activeModuleId.value = track.modules[0]?.id || ''
}, { immediate: true })

function exercisesForDay(day) { return exerciseIdsForPlanDay(day).map(getExercise).filter(Boolean) }
function countDayExercises(day) { return exercisesForDay(day).length }
function chooseSplit(id) {
  setSelectedSplit(id)
  selectedWeekday.value = new Date().getDay()
}
function openTrack(id) { activeTrackId.value = id }
function priorityLabel(priority) {
  return { primary: '优先推荐', secondary: '恢复补充', optional: '按需选择' }[priority] || '专项模块'
}

activeTrackId.value = selectedSportTrackId.value || db.functionalTracks[0]?.id || ''

onLoad((options) => {
  if (tabs.some((tab) => tab.id === options?.mode)) mode.value = options.mode
})
</script>

<style scoped>
.training-header { align-items: center; }
.progress-pill { min-height: 40px; padding: 0 11px; display: flex; align-items: center; gap: 6px; flex: 0 0 auto; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 13px; font-size: 11px; font-weight: 750; }
.training-tabs { overflow-x: auto; scrollbar-width: none; }
.training-tabs .segmented-item { min-width: 84px; flex: 1 0 auto; }
.training-view { margin-top: 18px; }
.compact-heading { margin-top: 0; }
.session-summary { padding: 18px; display: flex; align-items: center; gap: 14px; }
.summary-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex: 0 0 56px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 17px; }
.summary-copy { min-width: 0; }
.summary-kicker, .overview-kicker { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 740; }
.summary-title { display: block; margin-top: 3px; color: var(--color-text); font-size: 18px; font-weight: 780; }
.summary-count { display: block; margin-top: 4px; color: var(--color-teal-700); font-size: 11px; font-weight: 720; }
.summary-note { display: block; margin-top: 6px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.55; }
.rest-state { margin-top: 4px; }
.split-selector { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(138px, 42%); gap: 9px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
.split-card { min-height: 105px; padding: 13px; position: relative; color: var(--color-text); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 15px; }
.split-card.active { color: #fff; background: var(--color-teal-800); border-color: var(--color-teal-800); }
.split-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 14px; font-weight: 760; }
.split-frequency { display: block; margin-top: 7px; color: var(--color-text-muted); font-size: 10px; }
.split-card.active .split-frequency { color: #bdd6d2; }
.default-tag { position: absolute; left: 12px; bottom: 11px; padding: 3px 7px; color: var(--color-teal-700); background: var(--color-teal-100); border-radius: 999px; font-size: 9px; font-weight: 760; }
.split-overview, .track-overview, .module-intro { margin-top: 14px; padding: 18px; }
.overview-top, .track-overview-top, .module-intro-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.overview-title { display: block; margin-top: 4px; font-size: 19px; font-weight: 790; }
.overview-frequency { padding: 6px 9px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 999px; font-size: 10px; font-weight: 720; }
.overview-summary, .track-audience { display: block; margin-top: 10px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.65; }
.track-audience { color: var(--color-text-muted); }
.overview-grid, .pros-cons, .module-meta-grid { display: grid; gap: 12px; margin-top: 16px; }
.overview-grid > view, .pros-cons > view { padding: 13px; background: var(--color-surface-soft); border-radius: 12px; }
.guidance-label { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 760; }
.guidance-copy { display: block; margin-top: 6px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.6; }
.info-list > text:not(.guidance-label) { display: block; margin-top: 7px; padding-left: 12px; position: relative; color: var(--color-text-secondary); font-size: 11px; line-height: 1.55; }
.info-list > text:not(.guidance-label)::before { content: '•'; position: absolute; left: 0; color: var(--color-teal-500); }
.split-plan-layout { margin-top: 18px; }
.day-selector { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(132px, 40%); gap: 8px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
.day-card { min-height: 72px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 14px; }
.day-card.active { color: #fff; background: var(--color-teal-800); border-color: var(--color-teal-800); }
.day-card.rest:not(.active) { background: #f3f0e9; }
.day-name { display: block; color: var(--color-text-muted); font-size: 10px; }
.day-split { display: block; margin-top: 3px; color: var(--color-text); font-size: 13px; font-weight: 760; }
.day-count { color: var(--color-teal-700); font-size: 9px; font-weight: 700; }
.day-card.active .day-name, .day-card.active .day-count { color: #bdd6d2; }
.day-card.active .day-split { color: #fff; }
.day-detail { margin-top: 12px; }
.day-detail-head { padding: 17px; }
.day-detail-title { display: block; font-size: 18px; font-weight: 780; }
.day-detail-copy, .day-detail-assumption { display: block; margin-top: 7px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.day-detail-assumption { color: var(--color-text-muted); font-size: 10px; }
.track-selector { display: grid; gap: 9px; }
.track-card { min-height: 78px; padding: 13px; display: flex; align-items: center; gap: 12px; background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 15px; }
.track-card.active { border-color: var(--color-teal-500); box-shadow: 0 0 0 2px var(--color-teal-050); }
.track-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex: 0 0 44px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 13px; }
.track-name { display: block; font-size: 14px; font-weight: 760; }
.track-tagline { display: block; margin-top: 4px; color: var(--color-text-muted); font-size: 10px; line-height: 1.45; }
.track-choice { min-height: 44px; padding: 0 11px; display: flex; align-items: center; gap: 6px; flex: 0 0 auto; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 12px; font-size: 10px; font-weight: 720; }
.track-choice.selected { color: #fff; background: var(--color-teal-700); }
.module-selector { margin-top: 14px; display: grid; gap: 8px; }
.module-card { min-height: 68px; padding: 11px 12px; display: flex; align-items: center; gap: 11px; background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 14px; }
.module-card.optional { background: #f5f1e8; }
.module-card.active { border-color: var(--color-teal-500); }
.module-code { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex: 0 0 34px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 11px; font-size: 11px; font-weight: 800; }
.module-card.active .module-code { color: #fff; background: var(--color-teal-700); }
.module-card-copy > text { display: block; font-size: 12px; font-weight: 720; }
.module-card-copy > text + text { margin-top: 3px; color: var(--color-text-muted); font-size: 9px; font-weight: 600; }
.priority-tag { padding: 5px 8px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 999px; font-size: 9px; font-weight: 760; }
.priority-tag.optional { color: var(--color-amber-700); background: var(--color-amber-100); }
.module-meta-grid > view { padding: 11px; background: var(--color-surface-soft); border-radius: 11px; }
.module-meta-grid text { display: block; color: var(--color-text-muted); font-size: 9px; font-weight: 720; }
.module-meta-grid view view { margin-top: 4px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.5; }
.module-meta-grid .placement { grid-column: 1 / -1; }
.module-exercise { margin-bottom: 12px; }
.module-exercise :deep(.exercise-card) { margin-bottom: 0; border-top-left-radius: 0; border-top-right-radius: 0; }
.purpose-strip { padding: 10px 13px; display: flex; align-items: flex-start; gap: 9px; color: var(--color-text-secondary); background: var(--color-teal-050); border: 1px solid var(--border-soft); border-bottom: 0; border-radius: var(--radius-md) var(--radius-md) 0 0; font-size: 11px; line-height: 1.5; }
.purpose-strip text { flex: 0 0 auto; color: var(--color-teal-700); font-weight: 760; }
.library-toolbar { display: grid; gap: 10px; }
.search-field { min-height: 52px; padding: 0 15px; display: flex; align-items: center; gap: 10px; color: var(--color-teal-700); }
.search-field input { min-width: 0; height: 52px; flex: 1; color: var(--color-text); font-size: 14px; }
.clear-search { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
.category-row { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.category-chip { min-height: 44px; padding: 0 13px; display: flex; align-items: center; flex: 0 0 auto; color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 999px; font-size: 11px; font-weight: 680; }
.category-chip.active { color: #fff; background: var(--color-teal-700); border-color: var(--color-teal-700); }

@media (min-width: 720px) {
  .split-selector { grid-auto-flow: initial; grid-auto-columns: initial; grid-template-columns: repeat(5, minmax(0, 1fr)); overflow: visible; }
  .overview-grid, .pros-cons, .module-meta-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .split-plan-layout { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 20px; align-items: start; }
  .day-selector { grid-auto-flow: initial; grid-auto-columns: initial; grid-template-columns: 1fr; position: sticky; top: 28px; overflow: visible; }
  .day-detail { margin-top: 0; }
  .track-selector { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .module-selector { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .exercise-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .exercise-grid :deep(.exercise-card) { margin-bottom: 0; }
}

@media (max-width: 430px) {
  .split-selector { grid-auto-columns: minmax(132px, 46%); }
  .overview-top, .track-overview-top, .module-intro-top { flex-direction: column; }
  .overview-frequency { align-self: flex-start; }
  .track-choice { align-self: flex-start; }
}
</style>
