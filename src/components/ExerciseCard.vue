<template>
  <view class="exercise-card" :class="{ completed: done && trackable }">
    <view class="exercise-summary" @tap="expanded = !expanded">
      <image
        v-if="exercise.image"
        class="exercise-thumb"
        :src="assetUrl(exercise.image)"
        :alt="exercise.imageAlt"
        mode="aspectFill"
        lazy-load
      />
      <view class="exercise-main">
        <view class="exercise-title-row">
          <text class="exercise-name">{{ exercise.name }}</text>
          <view v-if="role" class="role-badge">{{ role }}</view>
        </view>
        <text class="exercise-purpose">{{ exercise.purpose }}</text>
        <view class="exercise-meta">
          <text>{{ categoryLabel }}</text>
          <text>{{ exercise.dosage }}</text>
        </view>
      </view>
      <view class="summary-actions">
        <view
          v-if="trackable"
          class="complete-button"
          :class="{ checked: done }"
          :aria-label="done ? '标记为未完成' : '标记为已完成'"
          @tap.stop="toggle"
        >
          <PhCheck v-if="done" :size="16" weight="bold" />
        </view>
        <PhCaretDown class="caret" :class="{ open: expanded }" :size="17" weight="bold" aria-hidden="true" />
      </view>
    </view>

    <view v-if="expanded" class="exercise-detail">
      <view class="detail-grid">
        <view class="detail-block">
          <text class="detail-label">开始姿势</text>
          <text v-for="item in exercise.setup" :key="item" class="detail-line">{{ item }}</text>
        </view>
        <view class="detail-block">
          <text class="detail-label">动作提示</text>
          <text v-for="item in exercise.cues" :key="item" class="detail-line">{{ item }}</text>
        </view>
        <view class="detail-block compact-block">
          <text class="detail-label">侧别</text>
          <text class="detail-copy">{{ exercise.side }}</text>
        </view>
        <view class="detail-block compact-block">
          <text class="detail-label">器械</text>
          <text class="detail-copy">{{ equipmentLabel }}</text>
        </view>
        <view class="detail-block compact-block">
          <text class="detail-label">退阶</text>
          <text class="detail-copy">{{ exercise.regression }}</text>
        </view>
        <view class="detail-block compact-block">
          <text class="detail-label">进阶</text>
          <text class="detail-copy">{{ exercise.progression }}</text>
        </view>
      </view>

      <view class="warning-block">
        <view class="warning-title"><PhWarningCircle :size="18" weight="fill" /> 常见代偿与停止条件</view>
        <text v-if="exercise.commonErrors?.length" class="warning-copy">避免：{{ exercise.commonErrors.join('；') }}</text>
        <text class="warning-copy">停止：{{ exercise.stopConditions.join('；') }}</text>
      </view>

      <view v-if="verifiedVideos.length || exercise.references?.length" class="resource-row">
        <view v-for="video in verifiedVideos" :key="video.id" class="resource-link" @tap.stop="openUrl(video.url)">
          <PhPlayCircle :size="17" weight="fill" /><text>{{ video.title }}</text><PhArrowSquareOut :size="15" />
        </view>
        <view v-for="source in exercise.references" :key="source.url" class="resource-link" @tap.stop="openUrl(source.url)">
          <PhBookOpenText :size="17" /><text>{{ source.name }}</text><PhArrowSquareOut :size="15" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  PhArrowSquareOut,
  PhBookOpenText,
  PhCaretDown,
  PhCheck,
  PhPlayCircle,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { assetUrl, getVideo } from '../data/index.js'
import { openUrl } from '../utils/url.js'

const props = defineProps({
  exercise: { type: Object, required: true },
  trackable: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
  role: { type: String, default: '' },
  initiallyExpanded: { type: Boolean, default: false },
})

const emit = defineEmits(['update:done'])
const expanded = ref(props.initiallyExpanded)
const categories = { strength: '力量', stability: '稳定', mobility: '活动度', activate: '控制', respiratory: '呼吸' }
const categoryLabel = computed(() => categories[props.exercise.category] || props.exercise.category)
const equipmentLabel = computed(() => props.exercise.equipment?.length ? props.exercise.equipment.join('、') : '无需器械')
const verifiedVideos = computed(() =>
  (props.exercise.videos || []).map((id) => getVideo(id)).filter((item) => item?.verified)
)

function toggle() {
  emit('update:done', !props.done)
}
</script>

<style scoped>
.exercise-card {
  margin-bottom: 12px;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.exercise-card.completed { opacity: 0.72; }
.exercise-summary {
  min-height: 126px;
  padding: 12px;
  display: flex;
  align-items: stretch;
  gap: 13px;
}
.exercise-thumb {
  width: 108px;
  min-height: 100px;
  flex: 0 0 108px;
  border-radius: 13px;
  background: var(--color-surface-soft);
}
.exercise-main {
  min-width: 0;
  flex: 1;
  align-self: center;
}
.exercise-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}
.exercise-name {
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.35;
  font-weight: 760;
}
.role-badge {
  padding: 3px 7px;
  color: var(--color-teal-700);
  background: var(--color-teal-050);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}
.exercise-purpose {
  display: -webkit-box;
  margin-top: 5px;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.exercise-meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px 12px;
  color: var(--color-teal-700);
  font-size: 11px;
  font-weight: 650;
}
.summary-actions {
  width: 44px;
  display: flex;
  flex: 0 0 44px;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
}
.complete-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1.5px solid #aebcb8;
  border-radius: 50%;
}
.complete-button.checked { background: var(--color-teal-700); border-color: var(--color-teal-700); }
.caret { color: var(--color-text-muted); transition: transform 180ms ease; }
.caret.open { transform: rotate(180deg); }
.exercise-detail { padding: 18px; border-top: 1px solid var(--border-soft); }
.detail-grid { display: grid; gap: 17px; }
.detail-block { min-width: 0; }
.detail-label {
  display: block;
  margin-bottom: 7px;
  color: var(--color-teal-700);
  font-size: 12px;
  font-weight: 760;
}
.detail-line,
.detail-copy {
  display: block;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.detail-line::before { content: '•'; margin-right: 7px; color: var(--color-teal-500); }
.warning-block {
  margin-top: 18px;
  padding: 13px 14px;
  background: var(--color-danger-050);
  border-radius: 13px;
}
.warning-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-danger-700);
  font-size: 12px;
  font-weight: 760;
}
.warning-copy { display: block; margin-top: 6px; color: #774f49; font-size: 12px; line-height: 1.55; }
.resource-row { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.resource-link {
  min-height: 44px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-teal-700);
  background: var(--color-teal-050);
  border-radius: 11px;
  font-size: 11px;
  font-weight: 680;
}

@media (max-width: 390px) {
  .exercise-summary { min-height: 112px; }
  .exercise-thumb { width: 92px; min-height: 88px; flex-basis: 92px; }
  .exercise-summary { gap: 10px; }
}
@media (min-width: 720px) {
  .exercise-thumb { width: 150px; min-height: 112px; flex-basis: 150px; }
  .detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .compact-block { padding-top: 2px; }
}
</style>
