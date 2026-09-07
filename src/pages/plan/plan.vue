<template>
  <view class="container">
    <!-- 头部 -->
    <view class="head">
      <text class="eyebrow">MY TRAINING</text>
      <text class="title">{{ plan.name }}</text>
      <text class="sub">{{ plan.meta }}</text>
    </view>

    <!-- 动力链说明 -->
    <view class="note">
      <text class="note-label">为什么每天先做热身 + 功能性</text>
      <text class="note-text">{{ plan.chain }}</text>
    </view>

    <!-- 日选择 -->
    <view class="day-row">
      <view
        v-for="d in plan.days"
        :key="d.day"
        class="day-chip"
        :class="{ on: d.day === cur.day }"
        @tap="cur = d"
      >
        <text class="day-name">{{ d.day }}</text>
        <text class="day-split">{{ d.split }}</text>
      </view>
    </view>

    <!-- 选中日详情 -->
    <view v-if="cur" class="day-detail">
      <view class="day-head">
        <view>
          <text class="day-title">{{ cur.day }} · {{ cur.split }}</text>
          <text class="day-en">{{ cur.splitEn }}</text>
        </view>
        <text class="day-tag">{{ cur.split }} 日</text>
      </view>

      <view class="target card">
        <text class="t-label">针对你的身体现状</text>
        <text class="t-text">{{ cur.target }}</text>
      </view>

      <view class="section-title">热身（激活链条）</view>
      <ExerciseCard v-for="e in warmupList" :key="e.id" :exercise="e" />

      <view class="section-title">功能性训练（训练前补强）</view>
      <view v-for="f in functionalList" :key="f.id" class="func">
        <view class="func-note">
          <text class="fn-dot">⚑</text>
          <text>{{ f.note }}</text>
        </view>
        <ExerciseCard :exercise="f.ex" />
      </view>

      <view v-if="cur.postNote" class="post card">
        <text class="t-label">训练后</text>
        <text class="t-text">{{ cur.postNote }}</text>
      </view>
      <view v-if="cur.cardio" class="post card green">
        <text class="t-label">本日有氧</text>
        <text class="t-text">{{ cur.cardio }}</text>
      </view>
    </view>

    <!-- 减脂有氧方案 -->
    <view class="section-title">减脂有氧 · 如何在六练基础上叠加</view>
    <view class="card cardio">
      <view v-for="(p, i) in plan.cardio.principles" :key="i" class="principle">
        <text class="pr-no">{{ i + 1 }}</text>
        <text class="pr-text">{{ p }}</text>
      </view>

      <view class="week-block">
        <text class="t-label">一周有氧安排</text>
        <view v-for="w in plan.cardio.weekly" :key="w.day" class="week-row">
          <text class="week-day">{{ w.day }}</text>
          <text class="week-plan">{{ w.plan }}</text>
        </view>
      </view>

      <view class="tips-block">
        <text class="t-label">避坑提示</text>
        <text v-for="(t, i) in plan.cardio.tips" :key="i" class="tip">· {{ t }}</text>
      </view>
    </view>

    <!-- 出处 -->
    <view class="section-title">专业出处 · 依据</view>
    <view class="card sources">
      <view v-for="s in plan.sources" :key="s.url" class="source-row" @tap="openUrl(s.url)">
        <view class="src-main">
          <text class="src-name">{{ s.name }}</text>
          <text class="src-note">{{ s.note }}</text>
        </view>
        <text class="src-arrow">↗</text>
      </view>
    </view>

    <view class="disclaimer">
      本计划基于你的训练安排与右侧动力链代偿做的个人参考，不构成医疗建议；动作若有疼痛、代偿明显，请先咨询专业康复/教练。视频为 B 站外链。
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import { getExercise } from '../../data/index.js'
import { openUrl } from '../../utils/url.js'
import plan from '../../../content/plan.json'

const cur = ref(plan.days[0])

const warmupList = computed(() =>
  (cur.value.warmup || []).map((id) => getExercise(id)).filter(Boolean)
)
const functionalList = computed(() =>
  (cur.value.functional || [])
    .map((f) => ({ ...f, ex: getExercise(f.id) }))
    .filter((f) => f.ex)
)
</script>

