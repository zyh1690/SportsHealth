<template>
  <view v-if="condition" class="detail-page">
    <view class="detail-main">
      <view class="condition-header">
        <view class="header-copy">
          <text class="condition-title">{{ condition.name }}</text>
          <text class="condition-aliases">{{ condition.aliases?.slice(0, 3).join(' · ') }}</text>
          <view class="tag-row"><text v-for="tag in condition.tags" :key="tag">{{ tag }}</text></view>
        </view>
        <view class="follow-button" :class="{ selected: selectedSet.has(condition.id) }" @tap="toggleCondition(condition.id)">
          <PhCheck v-if="selectedSet.has(condition.id)" :size="17" weight="bold" />
          <PhPlus v-else :size="17" weight="bold" />
          {{ selectedSet.has(condition.id) ? '已关注' : '加入关注' }}
        </view>
      </view>

      <view class="safety-note red-flags">
        <view class="red-title"><PhWarning :size="19" weight="fill" /> 先看何时需要就医</view>
        <text v-for="item in condition.redFlags" :key="item">{{ item }}</text>
      </view>

      <view class="content-grid">
        <view class="main-column">
          <view class="detail-section">
            <text class="detail-heading">了解它</text>
            <text class="body-copy">{{ condition.description }}</text>
          </view>
          <view class="detail-section">
            <text class="detail-heading">常见表现</text>
            <text class="body-copy">{{ condition.symptoms }}</text>
          </view>

          <view v-if="condition.selfTest?.exists" class="detail-section self-check surface-card">
            <view class="self-head"><PhClipboardText :size="21" weight="duotone" /><view><text class="detail-heading">自我观察</text><text class="self-note">只用于记录差异，不用于自行确诊</text></view></view>
            <view v-for="(step, index) in condition.selfTest.steps" :key="step" class="self-step">
              <text>{{ index + 1 }}</text><view>{{ step }}</view>
            </view>
          </view>
        </view>

        <view v-if="relationEdges.length" class="chain-column">
          <view class="detail-section chain-section">
            <text class="detail-heading">相关观察</text>
            <text class="section-note">关系带有依据状态，不表示已确认因果</text>
            <ChainMap :edges="relationEdges" :selected-ids="relationIds" />
          </view>
        </view>
      </view>

      <view class="detail-section">
        <view class="exercise-heading">
          <view><text class="detail-heading">练习与日常维护</text><text class="section-note">重复动作已合并，并保留用途</text></view>
          <text>{{ exerciseItems.length }} 个动作</text>
        </view>
        <ExerciseCard
          v-for="item in exerciseItems"
          :key="item.id"
          :exercise="item.exercise"
          :role="item.role"
          trackable
          :done="completedSet.has(item.id)"
          @update:done="toggleExercise(item.id, $event)"
        />
      </view>

      <view class="legal-note">本页用于一般运动教育与自我记录，不构成诊断或治疗建议。</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { PhCheck, PhClipboardText, PhPlus, PhWarning } from '@phosphor-icons/vue'
import ChainMap from '../../components/ChainMap.vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import { conditionExerciseRoles, getCondition, getExercise } from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'

const condition = ref(null)
const { selectedSet, completedSet, toggleCondition, toggleExercise } = useWorkspace()
const relationEdges = computed(() => {
  if (!condition.value) return []
  return [
    ...(condition.value.upstreamCauses || []).map((link) => ({ from: link.conditionId, to: condition.value.id, note: link.note, status: link.status, reference: link.reference })),
    ...(condition.value.downstreamSymptoms || []).map((link) => ({ from: condition.value.id, to: link.conditionId, note: link.note, status: link.status, reference: link.reference })),
  ]
})
const relationIds = computed(() => {
  const ids = new Set([condition.value?.id])
  relationEdges.value.forEach((edge) => { ids.add(edge.from); ids.add(edge.to) })
  return [...ids].filter(Boolean)
})
const exerciseItems = computed(() => conditionExerciseRoles(condition.value).map((item) => ({ ...item, exercise: getExercise(item.id) })).filter((item) => item.exercise))

onLoad((options) => { condition.value = getCondition(options.id) || null })
</script>

<style scoped>
.detail-page { min-height: 100vh; background: var(--color-bg); }
.detail-main { width: min(100%, 1040px); margin: 0 auto; padding: 22px 18px 64px; }
.condition-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.header-copy { min-width: 0; }
.condition-title { display: block; color: var(--color-text); font-size: clamp(27px, 6vw, 40px); line-height: 1.18; font-weight: 820; letter-spacing: -0.035em; }
.condition-aliases { display: block; margin-top: 7px; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.tag-row { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.tag-row text { padding: 5px 9px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 999px; font-size: 10px; font-weight: 650; }
.follow-button { min-height: 44px; padding: 0 12px; display: flex; align-items: center; gap: 6px; flex: 0 0 auto; color: var(--color-teal-700); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 14px; font-size: 11px; font-weight: 720; }
.follow-button.selected { color: #fff; background: var(--color-teal-700); border-color: var(--color-teal-700); }
.red-flags { margin-top: 20px; }
.red-title { margin-bottom: 6px; display: flex; align-items: center; gap: 7px; font-weight: 760; }
.red-flags > text { display: block; margin-top: 3px; }
.content-grid { display: grid; gap: 4px; }
.detail-section { margin-top: 28px; }
.detail-heading { display: block; color: var(--color-text); font-size: 19px; font-weight: 780; letter-spacing: -0.02em; }
.body-copy { display: block; margin-top: 9px; color: var(--color-text-secondary); font-size: 14px; line-height: 1.75; }
.self-check { padding: 17px; }
.self-head { display: flex; align-items: flex-start; gap: 9px; color: var(--color-teal-700); }
.self-note { display: block; margin-top: 2px; color: var(--color-text-muted); font-size: 10px; }
.self-step { margin-top: 13px; display: flex; align-items: flex-start; gap: 10px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.self-step > text { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex: 0 0 24px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 50%; font-size: 10px; font-weight: 800; }
.exercise-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.exercise-heading > text { color: var(--color-teal-700); font-size: 11px; font-weight: 700; }

@media (min-width: 860px) {
  .detail-main { padding: 38px 30px 80px; }
  .content-grid { grid-template-columns: minmax(0, 0.8fr) minmax(420px, 1.2fr); gap: 28px; align-items: start; }
}
</style>
