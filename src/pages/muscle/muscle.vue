<template>
  <view class="container">
    <!-- 头部 -->
    <view class="head">
      <text class="title">人体肌肉库</text>
      <text class="sub">按标准名称与身体部位浏览。选择肌肉后可查看基础信息，并进入相关身体问题。</text>
    </view>

    <!-- 搜索 -->
    <view class="search-wrap">
      <PhMagnifyingGlass class="search-icon" :size="18" />
      <input class="search-input" v-model="query" placeholder="搜肌肉名，如 gluteus / rhomboid / tibialis" />
    </view>

    <!-- 部位筛选 -->
    <view class="region-row">
      <view class="reg-chip" :class="{ on: regionKey === '' }" @tap="regionKey = ''">全部</view>
      <view
        v-for="rk in regionKeys"
        :key="rk"
        class="reg-chip"
        :class="{ on: regionKey === rk }"
        @tap="regionKey = rk"
      >{{ label(rk) }}</view>
    </view>

    <view class="section-sub">共 {{ list.length }} 块肌肉</view>

    <!-- 肌肉列表（按部位分组） -->
    <view v-for="group in grouped" :key="group.key" class="grp">
      <view class="grp-head">
        <text class="grp-label">{{ label(group.key) }}</text>
        <text class="grp-count">{{ group.items.length }}</text>
      </view>
      <view v-for="m in group.items" :key="m.id" class="m-row" @tap="select(m)">
        <view class="m-main">
          <text class="m-name">{{ m.name }}</text>
          <text class="m-meta">{{ m.fma }} · {{ m.side ? (m.side === 'R' ? '右侧' : '左侧') : '居中' }}</text>
        </view>
        <text class="m-arrow">›</text>
      </view>
    </view>

    <view v-if="!list.length" class="empty">
      <text>没有找到匹配的肌肉</text>
    </view>

    <!-- 详情面板 -->
    <view v-if="sel" class="detail">
      <view class="d-head">
        <text class="d-name">{{ sel.name }}</text>
        <text class="d-close" @tap="sel = null">×</text>
      </view>
      <view class="d-grid">
        <view class="d-cell"><text class="d-k">系统</text><text class="d-v">肌肉系统</text></view>
        <view class="d-cell"><text class="d-k">部位</text><text class="d-v">{{ sel.region }}</text></view>
        <view class="d-cell"><text class="d-k">侧</text><text class="d-v">{{ sel.side ? (sel.side === 'R' ? '右侧' : '左侧') : '居中' }}</text></view>
        <view class="d-cell"><text class="d-k">FMA</text><text class="d-v">{{ sel.fma }}</text></view>
      </view>
      <view class="d-actions">
        <view class="btn" @tap="goRegion(sel)">查看该部位伤病 →</view>
        <view class="btn ghost" @tap="goConditionFor(sel)">关联动力链 ↗</view>
      </view>
      <text class="d-src">数据：BodyParts3D 4.0 · CC BY 4.0 · Human Atlas</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import muscles from '../../../content/muscles.json'

const query = ref('')
const regionKey = ref('')
const sel = ref(null)

onLoad((options) => {
  if (options.region) {
    const seen = new Set(muscles.muscles.map((m) => m.key))
    if (seen.has(options.region)) regionKey.value = options.region
  }
})

const KEY_LABEL = {
  shoulder: '肩', chest: '胸', abdomen: '腹', lumbar: '腰', scapula: '肩胛',
  glute: '臀', hip: '髋', elbow: '上臂/肘', wrist: '前臂/腕', knee: '膝/小腿',
  ankle: '踝/足', thoracic: '胸椎/上背', head: '头/颈',
}
function label(k) { return KEY_LABEL[k] || k }

const regionKeys = computed(() => {
  const seen = []
  muscles.muscles.forEach((m) => { if (!seen.includes(m.key)) seen.push(m.key) })
  const order = ['shoulder', 'chest', 'abdomen', 'lumbar', 'scapula', 'glute', 'hip', 'elbow', 'wrist', 'knee', 'ankle', 'thoracic', 'head']
  return seen.sort((a, b) => order.indexOf(a) - order.indexOf(b))
})

