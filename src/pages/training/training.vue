<template>
  <view class="workspace-page">
    <view class="workspace-main">
      <view class="page-header training-header">
        <view>
          <text class="page-title">训练</text>
          <text class="page-subtitle">把今天要做的、完整安排和动作说明放在一个地方。</text>
        </view>
        <view class="progress-pill"><PhCheckCircle :size="17" weight="fill" /> {{ completedExerciseIds.length }}/{{ db.exercises.length }}</view>
      </view>

      <view class="segmented-control">
        <view v-for="tab in tabs" :key="tab.id" class="segmented-item" :class="{ active: mode === tab.id }" @tap="mode = tab.id">{{ tab.label }}</view>
      </view>

      <view v-if="mode === 'today'" class="training-view">
        <view v-if="todayPlan" class="session-summary surface-card">
          <view class="summary-icon"><PhCalendarCheck :size="28" weight="duotone" /></view>
          <view class="summary-copy">
            <text class="summary-kicker">{{ todayPlan.day }}</text>
            <text class="summary-title">{{ todayPlan.split }}日 · {{ todayExercises.length }} 个动作</text>
            <text class="summary-note">{{ selectedConditionIds.length ? '先完成当前关注对应动作，再参考星期计划。' : '先用轻负荷确认动作舒适，再进入正式训练。' }}</text>
          </view>
        </view>
        <view v-else class="empty-state rest-state">
          <text class="empty-state-title">今天是恢复日</text>
          <text class="empty-state-copy">可以轻松走动、补充睡眠，或回看动作库。无需为了“补课”堆叠训练量。</text>
          <view class="secondary-button" @tap="mode = 'library'">打开动作库</view>
        </view>

        <template v-if="todayPlan">
          <view class="section-heading"><view><text class="section-title">今天的动作</text><text class="section-note">完成状态会同步到今日工作台</text></view></view>
          <ExerciseCard
            v-for="exercise in todayExercises"
            :key="exercise.id"
            :exercise="exercise"
            trackable
            :done="completedSet.has(exercise.id)"
            @update:done="toggleExercise(exercise.id, $event)"
          />
        </template>
      </view>

      <view v-else-if="mode === 'plan'" class="training-view plan-layout">
        <view class="day-selector">
          <view
            v-for="day in plan.days"
            :key="day.day"
            class="day-card"
            :class="{ active: selectedDay.day === day.day }"
            @tap="selectedDay = day"
          >
            <view><text class="day-name">{{ day.day }}</text><text class="day-split">{{ day.split }}日</text></view>
            <text class="day-count">{{ countDayExercises(day) }} 个动作</text>
          </view>
        </view>
        <view class="day-detail">
          <view class="day-detail-head surface-card">
            <text class="day-detail-title">{{ selectedDay.day }} · {{ selectedDay.split }}日</text>
            <text class="day-detail-meta">{{ plan.meta }}</text>
            <text class="day-detail-copy">{{ selectedDay.target }}</text>
            <text class="day-detail-assumption">{{ plan.assumption }}</text>
          </view>
          <view class="section-heading"><view><text class="section-title">准备与控制</text><text class="section-note">去重后的动作顺序</text></view></view>
          <ExerciseCard
            v-for="exercise in exercisesForDay(selectedDay)"
            :key="exercise.id"
            :exercise="exercise"
            trackable
            :done="completedSet.has(exercise.id)"
            @update:done="toggleExercise(exercise.id, $event)"
          />

          <view class="day-guidance-grid">
            <view class="guidance-card surface-card">
              <text class="guidance-label">训练后提醒</text>
              <text class="guidance-copy">{{ selectedDay.postNote }}</text>
            </view>
            <view class="guidance-card surface-card">
              <text class="guidance-label">当天有氧参考</text>
              <text class="guidance-copy">{{ selectedDay.cardio }}</text>
            </view>
          </view>

          <view class="section-heading"><view><text class="section-title">整周有氧与恢复</text><text class="section-note">保守参考，不是固定处方</text></view></view>
          <view class="cardio-guide surface-card">
            <text class="cardio-title">{{ plan.cardio.title }}</text>
            <view v-for="item in plan.cardio.principles" :key="item" class="guide-line"><text>•</text><view>{{ item }}</view></view>
            <view class="weekly-grid">
              <view v-for="item in plan.cardio.weekly" :key="item.day" class="weekly-row"><text>{{ item.day }}</text><view>{{ item.plan }}</view></view>
            </view>
            <view class="guide-tips">
              <text class="guidance-label">调整提示</text>
              <view v-for="item in plan.cardio.tips" :key="item" class="guide-line"><text>•</text><view>{{ item }}</view></view>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="training-view">
        <view class="library-toolbar">
          <view class="search-field surface-card">
            <PhMagnifyingGlass :size="19" />
            <input v-model="query" placeholder="搜索动作或目标肌群" aria-label="搜索动作" />
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

      <view class="legal-note">剂量是保守的建议起点，不是处方。动作出现锐痛、明显肿胀、麻木或进行性无力时应停止并寻求评估。</view>
    </view>
    <AppNav current="training" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PhCalendarCheck, PhCheckCircle, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import AppNav from '../../components/AppNav.vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import { currentSessionExerciseIds, db, exerciseIdsForPlanDay, getExercise } from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'
