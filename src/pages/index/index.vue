<template>
  <view class="container">
    <!-- 顶部标题 + 搜索 -->
    <view class="header">
      <text class="brand">运动康复</text>
      <view class="search" @tap="goEncyclopedia">
        <text class="search-icon">🔍</text>
        <text class="search-ph">搜伤病，如「跑步膝 / 腰痛」</text>
      </view>
    </view>

    <!-- 我的身体档案入口 -->
    <view class="profile-entry" @tap="goProfile">
      <view class="pe-left">
        <text class="pe-title">我的身体档案</text>
        <text class="pe-sub">选你的问题 · 追溯整条个人动力链 · 动作打卡</text>
      </view>
      <text class="pe-arrow">→</text>
    </view>

    <!-- 人体图选点 -->
    <view class="atlas-card">
      <view class="atlas-head">
        <text class="atlas-title">人体组织图 2D</text>
        <text class="atlas-sub">{{ view === 'front' ? 'ANTERIOR VIEW' : 'POSTERIOR VIEW' }}</text>
      </view>

      <view class="layer-switch">
        <view class="layer-btn" :class="{ on: layer === 'region' }" @tap="layer = 'region'">部位</view>
        <view class="layer-btn" :class="{ on: layer === 'muscle' }" @tap="layer = 'muscle'">肌肉</view>
      </view>

      <view class="atlas-body">
        <text class="atlas-hint">{{ layer === 'muscle' ? '点击 · 看肌肉' : '点击标记 · 探索身体' }}</text>
        <BodyMap :regions="layer === 'muscle' ? muscleRegions : regions" :view="view" :width="250" :layer="layer" @open="onOpen" @muscle="onMuscle" class="atlas-map" />
      </view>

      <view class="view-switch">
        <view class="view-btn" :class="{ on: view === 'front' }" @tap="view = 'front'">正面</view>
        <view class="view-btn" :class="{ on: view === 'back' }" @tap="view = 'back'">背面</view>
      </view>

      <text class="attribution">人体图：AI 生成教学模型 · 示意非精确解剖</text>
    </view>

    <!-- 功能性训练入口 -->
    <view class="section-title">我的训练 · 按计划</view>
    <view class="section-sub">胸 / 腿 / 背 三分化 · 每周六练 · 减脂有氧</view>
    <view class="persona-row">
      <view class="persona-chip" @tap="goPlan">
        <text>我的训练计划</text>
      </view>
      <view class="persona-chip" @tap="goMuscle">
        <text>人体肌肉库</text>
      </view>
    </view>

    <view class="disclaimer">
      本内容仅供自我健康管理与运动参考，不构成医学诊断/治疗建议；如有不适请及时就医。
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import BodyMap from '../../components/BodyMap.vue'
import { db, muscleCountByRegion, muscleKeyByRegionId } from '../../data/index.js'

const regions = db.regions
const view = ref('front')
const layer = ref('region')
const muscleRegions = computed(() => db.regions.filter((r) => muscleCountByRegion[r.id]))

function onOpen(id) {
  uni.navigateTo({ url: '/pages/region/region?id=' + id })
}
function onMuscle(id) {
  const key = muscleKeyByRegionId[id]
  uni.navigateTo({ url: '/pages/muscle/muscle' + (key ? '?region=' + key : '') })
}
function goEncyclopedia() {
  uni.navigateTo({ url: '/pages/encyclopedia/encyclopedia' })
}
function goPlan() {
  uni.navigateTo({ url: '/pages/plan/plan' })
}
function goMuscle() {
  uni.navigateTo({ url: '/pages/muscle/muscle' })
}
function goProfile() {
  uni.navigateTo({ url: '/pages/profile/profile' })
}
</script>

<style scoped>
.header { padding: 8rpx 0 20rpx; }
.brand { font-size: 40rpx; font-weight: 800; color: #1f1f1f; }
.search {
  margin-top: 18rpx; display: flex; align-items: center;
  background: #fff; border-radius: 999rpx; padding: 14rpx 24rpx;
}
.search-icon { margin-right: 12rpx; font-size: 26rpx; }
.search-ph { color: #a9a9a9; font-size: 25rpx; }

.profile-entry {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(100deg, #174a48, #2b7876);
  border-radius: 16px; padding: 22rpx 26rpx; margin: 4rpx 0 20rpx;
  box-shadow: 0 2px 10px rgba(23, 74, 72, 0.25);
}
.pe-title { font-size: 32rpx; font-weight: 800; color: #fff; display: block; }
.pe-sub { font-size: 22rpx; color: #cfe3e1; margin-top: 4rpx; display: block; }
.pe-arrow { color: #fff; font-size: 34rpx; }

.atlas-card {
  background: #fff; border-radius: 16px; padding: 16px 18px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.atlas-head { margin-bottom: 6px; }
.atlas-title { font-size: 17px; font-weight: 700; color: #1f1f1f; display: block; }
.atlas-sub {
  font-size: 12px; letter-spacing: 1px; color: #9b9b9b;
  text-transform: uppercase; margin-top: 4rpx; display: block;
}
.atlas-body { position: relative; }
.layer-switch { display: flex; width: max-content; margin: 4px auto 8px; background: #eceeec; border-radius: 999rpx; padding: 4px; gap: 4px; }
.layer-btn { padding: 6px 24px; border-radius: 999rpx; font-size: 13px; color: #6a6a6a; }
.layer-btn.on { background: #fff; color: #174a48; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.atlas-hint {
  position: absolute; left: 0; top: 50%;
  transform: translateY(-50%) rotate(180deg);
  writing-mode: vertical-lr;
  font-size: 12px; color: #b5b5b5; letter-spacing: 3px; z-index: 1;
}
.atlas-map { margin-top: 6px; }

.view-switch {
  display: flex; width: max-content; margin: 12px auto 0;
  background: #174a48; border-radius: 999rpx; padding: 4px; gap: 4px;
  box-shadow: 0 2px 8px rgba(23, 74, 72, 0.25);
}
.view-btn { padding: 8px 28px; border-radius: 999rpx; font-size: 14px; color: #dfe9e8; }
.view-btn.on { background: #2b7876; color: #fff; font-weight: 600; }
.attribution { display: block; text-align: center; font-size: 11px; color: #c2c2c2; margin-top: 10px; }

.persona-row { display: flex; flex-wrap: wrap; gap: 10px; }
.persona-chip {
  padding: 12px 22px; background: #fff; border-radius: 12px;
  font-size: 14px; font-weight: 600; color: #2b7876;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.disclaimer {
  margin-top: 32rpx; font-size: 22rpx; color: #b0b0b0; line-height: 1.6; text-align: center;
}
</style>
