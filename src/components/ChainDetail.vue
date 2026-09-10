<template>
  <view v-if="condition" class="chain-detail">
    <view class="detail-topline">
      <view>
        <text class="detail-name">{{ condition.name }}</text>
        <text class="detail-caption">当前选择 · 不等于医学诊断</text>
      </view>
      <view class="detail-link" @tap="goDetail(condition.id)">
        查看详情 <PhArrowSquareOut :size="15" />
      </view>
    </view>
    <text class="detail-description">{{ condition.description }}</text>

    <view v-if="relations.length" class="relation-list">
      <view v-for="relation in relations" :key="relation.from + '>' + relation.to" class="relation-card">
        <view class="relation-head">
          <text class="relation-direction">{{ relation.from === activeId ? '可能关联到' : '可能关联自' }}</text>
          <text class="relation-target">{{ conditionName(relation.from === activeId ? relation.to : relation.from) }}</text>
          <text class="status-badge" :class="relation.status">{{ statusLabel(relation.status) }}</text>
        </view>
        <text class="relation-note">{{ relation.note }}</text>
        <view v-if="relation.reference" class="relation-source" @tap.stop="openUrl(relation.reference.url)">
          <PhBookOpenText :size="16" />
          <text>{{ relation.reference.name }}</text>
          <PhArrowSquareOut :size="14" />
        </view>
      </view>
    </view>
    <view v-else class="detail-empty">目前没有可展示的关联；它仍保留在“待建立关联”中，可独立记录和训练。</view>
  </view>
</template>

<script setup>
import { PhArrowSquareOut, PhBookOpenText } from '@phosphor-icons/vue'
import { getCondition } from '../data/index.js'
import { openUrl } from '../utils/url.js'

defineProps({
  condition: { type: Object, default: null },
  relations: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
})

function conditionName(id) { return getCondition(id)?.name || id }
function statusLabel(status) {
  return {
    'personal-observation': '个人观察',
    'source-supported': '资料支持',
    'needs-validation': '需验证',
  }[status] || '需验证'
}
function goDetail(id) { uni.navigateTo({ url: `/pages/condition/condition?id=${id}` }) }
</script>

<style scoped>
.chain-detail { min-width: 0; padding: 16px; background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: var(--radius-md); box-shadow: var(--shadow-card); }
.detail-topline { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.detail-name { display: block; font-size: 19px; font-weight: 780; }
.detail-caption { display: block; margin-top: 4px; color: var(--color-text-muted); font-size: 11px; }
.detail-link { min-height: 44px; display: flex; align-items: center; gap: 5px; color: var(--color-teal-700); font-size: 12px; font-weight: 700; }
.detail-description { display: block; margin-top: 13px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.65; }
.relation-list { margin-top: 16px; display: grid; gap: 9px; }
.relation-card { padding: 12px; background: #f7f5ef; border-radius: 13px; }
.relation-head { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.relation-direction { color: var(--color-text-muted); font-size: 10px; }
.relation-target { color: var(--color-text); font-size: 12px; font-weight: 750; }
.status-badge { margin-left: auto; padding: 3px 7px; border-radius: 999px; color: var(--color-amber-700); background: var(--color-amber-100); font-size: 9px; font-weight: 720; }
.status-badge.source-supported { color: var(--color-teal-700); background: var(--color-teal-050); }
.status-badge.personal-observation { color: #5f587d; background: #eeebf8; }
.relation-note { display: block; margin-top: 7px; color: var(--color-text-secondary); font-size: 12px; line-height: 1.55; }
.relation-source { min-height: 44px; margin-top: 8px; padding: 0 9px; display: inline-flex; align-items: center; gap: 6px; color: var(--color-teal-700); background: var(--color-teal-050); border-radius: 10px; font-size: 10px; font-weight: 680; }
.detail-empty { margin-top: 16px; padding: 14px; color: var(--color-text-muted); background: #f7f5ef; border-radius: 13px; font-size: 12px; line-height: 1.6; }
</style>
