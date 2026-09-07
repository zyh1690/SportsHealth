<template>
  <view class="container" v-if="c">
    <!-- 标题 -->
    <view class="title-block">
      <text class="title">{{ c.name }}</text>
      <text v-if="c.aliases && c.aliases.length" class="aliases">{{ c.aliases.join(' · ') }}</text>
      <view class="tags">
        <text v-for="t in c.tags" :key="t" class="chip primary">{{ t }}</text>
      </view>
    </view>

    <!-- 简介 -->
    <view class="section-title">这是什么</view>
    <text class="body">{{ c.description }}</text>

    <!-- 症状（必填） -->
    <view class="section-title">症状</view>
    <text class="body">{{ c.symptoms }}</text>

    <!-- 自测（若有） -->
    <view v-if="c.selfTest && c.selfTest.exists" class="card self-test">
      <view class="section-sub">自测方法（约 5 分钟）</view>
      <view v-for="(s, i) in c.selfTest.steps" :key="i" class="step">
        <text class="step-no">{{ i + 1 }}</text>
        <text class="step-t">{{ s }}</text>
      </view>
      <view v-if="selfTestVideos.length" class="vids">
        <view v-for="v in selfTestVideos" :key="v.id" class="video-link" @tap="openUrl(v.url)">
          <text class="play">▶ 看自测视频</text>
          <text class="verified" :class="{ ok: v.verified }">{{ v.verified ? '已核' : '待补' }}</text>
        </view>
      </view>
    </view>

    <!-- 危险信号 -->
    <view class="section-title">危险信号 · 何时就医</view>
    <view class="danger-banner">
      <text v-for="(r, i) in c.redFlags" :key="i" class="red-line">· {{ r }}</text>
    </view>

    <!-- 动力链 -->
    <block v-if="cEdges.length">
      <view class="section-title">动力链 · 上下游网络图</view>
      <view class="card chain">
        <ChainMap :edges="cEdges" />
      </view>
    </block>

    <!-- 康复训练 -->
    <view class="section-title">康复训练动作</view>
    <ExerciseCard v-for="ex in rehabEx" :key="ex.id" :exercise="ex" />

    <!-- 预防训练 -->
    <view class="section-title">预防训练</view>
    <ExerciseCard v-for="ex in prevEx" :key="ex.id" :exercise="ex" />

    <view class="disclaimer">
      {{ c.disclaimer }}
      <text v-if="c.source"> · 来源：{{ c.source }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ExerciseCard from '../../components/ExerciseCard.vue'
import ChainMap from '../../components/ChainMap.vue'
import { getCondition, getVideo, getExercise } from '../../data/index.js'
import { openUrl } from '../../utils/url.js'

const c = ref(null)

const rehabEx = ref([])
const prevEx = ref([])
const selfTestVideos = computed(() =>
  (c.value?.selfTest?.video || []).map((id) => getVideo(id)).filter(Boolean)
)

// 该伤病的动力链：上游根因 → 本伤病 → 下游症状
const cEdges = computed(() => {
  const cc = c.value
  if (!cc) return []
  const edges = []
  ;(cc.upstreamCauses || []).forEach((l) => edges.push({ from: l.conditionId, to: cc.id, note: l.note }))
  ;(cc.downstreamSymptoms || []).forEach((l) => edges.push({ from: cc.id, to: l.conditionId, note: l.note }))
  return edges
})

onLoad((options) => {
  const cond = getCondition(options.id)
  c.value = cond
  if (cond) {
    rehabEx.value = cond.rehabExercises.map((id) => getExercise(id)).filter(Boolean)
    prevEx.value = cond.prevention.map((id) => getExercise(id)).filter(Boolean)
  }
})
</script>

<style scoped>
.title-block { padding: 8rpx 0 4rpx; }
.title { font-size: 40rpx; font-weight: 800; color: #1f1f1f; display: block; }
.aliases { display: block; font-size: 24rpx; color: #8a8a8a; margin-top: 8rpx; line-height: 1.5; }
.tags { margin-top: 12rpx; }
.body { font-size: 28rpx; color: #2c2c2c; line-height: 1.7; }

.self-test { margin-bottom: 8rpx; }
.step { display: flex; align-items: flex-start; margin: 10rpx 0; }
.step-no {
  min-width: 36rpx; height: 36rpx; border-radius: 999rpx; background: #e4f0ef; color: #2b7876;
  display: flex; align-items: center; justify-content: center; font-size: 22rpx; margin-right: 12rpx; margin-top: 2rpx;
}
.step-t { flex: 1; font-size: 25rpx; color: #333; line-height: 1.6; }

.danger-banner { margin-bottom: 8rpx; }
.red-line { display: block; margin: 4rpx 0; }

.chain { margin-bottom: 12rpx; }
.chain-label { font-size: 24rpx; color: #2b7876; font-weight: 600; margin-bottom: 8rpx; }
.chain-link { padding: 10rpx 0; border-top: 1px solid #f3f3f3; }
.chain-note { font-size: 24rpx; color: #6a6a6a; line-height: 1.5; display: block; }
.chain-target { margin-top: 4rpx; }
.chain-go { color: #2b7876; }
.chain-name { font-size: 26rpx; font-weight: 600; color: #1f6f6d; }

.vids { margin-top: 12rpx; }
.video-link { display: flex; align-items: center; justify-content: space-between; padding: 12rpx; background: #f7f7f7; border-radius: 10rpx; margin-bottom: 8rpx; }
.play { color: #2b7876; font-size: 24rpx; }
.verified { font-size: 20rpx; color: #c65b4a; }
.verified.ok { color: #3f8f6b; }

.disclaimer { margin-top: 40rpx; font-size: 22rpx; color: #b0b0b0; line-height: 1.6; }
</style>
