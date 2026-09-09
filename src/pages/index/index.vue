<template>
  <view class="workspace-page">
    <view class="workspace-main today-main">
      <view class="page-header today-header">
        <view>
          <text class="date-label">{{ dateLabel }}</text>
          <text class="page-title">今日工作台</text>
          <view class="local-note"><PhLockKey :size="14" weight="fill" /> 你的选择与打卡只保存在本机</view>
        </view>
        <view class="progress-ring" :style="progressStyle">
          <view class="progress-inner"><text>{{ progressPercent }}%</text></view>
        </view>
      </view>

      <view v-if="!selectedConditions.length" class="empty-state onboarding">
        <view class="onboarding-icon"><PhPersonArmsSpread :size="34" weight="duotone" /></view>
        <text class="empty-state-title">先建立你的关注清单</text>
        <text class="empty-state-copy">选择想跟踪的身体问题后，这里会整理下一步动作、训练进度和可能的动力链关联。</text>
        <view class="empty-actions">
          <view class="primary-button" @tap="goBody"><PhPlus :size="18" weight="bold" /> 选择身体问题</view>
          <view class="secondary-button" @tap="loadExample">载入示例</view>
        </view>
        <text class="example-note">示例仅用于演示整理方式；载入后仍可编辑，不代表你的身体情况。</text>
      </view>

      <template v-else>
        <view v-if="!isRecoveryDay && nextExercise" class="next-card surface-card">
          <view class="next-media">
            <image :src="assetUrl(nextExercise.image)" :alt="nextExercise.imageAlt" mode="aspectFill" />
            <view class="next-badge">下一步 · 约 {{ estimatedMinutes }} 分钟</view>
          </view>
          <view class="next-content">
            <text class="next-kicker">从一个动作开始</text>
            <text class="next-name">{{ nextExercise.name }}</text>
            <text class="next-purpose">{{ nextExercise.purpose }}</text>
            <view class="next-dose"><PhTimer :size="17" /> {{ nextExercise.dosage }}</view>
            <view class="next-actions">
              <view class="primary-button" @tap="toggleExercise(nextExercise.id, true)">
                <PhCheckCircle :size="19" weight="fill" /> 完成并继续
              </view>
              <view class="ghost-button" @tap="goTraining">查看动作</view>
            </view>
          </view>
        </view>

        <view v-else-if="isRecoveryDay" class="celebration surface-card">
          <PhMoonStars :size="38" weight="duotone" />
          <view><text class="celebration-title">今天以恢复为主</text><text class="celebration-copy">保留轻松活动和日常观察，不为了补课堆叠训练量。</text></view>
        </view>

        <view v-else class="celebration surface-card">
          <PhCheckCircle :size="38" weight="duotone" />
          <view><text class="celebration-title">当前清单已完成</text><text class="celebration-copy">今天可以专注恢复，或到“训练”里回看动作。</text></view>
        </view>

        <view class="today-grid">
          <view>
            <view class="section-heading">
              <view><text class="section-title">当前关注</text><text class="section-note">{{ selectedConditions.length }} 个问题 · 点击查看详情</text></view>
              <view class="text-action" @tap="goBody">编辑</view>
            </view>
            <view class="focus-list surface-card">
              <view v-for="condition in focusPreview" :key="condition.id" class="focus-row" @tap="goCondition(condition.id)">
                <view class="focus-marker"></view>
                <view class="focus-copy"><text class="focus-name">{{ condition.name }}</text><text class="focus-tag">{{ condition.tags?.[0] || '观察项' }}</text></view>
                <PhCaretRight :size="17" />
              </view>
              <view v-if="selectedConditions.length > focusPreview.length" class="focus-more" @tap="goBody">
                查看全部 {{ selectedConditions.length }} 项
              </view>
            </view>
          </view>

          <view>
            <view class="section-heading">
              <view><text class="section-title">可能的关联路径</text><text class="section-note">用于组织观察，不等于原因判定</text></view>
              <view class="text-action" @tap="goChain">展开</view>
            </view>
            <view class="mini-chain surface-card">
              <template v-for="(condition, index) in chainPreview" :key="condition.id">
                <view class="mini-node"><text>{{ index + 1 }}</text><view><text class="mini-name">{{ condition.name }}</text><text class="mini-status">{{ index === 0 ? '已记录' : '需验证' }}</text></view></view>
                <PhArrowDown v-if="index < chainPreview.length - 1" :key="condition.id + '-arrow'" class="mini-arrow" :size="18" />
              </template>
              <text v-if="chainPreview.length < selectedConditions.length" class="mini-more">另有 {{ selectedConditions.length - chainPreview.length }} 项，请在动力链页查看</text>
            </view>
          </view>
        </view>

        <view class="section-heading">
          <view><text class="section-title">今日训练</text><text class="section-note">{{ todayPlanLabel }}</text></view>
          <view class="text-action" @tap="goTraining">进入训练</view>
        </view>
        <view class="session-strip surface-card" @tap="goTraining">
          <view class="session-icon"><PhBarbell :size="24" weight="duotone" /></view>
          <view class="session-copy"><text class="session-title">{{ todayPlanTitle }}</text><text class="session-sub">{{ todaySessionSubtitle }}</text></view>
          <PhArrowRight :size="20" weight="bold" />
        </view>
      </template>

      <view class="legal-note">自我记录不能替代诊断。出现急性肿胀、无法负重、进行性无力或麻木等情况，请及时就医。</view>
    </view>
    <AppNav current="today" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import {
  PhArrowDown,
  PhArrowRight,
  PhBarbell,
  PhCaretRight,
  PhCheckCircle,
  PhLockKey,
  PhMoonStars,
  PhPersonArmsSpread,
  PhPlus,
  PhTimer,
} from '@phosphor-icons/vue'
import AppNav from '../../components/AppNav.vue'
import { assetUrl, chainEdges, currentSessionExerciseIds, findSpine, getCondition, getExercise } from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'
import plan from '../../../content/plan.json'

