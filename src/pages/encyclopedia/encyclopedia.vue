<template>
  <view class="container">
    <!-- 搜索 -->
    <view class="search-wrap">
      <PhMagnifyingGlass class="search-icon" :size="18" />
      <input class="search-input" v-model="query" placeholder="搜伤病：如 跑步膝 / 腰痛 / 骨盆旋转" />
    </view>

    <!-- 常见主题快捷 -->
    <view class="quick">
      <text v-for="t in quickTags" :key="t" class="chip primary" @tap="query = t">{{ t }}</text>
    </view>

    <view class="section-title">共 {{ list.length }} 条</view>
    <ConditionCard v-for="c in list" :key="c.id" :condition="c" />
    <view v-if="!list.length" class="empty">
      <text>没有找到相关伤病，试试其他关键词</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import ConditionCard from '../../components/ConditionCard.vue'
import { db, searchConditions } from '../../data/index.js'

const query = ref('')
const quickTags = ['跑步膝', '骨盆旋转', '肱骨前移', '弹响髋', '下背痛']

const list = computed(() => {
  if (!query.value.trim()) return db.conditions
  return searchConditions(query.value)
})
</script>

<style scoped>
.search-wrap {
  display: flex; align-items: center; background: #fff; border-radius: 14px;
  padding: 16rpx 24rpx; margin-top: 10rpx;
}
.search-icon { margin-right: 12rpx; color: var(--color-teal-700); }
.search-input { flex: 1; font-size: 28rpx; color: #1f1f1f; }
.quick { margin: 20rpx 0 8rpx; }
.empty { text-align: center; color: #b5b5b5; font-size: 26rpx; padding: 60rpx 0; }
</style>
