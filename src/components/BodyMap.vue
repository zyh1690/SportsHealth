<template>
  <view class="surface" :style="{ width: width + 'px', height: (width * RATIO) + 'px' }">
    <image class="body-img" :src="imgSrc" mode="aspectFit" />

    <!-- 可点标记：圈 + 点 -->
    <view
      v-for="r in visibleRegions"
      :key="r.id"
      :data-id="r.id"
      class="marker-hit"
      :class="{ mus: layer === 'muscle' }"
      :style="markerBoxStyle(r)"
      @tap="layer === 'muscle' ? openMuscle(r) : preview(r)"
    >
      <view class="marker-ring" :class="{ on: r.id === activeId }"></view>
      <view class="marker-dot"></view>
    </view>

    <!-- 点选后浮出的部位标签 -->
    <view
      v-if="activeRegion"
      class="label"
      :style="labelStyle"
      @tap="open(activeRegion)"
    >
      <text class="label-name">{{ activeRegion.name }}</text>
      <text class="label-arrow">↗</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const IMG_W = 701 // 解剖图宽度（肌肉正面/背面图，与 content/regions.json 的热区坐标对应）
const IMG_H = 1122 // 解剖图高度
const RATIO = IMG_H / IMG_W

const props = defineProps({
  regions: { type: Array, default: () => [] },
  view: { type: String, default: 'front' },
  width: { type: Number, default: 320 },
  layer: { type: String, default: 'region' },   // 'region' 部位 | 'muscle' 肌肉
})
const emit = defineEmits(['open', 'muscle'])

const activeId = ref('')

const imgSrc = computed(() =>
  props.view === 'back' ? '/static/body/anatomy/back.png' : '/static/body/anatomy/front.png'
)
const visibleRegions = computed(() =>
  props.regions.filter((r) => r.hotspot && r.hotspot[props.view])
)
const activeRegion = computed(() => {
  if (!activeId.value) return null
  return props.regions.find((r) => r.id === activeId.value)
})

// 切换正/背清空选中
watch(() => props.view, () => { activeId.value = '' })

function centerPx(h) {
  const cx = h.x * props.width
  const cy = h.y * props.width * RATIO
  const rad = h.r * props.width
  return { cx, cy, rad }
}
function markerBoxStyle(r) {
  const { cx, cy, rad } = centerPx(r.hotspot[props.view])
  return {
    left: cx - rad + 'px',
    top: cy - rad + 'px',
    width: rad * 2 + 'px',
    height: rad * 2 + 'px',
  }
}
const labelStyle = computed(() => {
  if (!activeRegion.value) return ''
  const { cx, cy, rad } = centerPx(activeRegion.value.hotspot[props.view])
  return {
    left: cx + 'px',
    top: cy - rad - 46 + 'px', // 标签悬在标记上方
    transform: 'translateX(-50%)',
  }
})

function preview(r) {
  activeId.value = r.id
}
function open(r) {
  activeId.value = ''
  emit('open', r.id)
}
function openMuscle(r) {
  activeId.value = ''
  emit('muscle', r.id)
}
// 供父级程序化设置
function setSelected(id) { activeId.value = id }
defineExpose({ setSelected })
</script>

<style scoped>
.surface { position: relative; margin: 0 auto; overflow: visible; }
.body-img {
  width: 100%; height: 100%;
  object-fit: contain;
  filter: grayscale(100%) contrast(1.05) brightness(1.02); /* 银色解剖质感 */
}
.marker-hit { position: absolute; z-index: 2; display: flex; align-items: center; justify-content: center; }
.marker-ring {
  width: 64%; height: 64%; border-radius: 50%;
  border: 3px solid #2b7876; box-sizing: border-box;
}
.marker-ring.on { border-color: #1f5f5d; }
.marker-hit.mus .marker-ring { background: rgba(43, 120, 118, 0.35); border-color: #2b7876; }
.marker-hit.mus .marker-dot { width: 9px; height: 9px; background: #174a48; }
.marker-dot {
  position: absolute; width: 7px; height: 7px; border-radius: 50%;
  background: #2b7876;
}
.label {
  position: absolute; z-index: 3;
  display: flex; align-items: center; gap: 6px;
  background: #ffffff; border-radius: 10px;
  padding: 7px 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
}
.label-name { font-size: 14px; font-weight: 700; color: #1f1f1f; }
.label-arrow { font-size: 14px; color: #2b7876; }
</style>
