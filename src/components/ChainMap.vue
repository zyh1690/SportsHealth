<template>
  <view class="w map-root" :ref="setBoxRef">
    <!-- 网络画布 -->
    <view class="map" :style="{ height: height + 'px' }">
      <!-- 连线（置于节点下层） -->
      <template v-for="e in edges" :key="'l' + e.from + '>' + e.to">
        <view class="line" :class="{ dim: dimEdge(e) }" :style="lineStyle(e)"></view>
        <view v-if="arrowStyle(e)" class="arrow" :class="{ dim: dimEdge(e) }" :style="arrowStyle(e)"></view>
      </template>

      <!-- 聚焦边的「为什么」标签 -->
      <view v-for="e in activeEdges" :key="'n' + e.from + '>' + e.to" class="edge-note" :style="noteStyle(e)">
        {{ e.note }}
      </view>

      <!-- 节点 -->
      <view
        v-for="n in nodes"
        :key="n.id"
        class="node"
        :class="{ on: n.id === focusId, near: near(n.id), dim: dimNode(n.id), root: isRoot(n.id) }"
        :style="nodeStyle(n)"
        @tap="tapNode(n.id)"
      >
        <text class="n-name">{{ name(n.id) }}</text>
        <text class="n-sub">{{ sub(n.id) }}</text>
        <text class="n-count">{{ actionCount(n.id) }}</text>
      </view>

      <!-- 空态 -->
      <view v-if="!nodes.length" class="empty">还没有可串联的问题，去上面勾选你的状况吧。</view>
    </view>

    <!-- 聚焦详情面板 -->
    <view v-if="focus" class="detail">
      <view class="detail-head">
        <view class="dh-left">
          <text class="dh-name">{{ focus.name }}</text>
          <text class="dh-symp">{{ short(focus.symptoms) }}</text>
        </view>
        <view class="dh-right">
          <text v-if="isRoot(focus.id)" class="root-badge">根源</text>
          <text class="dh-count">{{ actionCount(focus.id) }} 个动作</text>
          <text class="dh-go" @tap.stop="goDetail(focus.id)">详情 ↗</text>
          <text class="dh-close" @tap.stop="clearFocus">×</text>
        </view>
      </view>

      <view v-if="activeEdges.length" class="dh-links">
        <view v-for="e in activeEdges" :key="e.from + '>' + e.to" class="dh-link">
          <text class="dh-dir">{{ e.from === focusId ? '→ 引发' : '← 源自' }}</text>
          <text class="dh-target">{{ name(e.to === focusId ? e.from : e.to) }}</text>
          <text class="dh-note">{{ e.note }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, getCurrentInstance } from 'vue'
import { getCondition } from '../data/index.js'

const props = defineProps({
  edges: { type: Array, default: () => [] },   // [{ from, to, note }]
})

const focusId = ref('')

// ---------- 画布宽度（实测，跟随容器，居中） ----------
const { proxy } = getCurrentInstance()
const canvasW = ref(320)
function setBoxRef(el) { boxEl = el }
let boxEl = null
function measure() {
  // 优先用 createSelectorQuery，H5 下也可回退 getBoundingClientRect
  try {
    uni.createSelectorQuery().in(proxy).select('.map-root').boundingClientRect((rect) => {
      if (rect && rect.width) canvasW.value = rect.width
    }).exec()
  } catch (e) {
    if (boxEl && boxEl.getBoundingClientRect) {
      const w = boxEl.getBoundingClientRect().width
      if (w) canvasW.value = w
    }
  }
}
onMounted(() => { nextTick(() => measure()) })

// ---------- 布局：按「层级」自上而下 ----------
const NODE_H = 46
const LEVEL_GAP = 56
const XGAP = 12
const MAX_W = 320 // 画布最大宽度（宽屏不再拉出空白）

