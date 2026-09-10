<template>
  <view class="app-nav-shell" aria-label="主要导航">
    <view class="app-nav">
      <view
        v-for="item in items"
        :key="item.id"
        class="app-nav-item"
        :class="{ active: current === item.id }"
        :aria-current="current === item.id ? 'page' : undefined"
        @tap="go(item)"
      >
        <component :is="item.icon" :size="23" :weight="current === item.id ? 'fill' : 'regular'" aria-hidden="true" />
        <text>{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { markRaw } from 'vue'
import { PhHouse, PhPersonArmsSpread, PhPath, PhBarbell } from '@phosphor-icons/vue'

const props = defineProps({
  current: { type: String, required: true },
})

const items = [
  { id: 'today', label: '今日', path: '/pages/index/index', icon: markRaw(PhHouse) },
  { id: 'body', label: '身体', path: '/pages/body/body', icon: markRaw(PhPersonArmsSpread) },
  { id: 'chain', label: '动力链', path: '/pages/profile/profile', icon: markRaw(PhPath) },
  { id: 'training', label: '训练', path: '/pages/training/training', icon: markRaw(PhBarbell) },
]

function go(item) {
  if (item.id === props.current) return
  uni.reLaunch({ url: item.path })
}
</script>

<style scoped>
.app-nav-shell {
  position: fixed;
  z-index: 100;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 100%;
  padding: 0 12px calc(8px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  pointer-events: none;
}
.app-nav {
  width: min(100%, 520px);
  max-width: 100%;
  min-height: 64px;
  margin: 0 auto;
  padding: 4px 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  border: 1px solid rgba(23, 74, 72, 0.12);
  border-radius: 22px;
  background: rgba(253, 252, 248, 0.94);
  box-shadow: 0 12px 34px rgba(22, 34, 32, 0.16);
  backdrop-filter: blur(18px);
  pointer-events: auto;
}
.app-nav-item {
  min-height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  border-radius: 16px;
}
.app-nav-item.active {
  color: var(--color-teal-700);
  background: var(--color-teal-050);
}

@media (min-width: 900px) {
  .app-nav-shell {
    top: 0;
    bottom: 0;
    right: auto;
    width: 220px;
    padding: 28px 20px;
    display: flex;
    align-items: flex-start;
  }
  .app-nav {
    width: 100%;
    min-height: 0;
    margin: 72px 0 0;
    padding: 8px;
    grid-template-columns: 1fr;
    gap: 4px;
    border-radius: 24px;
  }
  .app-nav-item {
    min-height: 52px;
    padding: 0 15px;
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    font-size: 14px;
  }
}
</style>