const { selectedConditionIds, completedSet, toggleExercise, loadExample } = useWorkspace()
const selectedConditions = computed(() => selectedConditionIds.value.map(getCondition).filter(Boolean))
const focusPreview = computed(() => selectedConditions.value.slice(0, 3))

const now = new Date()
const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(now)
const weekdayIndex = now.getDay()
const isRecoveryDay = weekdayIndex === 0
const todayPlan = computed(() => weekdayIndex === 0 ? null : plan.days[weekdayIndex - 1])
const sessionExerciseIds = computed(() => selectedConditions.value.length && !isRecoveryDay
  ? currentSessionExerciseIds(selectedConditionIds.value, todayPlan.value)
  : [])
const nextExercise = computed(() => sessionExerciseIds.value.map(getExercise).find((item) => item && !completedSet.value.has(item.id)))
const completedCount = computed(() => sessionExerciseIds.value.filter((id) => completedSet.value.has(id)).length)
const progressPercent = computed(() => sessionExerciseIds.value.length ? Math.round((completedCount.value / sessionExerciseIds.value.length) * 100) : 0)
const progressStyle = computed(() => ({ background: `conic-gradient(var(--color-teal-500) ${progressPercent.value}%, #dedfd9 0)` }))
const estimatedMinutes = computed(() => Math.max(3, Math.min(8, Math.ceil((nextExercise.value?.difficulty || 1) * 2.5))))
const todayPlanTitle = computed(() => todayPlan.value ? `${todayPlan.value.day} · ${todayPlan.value.split}日` : '周日 · 恢复日')
const todayPlanLabel = computed(() => todayPlan.value ? '按当前示例计划整理' : '轻松活动，留意整体恢复')
const todayExerciseCount = computed(() => sessionExerciseIds.value.length)
const todaySessionSubtitle = computed(() => todayPlan.value ? `${todayExerciseCount.value} 个准备与控制动作` : '轻松活动与恢复提醒')

const chainPreview = computed(() => {
  const spine = findSpine(chainEdges(selectedConditionIds.value))
  const ids = spine.length ? spine : selectedConditionIds.value
  return ids.slice(0, 4).map(getCondition).filter(Boolean)
})

function goBody() { uni.reLaunch({ url: '/pages/body/body' }) }
function goChain() { uni.reLaunch({ url: '/pages/profile/profile' }) }
function goTraining() { uni.reLaunch({ url: '/pages/training/training' }) }
function goCondition(id) { uni.navigateTo({ url: `/pages/condition/condition?id=${id}` }) }
</script>

