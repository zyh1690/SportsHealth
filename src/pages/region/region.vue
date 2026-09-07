<template>
  <view class="container">
    <view class="region-head card">
      <text class="region-name">{{ region ? region.name : '…' }}</text>
      <text v-if="region && region.description" class="region-desc">{{ region.description }}</text>
    </view>

    <view class="section-title">该部位的常见伤病</view>
    <view v-if="list.length">
      <ConditionCard v-for="c in list" :key="c.id" :condition="c" />
    </view>
    <view v-else class="empty">
      <text>该部位内容整理中，敬请期待</text>
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
</script>

<style scoped>
.region-head { margin-bottom: 16rpx; }
.region-name { font-size: 32rpx; font-weight: 700; color: #1f1f1f; }
.region-desc { display: block; margin-top: 8rpx; font-size: 24rpx; color: #8a8a8a; line-height: 1.6; }
.empty { text-align: center; color: #b5b5b5; font-size: 26rpx; padding: 60rpx 0; }
</style>
