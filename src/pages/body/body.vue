<template>
  <view class="workspace-page">
    <view class="workspace-main">
      <view class="page-header">
        <view>
          <text class="page-title">身体</text>
          <text class="page-subtitle">从部位、问题或肌肉开始探索；加入关注后会同步到今日、动力链和训练。</text>
        </view>
      </view>

      <view class="segmented-control body-tabs">
        <view v-for="tab in tabs" :key="tab.id" class="segmented-item" :class="{ active: mode === tab.id }" @tap="mode = tab.id">{{ tab.label }}</view>
      </view>

      <view v-if="mode === 'map'" class="body-map-layout">
        <view class="map-card surface-card">
          <view class="map-controls">
            <view class="small-segment">
              <view :class="{ active: view === 'front' }" @tap="view = 'front'">正面</view>
              <view :class="{ active: view === 'back' }" @tap="view = 'back'">背面</view>
            </view>
            <text>点击圆点选择部位</text>
          </view>
          <BodyMap :regions="regions" :view="view" :width="mapWidth" layer="region" @open="openRegion" />
          <text class="map-attribution">AI 生成教学模型 · 仅作部位导航，不是精确解剖图</text>
        </view>
        <view class="map-aside">
          <view class="section-heading"><view><text class="section-title">常用部位</text><text class="section-note">快速打开对应问题</text></view></view>
          <view class="region-grid">
            <view v-for="region in commonRegions" :key="region.id" class="region-button" @tap="openRegion(region.id)">
              <text>{{ region.name }}</text><PhCaretRight :size="16" />
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="mode === 'conditions'" class="condition-view">
        <view class="search-field surface-card">
          <PhMagnifyingGlass :size="20" />
          <input v-model="query" placeholder="搜索：膝前痛、踝背屈、肩部……" aria-label="搜索身体问题" />
          <view v-if="query" class="clear-search" @tap="query = ''"><PhX :size="16" /></view>
        </view>
        <view class="condition-toolbar">
          <text>{{ filteredConditions.length }} 条内容</text>
          <text>{{ selectedConditionIds.length }} 项已关注</text>
        </view>
        <view class="condition-grid">
          <ConditionCard
            v-for="condition in filteredConditions"
            :key="condition.id"
            :condition="condition"
            selectable
            :selected="selectedSet.has(condition.id)"
            @toggle="toggleCondition"
          />
        </view>
        <view v-if="!filteredConditions.length" class="empty-state">
          <text class="empty-state-title">没有匹配结果</text>
          <text class="empty-state-copy">试试更短的部位词，例如“膝”“肩”或“腰”。</text>
        </view>
      </view>

      <view v-else class="muscle-view">
        <view class="muscle-intro surface-card">
          <PhInfo :size="22" weight="duotone" />
          <text>肌肉库用于认识名称和所属部位，不用于根据单块肌肉自行诊断疼痛。</text>
        </view>
        <view class="muscle-toolbar">
          <view class="search-field surface-card">
            <PhMagnifyingGlass :size="20" />
            <input v-model="muscleQuery" placeholder="搜索肌肉英文名或 FMA 编号" aria-label="搜索肌肉" />
            <view v-if="muscleQuery" class="clear-search" @tap="muscleQuery = ''"><PhX :size="16" /></view>
          </view>
          <view class="muscle-filter-row">
            <view class="category-chip" :class="{ active: muscleKey === '' }" @tap="muscleKey = ''">全部</view>
            <view v-for="group in muscleGroups" :key="group.key" class="category-chip" :class="{ active: muscleKey === group.key }" @tap="muscleKey = group.key">{{ group.region }}</view>
          </view>
        </view>

        <view class="condition-toolbar">
          <text>{{ muscleMatches.length }} 个结构条目</text>
          <text v-if="muscleMatches.length > visibleMuscles.length">当前显示前 {{ visibleMuscles.length }} 项，可继续搜索缩小范围</text>
        </view>

        <view class="muscle-layout">
          <view class="muscle-list surface-card">
            <view v-for="muscle in visibleMuscles" :key="muscle.id" class="muscle-row" :class="{ active: selectedMuscle?.id === muscle.id }" @tap="selectedMuscle = muscle">
              <view><text class="muscle-name">{{ muscle.name }}</text><text class="muscle-meta">{{ muscle.region }} · {{ sideLabel(muscle.side) }} · {{ muscle.fma }}</text></view>
              <PhCaretRight :size="16" />
            </view>
            <view v-if="!visibleMuscles.length" class="empty-muscle-list">
              <text class="muscle-detail-name">没有匹配结构</text>
              <text class="muscle-detail-note">试试英文名称的一部分，或清除部位筛选。</text>
              <view class="secondary-button" @tap="clearMuscleFilters">清除筛选</view>
            </view>
          </view>

          <view v-if="selectedMuscle" class="muscle-detail surface-card">
            <text class="muscle-detail-name">{{ selectedMuscle.name }}</text>
            <text class="muscle-detail-note">这是名称与归属信息，不代表该结构就是疼痛来源。</text>
            <view class="muscle-facts">
              <view><text>部位</text><view>{{ selectedMuscle.region }}</view></view>
              <view><text>侧别</text><view>{{ sideLabel(selectedMuscle.side) }}</view></view>
              <view><text>FMA</text><view>{{ selectedMuscle.fma }}</view></view>
            </view>
            <view class="secondary-button" @tap="openRegion(selectedMuscle.regionId)">查看该部位问题 <PhArrowSquareOut :size="16" /></view>
          </view>

          <view v-else class="muscle-detail empty-muscle-detail surface-card">
            <text class="muscle-detail-name">选择一个结构</text>
            <text class="muscle-detail-note">这里会显示部位、侧别和 FMA 编号，并提供到相关身体问题的入口。</text>
          </view>
        </view>
      </view>

      <view class="legal-note">内容用于自我记录和一般运动教育，不能替代医生或物理治疗师的检查。</view>
    </view>
    <AppNav current="body" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PhArrowSquareOut, PhCaretRight, PhInfo, PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'
