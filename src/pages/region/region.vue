<template>
  <view class="container">
    <view class="region-head card">
      <text class="region-name">{{ region ? region.name : '…' }}</text>
      <text v-if="region && region.description" class="region-desc">{{ region.description }}</text>
    </view>

    <view class="section-title">该部位的常见问题</view>
    <view v-if="list.length">
      <ConditionCard v-for="c in list" :key="c.id" :condition="c" />
    </view>
    <view v-else class="empty surface-card">
      <text class="empty-title">暂无专门条目</text>
      <text class="empty-copy">可返回身体问题库按症状或名称搜索；系统不会仅凭部位替你推断问题。</text>
      <view class="secondary-button" @tap="goBody">返回身体问题库</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ConditionCard from '../../components/ConditionCard.vue'
import { getRegion, conditionsForRegion } from '../../data/index.js'

const region = ref(null)
const list = ref([])

onLoad((options) => {
  const r = getRegion(options.id)
  region.value = r
  list.value = r ? conditionsForRegion(r.id) : []
})

function goBody() { uni.reLaunch({ url: '/pages/body/body' }) }
</script>

<style scoped>
.region-head { margin-bottom: 16rpx; }
.region-name { font-size: 32rpx; font-weight: 700; color: #1f1f1f; }
.region-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #8a8a8a; line-height: 1.6; }
.empty { padding: 32px 20px; text-align: center; }
.empty-title { display: block; color: var(--color-text); font-size: 17px; font-weight: 760; }
.empty-copy { display: block; max-width: 460px; margin: 7px auto 16px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
</style>
