<template>
  <view class="container">
    <!-- 头部 -->
    <view class="head">
      <text class="eyebrow">MY BODY PROFILE</text>
      <text class="title">我的身体档案</text>
      <text class="sub">选中你存在的问题，平台会把它们串成一条个人动力链，并汇总你需要练的动作。</text>
    </view>

    <!-- 当前训练状态 & 入口 -->
    <view class="plan-link" @tap="goPlan">
      <view class="pl-left">
        <text class="pl-kicker">当前安排</text>
        <text class="pl-title">胸/腿/背 · 一周六练 · 减脂期</text>
        <text class="pl-sub">每日热身 + 功能性训练 + 减脂有氧 →</text>
      </view>
      <text class="pl-arrow">训练计划</text>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-row">
      <view class="chip primary" @tap="loadFlagship">载入我的动力链</view>
      <view class="chip" @tap="clearAll">清空</view>
    </view>

    <!-- 我的问题：多选 -->
    <view class="section-title">我的问题</view>
    <view class="section-sub">已选 {{ selected.length }} / {{ conditions.length }} 个</view>
    <view class="cond-grid">
      <view
        v-for="c in conditions"
        :key="c.id"
        class="cond-chip"
        :class="{ on: selected.includes(c.id) }"
        @tap="toggle(c.id)"
      >
        <text class="cc-name">{{ c.name }}</text>
        <text v-if="selected.includes(c.id)" class="cc-check">✓</text>
      </view>
    </view>

    <!-- 个人动力链 -->
    <view class="section-title">你的动力链</view>
    <view class="section-sub">从根因到下游的网络图，点任意节点看它的上下游与原因</view>
    <view class="card chain-card">
      <ChainMap :edges="edges" />
      <view v-if="isolated.length" class="iso">
        <view class="section-sub">其它已选问题（暂未串联）</view>
        <view v-for="id in isolated" :key="id" class="iso-row" @tap="goCond(id)">
          <text class="iso-name">{{ condName(id) }}</text>
          <text class="iso-arrow">↗</text>
        </view>
      </view>
    </view>

    <!-- 汇总训练清单 -->
    <view class="section-title">你的康复 / 预防清单</view>
    <view class="section-sub progress">
      <text>已完成 {{ doneCount }} / {{ trainList.length }} 个动作</text>
      <view class="bar"><view class="bar-fill" :style="{ width: percent + '%' }"></view></view>
    </view>
    <ExerciseCard
      v-for="ex in trainList"
      :key="ex.id"
      :exercise="ex"
      trackable
      :done="doneSet.has(ex.id)"
      @update:done="toggleDone(ex.id, $event)"
    />

    <view class="disclaimer">
      打卡仅用于记录自己的训练进度，不构成医疗建议；如症状持续或加重请及时就医。
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ChainMap from '../../components/ChainMap.vue'
import ExerciseCard from '../../components/ExerciseCard.vue'
import {
  db, FLAGSHIP_CHAIN, chainEdges, aggregateExerciseIds, getExercise,
} from '../../data/index.js'

const STORE_COND = 'profile-conditions'
const STORE_DONE = 'profile-done-exercises'

const conditions = db.conditions
const selected = ref([])
const doneArr = ref([])

onLoad(() => {
  const saved = uni.getStorageSync(STORE_COND)
  // 仅当「从未设置」时回退到旗舰动力链；显式清空（[]）也要尊重
  selected.value = Array.isArray(saved) ? saved : [...FLAGSHIP_CHAIN]
  const sd = uni.getStorageSync(STORE_DONE)
  doneArr.value = Array.isArray(sd) ? sd : []
})

const doneSet = computed(() => new Set(doneArr.value))

function persistCond() { uni.setStorageSync(STORE_COND, selected.value) }
function persistDone() { uni.setStorageSync(STORE_DONE, doneArr.value) }

function toggle(id) {
  const i = selected.value.indexOf(id)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(id)
  persistCond()
}
function loadFlagship() {
  selected.value = [...FLAGSHIP_CHAIN]
  persistCond()
}
function clearAll() {
  selected.value = []
  persistCond()
}