const layout = computed(() => {
  const W = Math.min(canvasW.value, MAX_W)
  const ids = new Set()
  props.edges.forEach((e) => { ids.add(e.from); ids.add(e.to) })
  const inDeg = {}, adj = {}
  ids.forEach((id) => { inDeg[id] = 0; adj[id] = [] })
  props.edges.forEach((e) => { inDeg[e.to]++; adj[e.from].push(e.to) })

  const depth = {}
  const indeg = { ...inDeg }
  const q = [...ids].filter((id) => indeg[id] === 0)
  q.forEach((id) => { depth[id] = 0 })
  while (q.length) {
    const n = q.shift()
    for (const m of adj[n] || []) {
      depth[m] = Math.max(depth[m] || 0, (depth[n] || 0) + 1)
      if (--indeg[m] === 0) q.push(m)
    }
  }
  const maxDepth = ids.size ? Math.max(0, ...[...ids].map((id) => depth[id] ?? 0)) : 0

  const levels = []
  for (let d = 0; d <= maxDepth; d++) levels.push([...ids].filter((id) => (depth[id] ?? 0) === d))

  const pos = {}
  levels.forEach((lvl, d) => {
    const n = lvl.length
    // 单列时节点撑满大部分宽度，避免右侧留白；多列时均分
    const nodeW = n === 1 ? Math.min(W * 0.86, 300) : Math.min(W * 0.86, (W - XGAP * (n - 1)) / n)
    const rowW = n * nodeW + XGAP * (n - 1)
    const startX = W / 2 - rowW / 2
    lvl.forEach((id, ci) => {
      pos[id] = {
        x: startX + ci * (nodeW + XGAP) + nodeW / 2,
        y: 22 + d * (NODE_H + LEVEL_GAP) + NODE_H / 2,
        w: nodeW, h: NODE_H, level: d, ci,
      }
    })
  })
  const height = 22 * 2 + (maxDepth + 1) * (NODE_H + LEVEL_GAP)
  return { pos, height, ids, depth, maxDepth }
})

const nodes = computed(() => [...layout.value.ids].map((id) => ({ id, ...layout.value.pos[id] })))
const height = computed(() => layout.value.height)

function nodeStyle(n) {
  return {
    left: (n.x - n.w / 2) + 'px',
    top: (n.y - n.h / 2) + 'px',
    width: n.w + 'px',
    height: n.h + 'px',
  }
}

// ---------- 连线 ----------
function lineStyle(e) {
  const a = layout.value.pos[e.from], b = layout.value.pos[e.to]
  if (!a || !b) return ''
  const ax = a.x, ay = a.y + a.h / 2
  const bx = b.x, by = b.y - b.h / 2
  const L = Math.hypot(bx - ax, by - ay)
  const ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  return { width: L + 'px', left: (mx - L / 2) + 'px', top: (my - 1) + 'px', transform: `rotate(${ang}deg)` }
}
function arrowStyle(e) {
  const a = layout.value.pos[e.from], b = layout.value.pos[e.to]
  if (!a || !b) return ''
  const bx = b.x, by = b.y - b.h / 2
  const ang = Math.atan2(by - a.y, bx - a.x) * 180 / Math.PI
  // 箭头三角默认朝下；减去 90° 对齐到连线方向
  return { left: bx + 'px', top: by + 'px', transform: `translate(-50%,-50%) rotate(${ang - 90}deg)` }
}
function noteStyle(e) {
  const a = layout.value.pos[e.from], b = layout.value.pos[e.to]
  if (!a || !b) return ''
  const mx = (a.x + b.x) / 2, my = (a.y + a.h / 2 + b.y - b.h / 2) / 2
  return { left: mx + 'px', top: my + 'px' }
}

// ---------- 聚焦高亮 ----------
const focus = computed(() => (focusId.value ? getCondition(focusId.value) : null))
const activeEdges = computed(() =>
  focusId.value ? props.edges.filter((e) => e.from === focusId.value || e.to === focusId.value) : []
)
function near(id) {
  if (!focusId.value) return false
  if (id === focusId.value) return true
  return props.edges.some((e) => (e.from === focusId.value && e.to === id) || (e.to === focusId.value && e.from === id))
}
function dimNode(id) {
  if (!focusId.value) return false
  return id !== focusId.value && !near(id)
}
function dimEdge(e) {
  if (!focusId.value) return false
  return !activeEdges.value.some((x) => x.from === e.from && x.to === e.to)
}

