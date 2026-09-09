<template>
  <view class="workspace-page">
    <view class="workspace-main">
      <view class="page-header chain-header">
        <view>
          <text class="page-title">动力链</text>
          <text class="page-subtitle">把已知限制、可能的动作调整与相关表现放在同一条观察路径上。</text>
          <view class="local-note"><PhShieldCheck :size="15" weight="fill" /> 关联是整理线索，不是自动诊断</view>
        </view>
      </view>

      <view class="chain-actions">
        <view class="secondary-button" @tap="loadExample"><PhSparkle :size="17" weight="fill" /> 载入示例</view>
        <view v-if="selectedConditionIds.length" class="ghost-button" @tap="confirmClear"><PhTrash :size="17" /> 清空当前</view>
      </view>

      <view v-if="selectedConditions.length" class="selected-strip">
        <view v-for="condition in selectedConditions" :key="condition.id" class="selected-chip">
          <text>{{ condition.name }}</text>
          <view class="chip-remove" :aria-label="`移除${condition.name}`" @tap="toggleCondition(condition.id)"><PhX :size="13" weight="bold" /></view>
        </view>
        <view class="add-chip" @tap="goBody"><PhPlus :size="14" weight="bold" /> 添加</view>
      </view>

      <view class="section-heading">
        <view><text class="section-title">观察路径</text><text class="section-note">点击节点后，下方或右侧立即显示关系说明</text></view>
      </view>
      <ChainMap :edges="edges" :selected-ids="selectedConditionIds" />

      <template v-if="trainList.length">
        <view class="section-heading">
          <view><text class="section-title">关联训练清单</text><text class="section-note">已完成 {{ completedInList }} / {{ trainList.length }} · 已合并重复动作</text></view>
          <view class="training-link" @tap="goTraining">全部训练 <PhArrowRight :size="15" /></view>
        </view>
        <view class="progress-bar"><view :style="{ width: progressPercent + '%' }"></view></view>
        <ExerciseCard
          v-for="exercise in trainList"
          :key="exercise.id"
          :exercise="exercise"
          trackable
          :done="completedSet.has(exercise.id)"
          @update:done="toggleExercise(exercise.id, $event)"
        />
      </template>

      <view v-else-if="!selectedConditionIds.length" class="setup-card surface-card">
        <PhListChecks :size="30" weight="duotone" />
        <text class="setup-title">从你的真实关注开始</text>
        <text class="setup-copy">首次打开保持空白。你可以自己选择问题，或载入现有个人链作为示例再编辑。</text>
        <view class="primary-button" @tap="goBody">选择身体问题</view>
      </view>

      <view class="legal-note">动力链中的关系按“个人观察 / 资料支持 / 需验证”标注。跨部位相关不等于因果。</view>
    </view>
    <AppNav current="chain" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import {
  PhArrowRight,
  PhListChecks,
  PhPlus,
  PhShieldCheck,
  PhSparkle,
  PhTrash,
  PhX,
} from '@phosphor-icons/vue'
import AppNav from '../../components/AppNav.vue'
import ChainMap from '../../components/ChainMap.vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import { aggregateExerciseIds, chainEdges, getCondition, getExercise } from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'

const {
  selectedConditionIds,
  completedSet,
  toggleCondition,
  toggleExercise,
  loadExample,
  clearWorkspace,
} = useWorkspace()

const selectedConditions = computed(() => selectedConditionIds.value.map(getCondition).filter(Boolean))
const edges = computed(() => chainEdges(selectedConditionIds.value))
const trainList = computed(() => aggregateExerciseIds(selectedConditionIds.value).map(getExercise).filter(Boolean))
const completedInList = computed(() => trainList.value.filter((item) => completedSet.value.has(item.id)).length)
const progressPercent = computed(() => trainList.value.length ? Math.round((completedInList.value / trainList.value.length) * 100) : 0)

function goBody() { uni.reLaunch({ url: '/pages/body/body' }) }
function goTraining() { uni.reLaunch({ url: '/pages/training/training' }) }
function confirmClear() {
  uni.showModal({
    title: '清空当前工作台？',
    content: '将清空已关注问题和动作打卡；旧版本数据不会被修改。',
    confirmText: '清空',
    confirmColor: '#984d43',
    success: ({ confirm }) => { if (confirm) clearWorkspace() },
  })
}
</script>

<style scoped>
.chain-header { margin-bottom: 13px; }
.chain-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.selected-strip { margin-top: 14px; display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.selected-chip,
.add-chip { min-height: 44px; padding: 0 0 0 12px; display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 999px; font-size: 11px; font-weight: 680; }
.chip-remove { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.add-chip { padding: 0 14px; color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--border-soft); }
.training-link { min-height: 44px; display: flex; align-items: center; gap: 5px; color: var(--color-teal-700); font-size: 11px; font-weight: 720; }
.progress-bar { height: 7px; margin: -2px 0 13px; overflow: hidden; background: #dedfd9; border-radius: 999px; }
.progress-bar view { height: 100%; background: var(--color-teal-500); border-radius: 999px; transition: width 200ms ease; }
.setup-card { margin-top: 24px; padding: 28px 22px; display: flex; flex-direction: column; align-items: center; color: var(--color-teal-700); text-align: center; }
.setup-title { display: block; margin-top: 9px; color: var(--color-text); font-size: 19px; font-weight: 770; }
.setup-copy { display: block; max-width: 460px; margin: 7px 0 17px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
</style>