import AppNav from '../../components/AppNav.vue'
import BodyMap from '../../components/BodyMap.vue'
import ConditionCard from '../../components/ConditionCard.vue'
import { db, searchConditions } from '../../data/index.js'
import { useWorkspace } from '../../stores/workspace.js'

const tabs = [{ id: 'map', label: '身体地图' }, { id: 'conditions', label: '问题库' }, { id: 'muscles', label: '肌肉参考' }]
const mode = ref('map')
const view = ref('front')
const query = ref('')
const muscleQuery = ref('')
const muscleKey = ref('')
const selectedMuscle = ref(null)
const windowWidth = uni.getSystemInfoSync?.().windowWidth || 390
const mapWidth = ref(windowWidth < 700
  ? Math.max(220, Math.min(250, windowWidth - 76))
  : 300)
const regions = db.regions
const commonIds = ['region-shoulder-right', 'region-thoracic-spine', 'region-lumbar', 'region-hip-left', 'region-knee-right', 'region-ankle-right']
const commonRegions = computed(() => commonIds.map((id) => regions.find((item) => item.id === id)).filter(Boolean))
const { selectedConditionIds, selectedSet, toggleCondition } = useWorkspace()
const filteredConditions = computed(() => query.value.trim() ? searchConditions(query.value) : db.conditions)
const muscleGroupOrder = ['head', 'shoulder', 'scapula', 'chest', 'elbow', 'wrist', 'thoracic', 'abdomen', 'lumbar', 'hip', 'glute', 'knee', 'ankle']
const muscleGroups = computed(() => {
  const groups = new Map()
  db.muscles.forEach((muscle) => {
    const current = groups.get(muscle.key) || { key: muscle.key, region: muscle.region, count: 0 }
    current.count += 1
    groups.set(muscle.key, current)
  })
  return [...groups.values()].sort((a, b) => muscleGroupOrder.indexOf(a.key) - muscleGroupOrder.indexOf(b.key))
})
const muscleMatches = computed(() => {
  const keyword = muscleQuery.value.trim().toLowerCase()
  return db.muscles.filter((muscle) => {
    if (muscleKey.value && muscle.key !== muscleKey.value) return false
    if (!keyword) return true
    return [muscle.name, muscle.fma, muscle.region].some((value) => String(value || '').toLowerCase().includes(keyword))
  })
})
const visibleMuscles = computed(() => muscleMatches.value.slice(0, 60))