<style scoped>
.date-label { display: block; margin-bottom: 7px; color: var(--color-teal-700); font-size: 13px; font-weight: 700; }
.progress-ring { width: 56px; height: 56px; padding: 5px; flex: 0 0 56px; border-radius: 50%; }
.progress-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg); border-radius: 50%; color: var(--color-teal-700); font-size: 11px; font-weight: 750; }
.onboarding { margin-top: 28px; }
.onboarding-icon { width: 62px; height: 62px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 20px; }
.empty-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.example-note { display: block; margin-top: 12px; color: var(--color-text-muted); font-size: 10px; line-height: 1.5; }
.next-card { overflow: hidden; }
.next-media { position: relative; height: 220px; }
.next-media image { width: 100%; height: 100%; display: block; }
.next-badge { position: absolute; left: 14px; top: 14px; padding: 7px 10px; color: #fff; background: rgba(18, 63, 62, 0.88); border-radius: 999px; backdrop-filter: blur(8px); font-size: 11px; font-weight: 700; }
.next-content { padding: 18px; }
.next-kicker { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 750; }
.next-name { display: block; margin-top: 4px; color: var(--color-text); font-size: 25px; line-height: 1.25; font-weight: 800; letter-spacing: -0.025em; }
.next-purpose { display: block; margin-top: 7px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; }
.next-dose { margin-top: 11px; display: flex; align-items: center; gap: 7px; color: var(--color-teal-700); font-size: 12px; font-weight: 680; }
.next-actions { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
.celebration { padding: 20px; display: flex; align-items: center; gap: 14px; color: var(--color-teal-700); }
.celebration-title { display: block; color: var(--color-text); font-size: 17px; font-weight: 760; }
.celebration-copy { display: block; margin-top: 4px; color: var(--color-text-secondary); font-size: 12px; }
.text-action { min-height: 44px; display: flex; align-items: center; color: var(--color-teal-700); font-size: 12px; font-weight: 720; }
.focus-list { overflow: hidden; }
.focus-row { min-height: 62px; padding: 10px 14px; display: flex; align-items: center; gap: 11px; border-top: 1px solid var(--border-soft); }
.focus-row:first-child { border-top: 0; }
.focus-marker { width: 9px; height: 9px; flex: 0 0 9px; background: var(--color-teal-500); border-radius: 50%; box-shadow: 0 0 0 5px var(--color-teal-050); }
.focus-copy { min-width: 0; flex: 1; }
.focus-name { display: block; font-size: 13px; font-weight: 720; }
.focus-tag { display: block; margin-top: 3px; color: var(--color-text-muted); font-size: 10px; }
.focus-more { min-height: 44px; display: flex; align-items: center; justify-content: center; color: var(--color-teal-700); border-top: 1px solid var(--border-soft); font-size: 11px; font-weight: 720; }
.mini-chain { padding: 15px; }
.mini-node { min-height: 48px; padding: 8px 10px; display: flex; align-items: center; gap: 11px; background: #f7f5ef; border-radius: 13px; }
.mini-node > text { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--color-teal-700); background: var(--color-teal-100); border-radius: 50%; font-size: 10px; font-weight: 800; }
.mini-name { display: block; font-size: 12px; font-weight: 710; }
.mini-status { display: block; margin-top: 2px; color: var(--color-text-muted); font-size: 9px; }
.mini-arrow { display: block; margin: 3px 0 3px 13px; color: var(--color-teal-500); }
.mini-more { display: block; margin-top: 10px; color: var(--color-text-muted); font-size: 10px; text-align: center; }
.session-strip { min-height: 78px; padding: 14px; display: flex; align-items: center; gap: 12px; }
.session-icon { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; flex: 0 0 46px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 14px; }
.session-copy { min-width: 0; flex: 1; }
.session-title { display: block; font-size: 14px; font-weight: 750; }
.session-sub { display: block; margin-top: 3px; color: var(--color-text-muted); font-size: 11px; }

@media (min-width: 700px) {
  .next-card { display: grid; grid-template-columns: minmax(280px, 1.1fr) minmax(320px, 0.9fr); }
  .next-media { height: 100%; min-height: 310px; }
  .next-content { padding: 30px; align-self: center; }
  .today-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
}

@media (max-width: 699px) {
  .next-media { height: 180px; }
  .next-content { padding: 15px 16px 16px; }
  .next-name { font-size: 22px; }
  .next-purpose { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .next-actions { margin-top: 13px; }
}
</style>