const edges = computed(() => chainEdges(selected.value))
const isolated = computed(() => {
  const inEdge = new Set()
  edges.value.forEach((e) => { inEdge.add(e.from); inEdge.add(e.to) })
  return selected.value.filter((id) => !inEdge.has(id))
})
const trainList = computed(() =>
  aggregateExerciseIds(selected.value).map((id) => getExercise(id)).filter(Boolean)
)
const doneCount = computed(() => trainList.value.filter((e) => doneSet.value.has(e.id)).length)
const percent = computed(() =>
  trainList.value.length ? Math.round((doneCount.value / trainList.value.length) * 100) : 0
)

function toggleDone(id, val) {
  const i = doneArr.value.indexOf(id)
  if (val && i < 0) doneArr.value.push(id)
  if (!val && i >= 0) doneArr.value.splice(i, 1)
  persistDone()
}
function goPlan() {
  uni.navigateTo({ url: '/pages/plan/plan' })
}
function condName(id) {
  const c = db.conditions.find((x) => x.id === id)
  return c ? c.name : id
}
function goCond(id) {
  uni.navigateTo({ url: '/pages/condition/condition?id=' + id })
}
</script>

<style scoped>
.head { padding: 8rpx 0 18rpx; }
.eyebrow {
  font-size: 22rpx; letter-spacing: 3px; color: #2b7876; font-weight: 600;
  text-transform: uppercase; display: block;
}
.title { font-size: 40rpx; font-weight: 800; color: #1f1f1f; display: block; margin-top: 6rpx; }
.sub { font-size: 25rpx; color: #7a7a7a; line-height: 1.6; display: block; margin-top: 8rpx; }

.plan-link {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(100deg, #174a48, #2b7876);
  border-radius: 16px; padding: 20rpx 26rpx; margin: 14rpx 0 10rpx;
  box-shadow: 0 2px 10px rgba(23, 74, 72, 0.25);
}
.pl-kicker { font-size: 20rpx; letter-spacing: 2px; color: #bcd6d4; text-transform: uppercase; display: block; }
.pl-title { font-size: 28rpx; font-weight: 800; color: #fff; display: block; margin-top: 4rpx; }
.pl-sub { font-size: 21rpx; color: #cfe3e1; margin-top: 4rpx; display: block; }
.pl-arrow { font-size: 23rpx; color: #fff; font-weight: 600; background: rgba(255,255,255,0.18); padding: 8rpx 18rpx; border-radius: 999rpx; }

.quick-row { display: flex; gap: 12rpx; margin: 10rpx 0 4rpx; }
.chip {
  padding: 12rpx 26rpx; border-radius: 999rpx; font-size: 25rpx; font-weight: 600;
  background: #fff; color: #4a4a4a; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.chip.primary { background: #2b7876; color: #fff; }

.section-title { font-size: 30rpx; font-weight: 700; color: #1f1f1f; margin: 28rpx 0 6rpx; }
.section-sub { font-size: 24rpx; color: #8a8a8a; margin-bottom: 12rpx; }

.cond-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.cond-chip {
  display: flex; align-items: center; gap: 10rpx;
  padding: 14rpx 22rpx; border-radius: 12rpx; background: #fff;
  font-size: 25rpx; color: #4a4a4a; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cond-chip.on { background: #e4f0ef; color: #1f6f6d; font-weight: 600; }
.cc-check { color: #2b7876; font-weight: 700; }

.chain-card { padding: 8rpx 12rpx 14rpx; }
.iso { margin-top: 16rpx; border-top: 1px solid #f2f2f2; padding-top: 12rpx; }
.iso-row { display: flex; align-items: center; justify-content: space-between; padding: 12rpx 4rpx; border-top: 1px solid #f7f7f7; }
.iso-name { font-size: 25rpx; font-weight: 600; color: #1f1f1f; }
.iso-arrow { color: #2b7876; font-size: 24rpx; }

.progress { display: flex; align-items: center; gap: 16rpx; }
.bar {
  flex: 1; height: 12rpx; border-radius: 999rpx; background: #e3e8e7; overflow: hidden;
}
.bar-fill { height: 100%; border-radius: 999rpx; background: #2b7876; transition: width 0.3s; }

.disclaimer { margin-top: 36rpx; font-size: 22rpx; color: #b0b0b0; line-height: 1.6; text-align: center; }
</style>