function openRegion(id) { uni.navigateTo({ url: `/pages/region/region?id=${id}` }) }
function sideLabel(side) { return side === 'R' ? '右侧' : side === 'L' ? '左侧' : '居中' }
function clearMuscleFilters() { muscleQuery.value = ''; muscleKey.value = '' }
</script>

<style scoped>
.body-tabs { margin-bottom: 18px; }
.map-card { padding: 14px; overflow: hidden; }
.map-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--color-text-muted); font-size: 10px; }
.small-segment { padding: 3px; display: flex; gap: 3px; background: var(--color-surface-soft); border-radius: 11px; }
.small-segment view { min-height: 44px; padding: 0 13px; display: flex; align-items: center; color: var(--color-text-muted); border-radius: 9px; font-size: 11px; font-weight: 650; }
.small-segment view.active { color: var(--color-teal-800); background: #fff; box-shadow: 0 2px 7px rgba(24, 42, 39, 0.08); }
.map-attribution { display: block; margin-top: 8px; color: var(--color-text-muted); font-size: 9px; text-align: center; }
.region-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.region-button { min-height: 50px; padding: 0 13px; display: flex; align-items: center; justify-content: space-between; color: var(--color-text); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 14px; font-size: 12px; font-weight: 700; }
.search-field { min-height: 52px; padding: 0 15px; display: flex; align-items: center; gap: 10px; color: var(--color-teal-700); }
.search-field input { min-width: 0; height: 52px; flex: 1; color: var(--color-text); font-size: 14px; }
.clear-search { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
.condition-toolbar { min-height: 48px; display: flex; align-items: center; justify-content: space-between; color: var(--color-text-muted); font-size: 11px; }
.muscle-intro { padding: 15px; display: flex; align-items: flex-start; gap: 10px; color: var(--color-teal-700); }
.muscle-intro text { color: var(--color-text-secondary); font-size: 12px; line-height: 1.6; }
.muscle-toolbar { margin-top: 12px; display: grid; gap: 10px; }
.muscle-filter-row { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
.category-chip { min-height: 44px; padding: 0 13px; display: flex; align-items: center; flex: 0 0 auto; color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--border-soft); border-radius: 999px; font-size: 11px; font-weight: 680; }
.category-chip.active { color: #fff; background: var(--color-teal-700); border-color: var(--color-teal-700); }
.muscle-layout { display: grid; gap: 12px; }
.muscle-list { overflow: hidden; }
.muscle-row { min-height: 64px; padding: 11px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-top: 1px solid var(--border-soft); }
.muscle-row:first-child { border-top: 0; }
.muscle-row.active { color: var(--color-teal-800); background: var(--color-teal-050); }
.empty-muscle-list { padding: 28px 18px; text-align: center; }
.muscle-name { display: block; font-size: 13px; font-weight: 720; }
.muscle-meta { display: block; margin-top: 4px; color: var(--color-text-muted); font-size: 10px; }
.muscle-detail { padding: 17px; align-self: start; }
.muscle-detail-name { display: block; font-size: 17px; font-weight: 770; }
.muscle-detail-note { display: block; margin-top: 6px; color: var(--color-text-secondary); font-size: 11px; line-height: 1.55; }
.muscle-facts { margin: 14px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.muscle-facts > view { padding: 9px; background: var(--color-surface-soft); border-radius: 10px; }
.muscle-facts text { display: block; color: var(--color-text-muted); font-size: 9px; }
.muscle-facts > view > view { margin-top: 3px; color: var(--color-text); font-size: 11px; font-weight: 680; }
.empty-muscle-detail { text-align: center; }

@media (min-width: 720px) {
  .body-map-layout { display: grid; grid-template-columns: minmax(360px, 0.95fr) minmax(300px, 1.05fr); gap: 22px; align-items: start; }
  .map-aside .section-heading { margin-top: 0; }
  .condition-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .condition-grid :deep(.condition-card) { margin-bottom: 0; }
  .muscle-layout { grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr); align-items: start; }
  .muscle-detail { position: sticky; top: 28px; }
}
</style>