function tapNode(id) { focusId.value = focusId.value === id ? '' : id }
function clearFocus() { focusId.value = '' }

function isRoot(id) {
  return !props.edges.some((e) => e.to === id)
}

// ---------- 内容 ----------
function name(id) { return getCondition(id)?.name || id }
function symp(id) {
  const c = getCondition(id)
  return c ? c.symptoms : ''
}
function short(s) {
  if (!s) return '暂无症状记录'
  return s.length > 48 ? s.slice(0, 48) + '…' : s
}
function sub(id) {
  const c = getCondition(id)
  if (!c) return ''
  if (c.tags && c.tags.length) return c.tags.slice(0, 2).join(' / ')
  if (c.aliases && c.aliases.length) return c.aliases[0]
  return ''
}
function actionCount(id) {
  const c = getCondition(id)
  return c ? (c.rehabExercises || []).length + (c.prevention || []).length : 0
}
function goDetail(id) { uni.navigateTo({ url: '/pages/condition/condition?id=' + id }) }
</script>

<style scoped>
.w { position: relative; }
.map-root { max-width: 330px; margin: 0 auto; width: 100%; }
.map { position: relative; width: 100%; overflow: visible; }

.line {
  position: absolute; height: 2px; background: #bfd2cf; transform-origin: center; z-index: 1;
}
.arrow {
  position: absolute; z-index: 1;
  width: 0; height: 0;
  border-left: 5px solid transparent; border-right: 5px solid transparent;
  border-top: 8px solid #2b7876;
  transform-origin: center;
}
.line.dim, .arrow.dim { opacity: 0.12; }

.edge-note {
  position: absolute; z-index: 3; transform: translate(-50%, -50%);
  background: #f4f1e8; color: #6a5f43; font-size: 11px; line-height: 1.4;
  padding: 4px 8px; border-radius: 8px; max-width: 220px; text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.node {
  position: absolute; z-index: 2;
  background: #fff; border-radius: 12px; padding: 6px 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px solid transparent;
  transition: transform 0.15s, opacity 0.15s;
}
.node.on { transform: scale(1.05); border-color: #2b7876; box-shadow: 0 3px 12px rgba(23,74,72,0.28); z-index: 5; }
.node.near:not(.on) { border-color: #bcd6d4; }
.node.dim { opacity: 0.28; }
.node.root .n-name::before { content: '◆ '; color: #c65b4a; font-size: 10px; }
.n-name { font-size: 12px; font-weight: 700; color: #1f1f1f; text-align: center; line-height: 1.25; }
.n-sub { font-size: 10px; color: #9b9b9b; margin-top: 2px; text-align: center; }
.n-count { font-size: 10px; color: #2b7876; font-weight: 600; margin-top: 2px; }

.empty { text-align: center; color: #b5b5b5; font-size: 26rpx; padding: 40rpx 0; }

.detail {
  margin-top: 18rpx; background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-top: 4px solid #2b7876;
}
.detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dh-left { flex: 1; }
.dh-name { font-size: 17px; font-weight: 800; color: #1f1f1f; display: block; }
.dh-symp { font-size: 12px; color: #5a5a5a; line-height: 1.5; margin-top: 4px; display: block; }
.dh-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.root-badge { background: #f3e3df; color: #c65b4a; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999rpx; }
.dh-count { font-size: 12px; color: #8a8a8a; }
.dh-go { color: #2b7876; font-weight: 700; font-size: 13px; }
.dh-close { color: #b0b0b0; font-size: 18px; padding: 0 4px; }

.dh-links { border-top: 1px solid #f2f2f2; margin-top: 12px; padding-top: 10px; }
.dh-link { padding: 8px 0; border-bottom: 1px solid #f7f7f7; }
.dh-dir { font-size: 12px; color: #2b7876; font-weight: 700; }
.dh-target { font-size: 13px; color: #1f1f1f; font-weight: 600; margin: 0 6px; }
.dh-note { display: block; font-size: 12px; color: #8a8a8a; line-height: 1.5; margin-top: 3px; }
</style>
