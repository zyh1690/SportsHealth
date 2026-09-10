<template>
  <view v-if="allIds.length" class="chain-layout">
    <view class="groups-panel">
      <view v-if="groups.length" class="group-grid">
        <view v-for="(group, groupIndex) in groups" :key="group.id" class="chain-card">
          <view class="group-heading">
            <view>
              <text class="group-kicker">动力链 {{ groupIndex + 1 }}</text>
              <text class="group-title">{{ group.nodeIds.length }} 个观察项 · {{ group.edges.length }} 条关系</text>
            </view>
            <text v-if="group.hasCycle" class="cycle-badge">含循环关系</text>
          </view>

          <view class="node-grid">
            <view v-for="(id, nodeIndex) in group.nodeIds" :key="id" class="node-entry">
              <view class="path-node" :class="{ active: activeId === id }" @tap="activeId = id">
                <text class="node-step">{{ nodeIndex + 1 }}</text>
                <view class="node-copy">
                  <text class="node-name">{{ conditionName(id) }}</text>
                  <text class="node-tag">{{ conditionTag(id) }}</text>
                </view>
              </view>
              <ChainDetail
                v-if="activeId === id"
                class="inline-detail"
                :condition="activeCondition"
                :relations="activeRelations"
                :active-id="activeId"
              />
            </view>
          </view>

          <view class="edge-list">
            <view v-for="relation in group.edges" :key="relation.from + '>' + relation.to" class="edge-row" @tap="activeId = relation.from">
              <text>{{ conditionName(relation.from) }}</text>
              <view class="edge-direction"><PhArrowRight :size="15" weight="bold" /><text>{{ statusLabel(relation.status) }}</text></view>
              <text>{{ conditionName(relation.to) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="unlinkedIds.length" class="unlinked-card">
        <view class="group-heading">
          <view><text class="group-kicker">待建立关联</text><text class="group-title">{{ unlinkedIds.length }} 个独立观察项</text></view>
        </view>
        <view class="unlinked-list">
          <view v-for="id in unlinkedIds" :key="id" class="unlinked-chip" :class="{ active: activeId === id }" @tap="activeId = id">
            {{ conditionName(id) }}
          </view>
        </view>
        <ChainDetail
          v-if="unlinkedIds.includes(activeId)"
          class="inline-detail unlinked-detail"
          :condition="activeCondition"
          :relations="activeRelations"
          :active-id="activeId"
        />
      </view>
    </view>

    <ChainDetail v-if="activeCondition" class="detail-panel" :condition="activeCondition" :relations="activeRelations" :active-id="activeId" />
  </view>

  <view v-else class="chain-empty">
    <text class="chain-empty-title">还没有你的动力链</text>
    <text class="chain-empty-copy">先在“身体”里选择你想跟踪的问题。关联只是帮助整理观察的假设，不会自动判定原因。</text>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import ChainDetail from './ChainDetail.vue'
import { chainGroups, getCondition } from '../data/index.js'

const props = defineProps({
  edges: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
})

const activeId = ref('')
const groupedGraph = computed(() => chainGroups(props.selectedIds, props.edges))
const groups = computed(() => groupedGraph.value.groups)
const unlinkedIds = computed(() => groupedGraph.value.unlinkedIds)
const allIds = computed(() => [...groups.value.flatMap((group) => group.nodeIds), ...unlinkedIds.value])
const activeCondition = computed(() => getCondition(activeId.value))
const activeRelations = computed(() => props.edges.filter((edge) => edge.from === activeId.value || edge.to === activeId.value))

watch(allIds, (ids) => {
  if (!ids.includes(activeId.value)) activeId.value = ids[0] || ''
}, { immediate: true })

function conditionName(id) { return getCondition(id)?.name || id }
function conditionTag(id) { return getCondition(id)?.tags?.[0] || '观察项' }
function statusLabel(status) {
  return {
    'personal-observation': '个人观察',
    'source-supported': '资料支持',
    'needs-validation': '需验证',
  }[status] || '需验证'
}
</script>

<style scoped>
.chain-layout { display: grid; gap: 14px; }
.groups-panel { min-width: 0; }
.group-grid { display: grid; gap: 12px; }
.chain-card,
.unlinked-card,
.detail-panel {
  min-width: 0;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.node-entry { min-width: 0; }
.inline-detail { margin-top: 8px; }
.detail-panel { display: none; }
.group-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.group-kicker { display: block; color: var(--color-teal-700); font-size: 11px; font-weight: 760; }
.group-title { display: block; margin-top: 4px; color: var(--color-text); font-size: 15px; font-weight: 760; }
.cycle-badge { padding: 5px 8px; color: var(--color-amber-700); background: var(--color-amber-100); border-radius: 999px; font-size: 9px; font-weight: 720; }
.node-grid { margin-top: 13px; display: grid; gap: 8px; }
.path-node { min-height: 68px; padding: 11px; display: flex; align-items: center; gap: 10px; background: #faf9f5; border: 1px solid var(--border-soft); border-radius: 13px; }
.path-node.active { color: #fff; background: var(--color-teal-800); border-color: var(--color-teal-800); }
.node-step { width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; flex: 0 0 25px; color: var(--color-teal-700); background: var(--color-teal-100); border-radius: 50%; font-size: 10px; font-weight: 800; }
.path-node.active .node-step { color: var(--color-teal-800); background: #fff; }
.node-copy { min-width: 0; }
.node-name { display: block; color: inherit; font-size: 12px; font-weight: 750; line-height: 1.35; }
.node-tag { display: block; margin-top: 3px; color: var(--color-text-muted); font-size: 9px; }
.path-node.active .node-tag { color: #bdd6d2; }
.edge-list { margin-top: 12px; padding-top: 10px; display: grid; gap: 7px; border-top: 1px solid var(--border-soft); }
.edge-row { min-height: 44px; padding: 7px 9px; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 7px; color: var(--color-text-secondary); background: var(--color-surface-soft); border-radius: 10px; font-size: 10px; }
.edge-row > text:last-child { text-align: right; }
.edge-direction { display: flex; flex-direction: column; align-items: center; gap: 1px; color: var(--color-teal-600); font-size: 8px; white-space: nowrap; }
.unlinked-card { margin-top: 12px; }
.unlinked-list { margin-top: 11px; display: flex; flex-wrap: wrap; gap: 7px; }
.unlinked-chip { min-height: 44px; padding: 0 11px; display: flex; align-items: center; color: var(--color-text-secondary); background: var(--color-surface-soft); border-radius: 11px; font-size: 11px; font-weight: 650; }
.unlinked-chip.active { color: var(--color-teal-800); background: var(--color-teal-100); }
.chain-empty { padding: 28px 20px; text-align: center; background: var(--color-surface); border: 1px dashed rgba(29, 95, 93, 0.28); border-radius: var(--radius-md); }
.chain-empty-title { display: block; font-size: 17px; font-weight: 760; }
.chain-empty-copy { display: block; max-width: 480px; margin: 7px auto 0; color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }

@media (min-width: 720px) {
  .group-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .chain-layout { grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr); align-items: start; }
  .node-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .inline-detail { display: none; }
  .detail-panel { display: block; position: sticky; top: 28px; }
}
</style>
