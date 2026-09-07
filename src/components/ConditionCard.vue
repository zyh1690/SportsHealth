<template>
  <view class="cond-card" @tap="open">
    <view class="row">
      <text class="name">{{ condition.name }}</text>
      <text class="count">{{ condition.rehabExercises.length }} 个动作</text>
    </view>
    <text v-if="condition.aliases && condition.aliases.length" class="aliases">
      {{ condition.aliases.slice(0, 3).join(' · ') }}
    </text>
    <text class="symptom">{{ condition.symptoms }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  condition: { type: Object, required: true },
})
function open() {
  uni.navigateTo({ url: '/pages/condition/condition?id=' + props.condition.id })
}
</script>

<style scoped>
.cond-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.row { display: flex; align-items: baseline; justify-content: space-between; }
.name { font-size: 17px; font-weight: 600; color: #1f1f1f; }
.count { font-size: 12px; color: #9b9b9b; }
.aliases { display: block; font-size: 12px; color: #8a8a8a; margin: 4px 0 6px; }
.symptom { font-size: 13px; color: #4a4a4a; line-height: 1.5; display: block; }
</style>
