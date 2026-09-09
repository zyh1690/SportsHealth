<template>
  <view v-if="allIds.length" class="chain-layout">
    <view class="path-panel">
      <view class="path-scroll">
        <view class="path-track">
          <template v-for="(id, index) in primaryPath" :key="id">
            <view
              class="path-node"
              :class="{ active: activeId === id }"
              @tap="activeId = id"
            >
              <text class="node-step">{{ index + 1 }}</text>
              <view class="node-copy">
                <text class="node-name">{{ conditionName(id) }}</text>
                <text class="node-tag">{{ conditionTag(id) }}</text>
              </view>
            </view>
            <view v-if="index < primaryPath.length - 1" class="path-connector">
              <PhArrowRight :size="18" weight="bold" aria-hidden="true" />
              <text>{{ statusLabel(edgeBetween(id, primaryPath[index + 1])?.status) }}</text>
            </view>
          </template>
        </view>
      </view>

      <view v-if="branches.length" class="supplement-block">
        <text class="supplement-title">分支观察</text>
        <view class="supplement-list">
          <view v-for="id in branches" :key="id" class="supplement-chip" :class="{ active: activeId === id }" @tap="activeId = id">
            {{ conditionName(id) }}
          </view>
        </view>
      </view>

      <view v-if="isolated.length" class="supplement-block">
        <text class="supplement-title">暂未关联</text>
        <view class="supplement-list">
          <view v-for="id in isolated" :key="id" class="supplement-chip" :class="{ active: activeId === id }" @tap="activeId = id">
            {{ conditionName(id) }}
          </view>
        </view>
      </view>
    </view>

    <view v-if="activeCondition" class="detail-panel">
      <view class="detail-topline">
        <view>
          <text class="detail-name">{{ activeCondition.name }}</text>
          <text class="detail-caption">当前选择 · 不等于医学诊断</text>
        </view>
        <view class="detail-link" @tap="goDetail(activeCondition.id)">
          查看详情 <PhArrowSquareOut :size="15" />
        </view>
      </view>
      <text class="detail-description">{{ activeCondition.description }}</text>

      <view v-if="activeRelations.length" class="relation-list">
        <view v-for="relation in activeRelations" :key="relation.from + relation.to" class="relation-card">
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
      <view v-else class="detail-empty">目前没有可展示的关联；它仍可作为独立问题记录和训练。</view>
    </view>
  </view>

  <view v-else class="chain-empty">
    <text class="chain-empty-title">还没有你的动力链</text>
    <text class="chain-empty-copy">先在“身体”里选择你想跟踪的问题。关联只是帮助整理观察的假设，不会自动判定原因。</text>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PhArrowRight, PhArrowSquareOut, PhBookOpenText } from '@phosphor-icons/vue'
import { findSpine, getCondition } from '../data/index.js'
import { openUrl } from '../utils/url.js'

const props = defineProps({
  edges: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
})

const activeId = ref('')

const allIds = computed(() => {
  const ids = new Set(props.selectedIds)
  props.edges.forEach((edge) => { ids.add(edge.from); ids.add(edge.to) })
  return [...ids]
})

const primaryPath = computed(() => {
  if (!props.edges.length) return []
  return findSpine(props.edges, allIds.value)
})

const connectedIds = computed(() => {
  const ids = new Set()
  props.edges.forEach((edge) => { ids.add(edge.from); ids.add(edge.to) })
  return ids
})
const branches = computed(() => allIds.value.filter((id) => connectedIds.value.has(id) && !primaryPath.value.includes(id)))
const isolated = computed(() => allIds.value.filter((id) => !connectedIds.value.has(id)))
const activeCondition = computed(() => getCondition(activeId.value))
const activeRelations = computed(() => props.edges.filter((edge) => edge.from === activeId.value || edge.to === activeId.value))

watch(allIds, (ids) => {
  if (!ids.includes(activeId.value)) activeId.value = primaryPath.value[0] || ids[0] || ''
}, { immediate: true })

function edgeBetween(from, to) {
  return props.edges.find((edge) => edge.from === from && edge.to === to)
}
function conditionName(id) { return getCondition(id)?.name || id }
function conditionTag(id) { return getCondition(id)?.tags?.[0] || '观察项' }
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
.chain-layout { display: grid; gap: 14px; }
.path-panel,
.detail-panel {
  min-width: 0;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.path-scroll { margin: -4px -16px 0; padding: 4px 16px 10px; overflow-x: auto; scrollbar-width: none; }
.path-track { width: max-content; display: flex; align-items: center; }
.path-node {
  width: 184px;
  min-height: 78px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 15px;
  background: #faf9f5;
}
.path-node.active { color: #fff; background: var(--color-teal-800); border-color: var(--color-teal-800); }
.node-step {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 26px;
  color: var(--color-teal-700);
  background: var(--color-teal-100);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}
.path-node.active .node-step { color: var(--color-teal-800); background: #fff; }
.node-copy { min-width: 0; }
.node-name { display: block; color: inherit; font-size: 13px; font-weight: 750; line-height: 1.35; }
.node-tag { display: block; margin-top: 4px; color: var(--color-text-muted); font-size: 10px; }
.path-node.active .node-tag { color: #bdd6d2; }
.path-connector {
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--color-teal-500);
  font-size: 9px;
}
.supplement-block { padding-top: 14px; border-top: 1px solid var(--border-soft); }
.supplement-title { display: block; color: var(--color-text-muted); font-size: 11px; font-weight: 700; }
.supplement-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 7px; }
.supplement-chip {
  min-height: 44px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  background: var(--color-surface-soft);
  border-radius: 11px;
  font-size: 11px;
  font-weight: 650;
}
.supplement-chip.active { color: var(--color-teal-800); background: var(--color-teal-100); }
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
.chain-empty { padding: 28px 20px; text-align: center; background: var(--color-surface); border: 1px dashed rgba(29, 95, 93, 0.28); border-radius: var(--radius-md); }
.chain-empty-title { display: block; font-size: 17px; font-weight: 760; }
.chain-empty-copy { display: block; max-width: 480px; margin: 7px auto 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }

@media (min-width: 900px) {
  .chain-layout { grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr); align-items: start; }
  .path-scroll { overflow: visible; }
  .path-track { width: 100%; flex-direction: column; align-items: stretch; }
  .path-node { width: 100%; }
  .path-connector { width: 100%; height: 58px; }
  .path-connector :deep(svg) { transform: rotate(90deg); }
  .detail-panel { position: sticky; top: 28px; }
}
</style>