import plan from '../../../content/plan.json'

const tabs = [{ id: 'today', label: '今日' }, { id: 'plan', label: '完整计划' }, { id: 'library', label: '动作库' }]
const categories = [{ id: 'all', label: '全部' }, { id: 'mobility', label: '活动度' }, { id: 'stability', label: '稳定' }, { id: 'activate', label: '控制' }, { id: 'strength', label: '力量' }]
const mode = ref('today')
const query = ref('')
const categoryId = ref('all')
const todayIndex = new Date().getDay()
const todayPlan = todayIndex === 0 ? null : plan.days[todayIndex - 1]
const selectedDay = ref(todayPlan || plan.days[0])
const { selectedConditionIds, completedExerciseIds, completedSet, toggleExercise } = useWorkspace()

function exercisesForDay(day) {
  return exerciseIdsForPlanDay(day).map(getExercise).filter(Boolean)
}
function countDayExercises(day) { return exercisesForDay(day).length }
const todayExercises = computed(() => {
  if (!todayPlan) return []
  return currentSessionExerciseIds(selectedConditionIds.value, todayPlan).map(getExercise).filter(Boolean)
})
const filteredExercises = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return db.exercises.filter((exercise) => {
    const categoryMatches = categoryId.value === 'all' || exercise.category === categoryId.value
    const text = [exercise.name, exercise.purpose, ...(exercise.targetMuscles || [])].join(' ').toLowerCase()
    return categoryMatches && (!keyword || text.includes(keyword))
  })
})
</script>

<style scoped>
.training-header { align-items: center; }
.progress-pill { min-height: 40px; padding: 0 11px; display: flex; align-items: center; gap: 6px; flex: 0 0 auto; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 13px; font-size: 11px; font-weight: 750; }
.training-view { margin-top: 18px; }
.session-summary { padding: 18px; display: flex; align-items: center; gap: 14px; }
.summary-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex: 0 0 56px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 17px; }
.summary-copy { min-width: 0; }
.summary-kicker { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 740; }
.summary-title { display: block; margin-top: 3px; color: var(--color-text); font-size: 18px; font-weight: 780; }
.summary-note { display: block; margin-top: 6px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.55; }
.rest-state { margin-top: 4px; }
.day-selector { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.day-card { min-height: 74px; padding: 13px; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 14px; }
.day-card.active { color: #fff; background: var(--color-teal-800); border-color: var(--color-teal-800); }
.day-name { display: block; color: var(--color-text-muted); font-size: 10px; }
.day-split { display: block; margin-top: 3px; color: var(--color-text); font-size: 14px; font-weight: 760; }
.day-count { color: var(--color-teal-700); font-size: 9px; font-weight: 700; }
.day-card.active .day-name, .day-card.active .day-count { color: #bdd6d2; }
.day-card.active .day-split { color: #fff; }
.day-detail { margin-top: 14px; }
.day-detail-head { padding: 17px; }
.day-detail-title { display: block; font-size: 18px; font-weight: 780; }
.day-detail-meta { display: block; margin-top: 4px; color: var(--color-teal-700); font-size: 11px; font-weight: 680; }
.day-detail-copy { display: block; margin-top: 7px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.day-detail-assumption { display: block; margin-top: 8px; color: var(--color-text-muted); font-size: 10px; line-height: 1.55; }
.day-guidance-grid { display: grid; gap: 10px; margin-top: 14px; }
.guidance-card { padding: 15px; }
.guidance-label { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 760; }
.guidance-copy { display: block; margin-top: 6px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.cardio-guide { padding: 17px; }
.cardio-title { display: block; font-size: 16px; font-weight: 770; }
.guide-line { margin-top: 9px; display: flex; align-items: flex-start; gap: 8px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.guide-line > text { color: var(--color-teal-500); }
.weekly-grid { margin-top: 15px; display: grid; gap: 7px; }
.weekly-row { padding: 10px 11px; display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 9px; background: var(--color-surface-soft); border-radius: 11px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.5; }
.weekly-row > text { color: var(--color-teal-700); font-weight: 740; }
.guide-tips { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-soft); }
.library-toolbar { display: grid; gap: 10px; }
.search-field { min-height: 52px; padding: 0 15px; display: flex; align-items: center; gap: 10px; color: var(--color-teal-700); }
.search-field input { min-width: 0; height: 52px; flex: 1; color: var(--color-text); font-size: 14px; }
.clear-search { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
.category-row { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.category-chip { min-height: 44px; padding: 0 13px; display: flex; align-items: center; flex: 0 0 auto; color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 999px; font-size: 11px; font-weight: 680; }
.category-chip.active { color: #fff; background: var(--color-teal-700); border-color: var(--color-teal-700); }

@media (min-width: 720px) {
  .plan-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 22px; align-items: start; }
  .day-selector { grid-template-columns: 1fr; position: sticky; top: 28px; }
  .day-detail { margin-top: 0; }
  .day-guidance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .exercise-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .exercise-grid :deep(.exercise-card) { margin-bottom: 0; }
}
</style>
