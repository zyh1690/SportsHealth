<template>
  <view class="ex-card" :class="{ done: done && trackable }">
    <view class="ex-head" @tap="expanded = !expanded">
      <view v-if="trackable" class="check" :class="{ on: done }" @tap.stop="toggle">
        <text v-if="done" class="check-mark">✓</text>
      </view>
      <view class="ex-left">
        <text class="ex-name">{{ exercise.name }}</text>
        <text class="ex-meta">{{ catLabel }} · 难度 {{ exercise.difficulty }} 级</text>
      </view>
      <text class="ex-arrow">{{ expanded ? '▲' : '▼' }}</text>
    </view>

    <view v-if="expanded" class="ex-body">
      <view v-if="exercise.targetMuscles && exercise.targetMuscles.length" class="line">
        <text class="label">目标：</text><text>{{ exercise.targetMuscles.join('、') }}</text>
      </view>
      <view v-if="exercise.equipment && exercise.equipment.length" class="line">
        <text class="label">器械：</text><text>{{ exercise.equipment.join('、') }}</text>
      </view>
      <view class="line"><text class="label">要点：</text></view>
      <view v-for="(c, i) in exercise.cues" :key="i" class="bullet">
        <text class="dot">·</text><text>{{ c }}</text>
      </view>
      <view v-if="exercise.commonErrors && exercise.commonErrors.length" class="line">
        <text class="label warn">常见错误：</text><text>{{ exercise.commonErrors.join('；') }}</text>
      </view>

      <view v-if="videoList.length" class="vids">
        <view v-for="v in videoList" :key="v.id" class="video-link" @tap="openUrl(v.url)">
          <text class="play">▶</text>
          <text class="vt">{{ v.title }}</text>
          <text class="verified" :class="{ ok: v.verified }">{{ v.verified ? '已核' : '待补' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getVideo } from '../data/index.js'
import { openUrl } from '../utils/url.js'

const props = defineProps({
  exercise: { type: Object, required: true },
  /** 是否显示打卡复选框 */
  trackable: { type: Boolean, default: false },
  /** 当前已完成状态（配合 trackable 使用） */
  done: { type: Boolean, default: false },
})
const emit = defineEmits(['update:done'])
const expanded = ref(false)

function toggle() {
  emit('update:done', !props.done)
}

const CAT = { strength: '力量', stability: '稳定', mobility: '柔韧', activate: '激活', respiratory: '呼吸' }
const catLabel = computed(() => CAT[props.exercise.category] || props.exercise.category)

const videoList = computed(() =>
  (props.exercise.videos || []).map((id) => getVideo(id)).filter(Boolean)
)
</script>

<style scoped>
.ex-card { background: #fff; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.ex-card.done { opacity: 0.62; }
.ex-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
.check {
  width: 34rpx; height: 34rpx; margin-right: 16rpx; flex-shrink: 0;
  border-radius: 50%; border: 3rpx solid #c2d4d2;
  display: flex; align-items: center; justify-content: center;
}
.check.on { background: #2b7876; border-color: #2b7876; }
.check-mark { color: #fff; font-size: 22rpx; font-weight: 700; }
.ex-left { flex: 1; }
.ex-name { font-size: 15px; font-weight: 600; color: #1f1f1f; }
.ex-meta { font-size: 12px; color: #9b9b9b; margin-top: 3px; display: block; }
.ex-arrow { color: #b0b0b0; font-size: 12px; }
.ex-body { padding: 0 16px 14px; border-top: 1px solid #f2f2f2; }
.line { font-size: 13px; color: #4a4a4a; margin: 8px 0 2px; line-height: 1.5; }
.label { color: #8a8a8a; }
.label.warn { color: #c65b4a; }
.bullet { display: flex; font-size: 13px; color: #4a4a4a; line-height: 1.5; margin: 2px 0; }
.dot { margin: 0 6px 0 2px; color: #2b7876; }
.vids { margin-top: 10px; }
.video-link { display: flex; align-items: center; padding: 8px 10px; background: #f7f7f7; border-radius: 8px; margin-bottom: 6px; }
.play { color: #2b7876; margin-right: 8px; font-size: 12px; }
.vt { flex: 1; font-size: 13px; color: #333; }
.verified { font-size: 11px; color: #c65b4a; }
.verified.ok { color: #3f8f6b; }
</style>
