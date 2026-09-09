<template>
  <view class="redirect-page">
    <text>正在打开新的训练工作台…</text>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
// Preserve existing GitHub Pages deep links while the visible plan now lives under Training.
onLoad(() => { uni.reLaunch({ url: '/pages/training/training' }) })
</script>

<style scoped>
.redirect-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); background: var(--color-bg); font-size: 13px; }
</style>