const list = computed(() => {
  const q = (query.value || '').trim().toLowerCase()
  return muscles.muscles.filter((m) => {
    if (regionKey.value && m.key !== regionKey.value) return false
    if (q && !m.name.toLowerCase().includes(q)) return false
    return true
  })
})

const grouped = computed(() => {
  const map = {}
  list.value.forEach((m) => { (map[m.key] ||= []).push(m) })
  const order = regionKeys.value
  return Object.keys(map)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((k) => ({ key: k, items: map[k] }))
})

function select(m) { sel.value = m }
function goRegion(m) {
  uni.navigateTo({ url: '/pages/region/region?id=' + m.regionId })
}
function goConditionFor(m) {
  // 用肌肉部位相关关键词，跳到最匹配的伤病（含动力链）；没关键词就跳该部位页
  const map = {
    ankle: 'cond-ankle-dorsiflex-right', glute: 'cond-pelvic-rotation', hip: 'cond-pelvic-rotation',
    knee: 'cond-knee-instability-right', scapula: 'cond-scapular-weakness-right',
    shoulder: 'cond-humeral-anterior-glide', thoracic: 'cond-thoracic-shift-right',
    lumbar: 'cond-low-back-pain', chest: 'cond-humeral-anterior-glide',
  }
  const cond = map[m.key]
  if (cond) uni.navigateTo({ url: '/pages/condition/condition?id=' + cond })
  else uni.navigateTo({ url: '/pages/region/region?id=' + m.regionId })
}
</script>

<style scoped>
.head { padding: 8rpx 0 16rpx; }
.title { font-size: 40rpx; font-weight: 800; color: #1f1f1f; display: block; }
.sub { font-size: 24rpx; color: #7a7a7a; line-height: 1.6; display: block; margin-top: 8rpx; }

.search-wrap { display: flex; align-items: center; background: #fff; border-radius: 14px; padding: 16rpx 24rpx; }
.search-icon { margin-right: 12rpx; color: var(--color-teal-700); }
.search-input { flex: 1; font-size: 28rpx; color: #1f1f1f; }

.region-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin: 18rpx 0 10rpx; }
.reg-chip { min-height: 44px; padding: 0 12px; display: inline-flex; align-items: center; border-radius: 999rpx; font-size: 24rpx; background: #fff; color: #4a4a4a; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.reg-chip.on { background: #2b7876; color: #fff; }

.section-sub { font-size: 24rpx; color: #8a8a8a; margin: 4rpx 0 14rpx; }

.grp { margin-bottom: 14rpx; }
.grp-head { display: flex; align-items: baseline; gap: 10rpx; margin: 6rpx 0; }
.grp-label { font-size: 28rpx; font-weight: 700; color: #1f6f6d; }
.grp-count { font-size: 22rpx; color: #9b9b9b; }

.m-row { min-height: 64px; display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 12rpx; padding: 12px 14px; margin-bottom: 8rpx; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.m-main { flex: 1; }
.m-name { font-size: 26rpx; font-weight: 600; color: #1f1f1f; display: block; }
.m-meta { font-size: 22rpx; color: #8a8a8a; margin-top: 3rpx; display: block; }
.m-arrow { color: #b0b0b0; font-size: 28rpx; }

.empty { text-align: center; color: #b5b5b5; font-size: 26rpx; padding: 60rpx 0; }

.detail { margin-top: 20rpx; background: #fff; border-radius: 16px; padding: 20px 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 4px solid #2b7876; }
.d-head { display: flex; align-items: flex-start; justify-content: space-between; }
.d-name { font-size: 20px; font-weight: 800; color: #1f1f1f; }
.d-close { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #b0b0b0; font-size: 24px; }
.d-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.d-cell { background: #f5f5f3; border-radius: 10px; padding: 8px 14px; min-width: 76px; }
.d-k { font-size: 11px; color: #9b9b9b; display: block; }
.d-v { font-size: 14px; font-weight: 600; color: #1f1f1f; margin-top: 2px; }
.d-actions { display: flex; gap: 10px; margin-top: 18px; }
.btn { flex: 1; text-align: center; padding: 14px; border-radius: 12px; background: #2b7876; color: #fff; font-size: 14px; font-weight: 700; }
.btn.ghost { background: #eef4f3; color: #2b7876; }
.d-src { display: block; margin-top: 14px; font-size: 11px; color: #c2c2c2; text-align: center; }
</style>