<style scoped>
.head { padding: 8rpx 0 12rpx; }
.eyebrow { font-size: 22rpx; letter-spacing: 3px; color: #2b7876; font-weight: 600; text-transform: uppercase; display: block; }
.title { font-size: 40rpx; font-weight: 800; color: #1f1f1f; display: block; margin-top: 6rpx; }
.sub { font-size: 25rpx; color: #7a7a7a; display: block; margin-top: 6rpx; }

.note { background: #eaf3f2; border-radius: 14rpx; padding: 18rpx 22rpx; margin-bottom: 18rpx; }
.note-label { font-size: 24rpx; color: #2b7876; font-weight: 700; display: block; margin-bottom: 6rpx; }
.note-text { font-size: 24rpx; color: #3c4a49; line-height: 1.65; }

.day-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.day-chip {
  padding: 12rpx 18rpx; border-radius: 12rpx; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  display: flex; flex-direction: column; align-items: center; min-width: 96rpx;
}
.day-chip.on { background: #174a48; box-shadow: 0 2px 8px rgba(23,74,72,0.3); }
.day-name { font-size: 22rpx; color: #8a8a8a; }
.day-split { font-size: 26rpx; font-weight: 700; color: #1f1f1f; margin-top: 2rpx; }
.day-chip.on .day-name { color: #bcd6d4; }
.day-chip.on .day-split { color: #fff; }

.day-detail { margin-top: 22rpx; }
.day-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.day-title { font-size: 32rpx; font-weight: 800; color: #1f1f1f; }
.day-en { font-size: 20rpx; letter-spacing: 1px; color: #9b9b9b; margin-top: 2rpx; text-transform: uppercase; display: block; }
.day-tag { font-size: 22rpx; color: #2b7876; background: #e4f0ef; padding: 6rpx 16rpx; border-radius: 999rpx; font-weight: 600; }

.target { margin-bottom: 8rpx; }
.card { background: #fff; border-radius: 14rpx; padding: 16px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.t-label { font-size: 24rpx; color: #2b7876; font-weight: 700; display: block; margin-bottom: 6rpx; }
.t-text { font-size: 25rpx; color: #3c3c3c; line-height: 1.65; }
.card.green { background: #eef7f4; }

.section-title { font-size: 30rpx; font-weight: 700; color: #1f1f1f; margin: 26rpx 0 12rpx; }

.func { margin-bottom: 12rpx; }
.func-note {
  display: flex; gap: 8rpx; align-items: flex-start;
  background: #f4f1e8; border-radius: 10rpx; padding: 12rpx 16rpx; margin-bottom: 8rpx;
  font-size: 23rpx; color: #5a5545; line-height: 1.6;
}
.fn-dot { color: #b8860b; font-size: 24rpx; }

.cardio { }
.principle { display: flex; gap: 12rpx; margin-bottom: 12rpx; }
.pr-no { min-width: 32rpx; height: 32rpx; border-radius: 999rpx; background: #e4f0ef; color: #2b7876; font-weight: 700; font-size: 22rpx; display: flex; align-items: center; justify-content: center; margin-top: 4rpx; }
.pr-text { flex: 1; font-size: 24rpx; color: #3c3c3c; line-height: 1.6; }

.week-block { border-top: 1px solid #f2f2f2; margin-top: 14rpx; padding-top: 12rpx; }
.week-row { display: flex; gap: 16rpx; padding: 10rpx 0; border-top: 1px solid #f7f7f7; align-items: baseline; }
.week-day { min-width: 76rpx; font-size: 24rpx; font-weight: 700; color: #1f6f6d; }
.week-plan { flex: 1; font-size: 24rpx; color: #4a4a4a; line-height: 1.55; }

.tips-block { border-top: 1px solid #f2f2f2; margin-top: 14rpx; padding-top: 12rpx; }
.tip { display: block; font-size: 23rpx; color: #4a4a4a; line-height: 1.6; margin: 4rpx 0; }

.sources { }
.source-row { display: flex; align-items: center; gap: 12rpx; padding: 12rpx 0; border-top: 1px solid #f4f4f4; }
.src-main { flex: 1; }
.src-name { font-size: 25rpx; font-weight: 600; color: #1f1f1f; display: block; }
.src-note { font-size: 22rpx; color: #8a8a8a; line-height: 1.5; margin-top: 3rpx; display: block; }
.src-arrow { color: #2b7876; font-size: 26rpx; }

.disclaimer { margin-top: 34rpx; font-size: 22rpx; color: #b0b0b0; line-height: 1.6; text-align: center; }
</style>
