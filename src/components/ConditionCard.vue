<template>
  <view class="condition-card">
    <view class="condition-open" @tap="open">
      <view class="condition-copy">
        <view class="condition-title-row">
          <text class="condition-name">{{ condition.name }}</text>
          <text class="condition-count">{{ actionCount }} 个动作</text>
        </view>
        <text class="condition-aliases">{{ condition.aliases?.slice(0, 2).join(' · ') }}</text>
        <text class="condition-symptom">{{ condition.symptoms }}</text>
      </view>
      <PhCaretRight :size="18" aria-hidden="true" />
    </view>
    <view
      v-if="selectable"
      class="select-action"
      :class="{ selected }"
      :aria-label="selected ? '从我的关注中移除' : '加入我的关注'"
      @tap="emit('toggle', condition.id)"
    >
      <PhCheck v-if="selected" :size="16" weight="bold" />
      <PhPlus v-else :size="16" weight="bold" />
      {{ selected ? '已关注' : '加入关注' }}
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { PhCaretRight, PhCheck, PhPlus } from '@phosphor-icons/vue'

const props = defineProps({
  condition: { type: Object, required: true },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])
const actionCount = computed(() => new Set([...(props.condition.rehabExercises || []), ...(props.condition.prevention || [])]).size)
function open() { uni.navigateTo({ url: `/pages/condition/condition?id=${props.condition.id}` }) }
</script>

<style scoped>
.condition-card {
  margin-bottom: 11px;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.condition-open { min-height: 108px; padding: 15px; display: flex; align-items: center; gap: 10px; }
.condition-copy { min-width: 0; flex: 1; }
.condition-title-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.condition-name { color: var(--color-text); font-size: 16px; font-weight: 760; }
.condition-count { flex: 0 0 auto; color: var(--color-teal-700); font-size: 10px; font-weight: 700; }
.condition-aliases { display: block; margin-top: 3px; color: var(--color-text-muted); font-size: 10px; }
.condition-symptom { display: -webkit-box; margin-top: 7px; overflow: hidden; color: var(--color-text-secondary); font-size: 12px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.select-action { min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--color-teal-700); background: #f7f5ef; border-top: 1px solid var(--border-soft); font-size: 12px; font-weight: 720; }
.select-action.selected { color: #fff; background: var(--color-teal-700); }
</style>
