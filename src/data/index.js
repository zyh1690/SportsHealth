/**
 * 内容数据层 —— App 启动时整体加载 content/ 下的 JSON。
 * 提供查询/检索/关联解析等 helper。纯前端，无后端。
 */
import regionsData from '../../content/regions.json'
import conditionsData from '../../content/conditions.json'
import exercisesData from '../../content/exercises.json'
import videosData from '../../content/videos.json'
import planData from '../../content/plan.json'
import musclesData from '../../content/muscles.json'
import exerciseGuidanceData from '../../content/exercise-guidance.json'
import performanceExercisesData from '../../content/performance-exercises.json'
import performanceGuidanceData from '../../content/performance-guidance.json'
import trainingSplitsData from '../../content/training-splits.json'
import functionalProgramsData from '../../content/functional-programs.json'
import { collectSelectedRelationshipEdges, groupRelationshipGraph } from './graph-core.mjs'
import { resolveSelectedSplit, splitDayForWeekday, sportModuleSuggestion, weekRotationIndex } from './training-core.mjs'

const allGuidance = [...exerciseGuidanceData.guidance, ...performanceGuidanceData.guidance]
const allExercises = [...exercisesData.exercises, ...performanceExercisesData.exercises]
const guidanceMap = Object.fromEntries(allGuidance.map((item) => [item.id, item]))
const enrichedExercises = allExercises.map((exercise) => ({
  ...exercise,
  ...(guidanceMap[exercise.id] || {}),
}))

export const db = {
  regions: regionsData.regions,
  conditions: conditionsData.conditions,
  exercises: enrichedExercises,
  videos: videosData.videos,
  plan: planData,
  muscles: musclesData.muscles,
  trainingSplits: trainingSplitsData.splits,
  defaultSplitId: trainingSplitsData.defaultId,
  functionalTracks: functionalProgramsData.tracks,
}

const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]))
const regionMap = byId(db.regions)
const conditionMap = byId(db.conditions)
const exerciseMap = byId(db.exercises)
const videoMap = byId(db.videos)
const functionalTrackMap = byId(db.functionalTracks)

export const getRegion = (id) => regionMap[id]
export const getCondition = (id) => conditionMap[id]
export const getExercise = (id) => exerciseMap[id]
export const getVideo = (id) => videoMap[id]
export const getFunctionalTrack = (id) => functionalTrackMap[id]

/** 某部位下有多少块肌肉（用于人体图肌肉层） */
export const muscleCountByRegion = (() => {
  const m = {}
  musclesData.muscles.forEach((x) => { m[x.regionId] = (m[x.regionId] || 0) + 1 })
  return m
})()
/** 部位 regionId → 肌肉分组键（肩/胸/髋…），用于跳转肌肉库筛选 */
export const muscleKeyByRegionId = (() => {
  const m = {}
  musclesData.muscles.forEach((x) => { if (!m[x.regionId]) m[x.regionId] = x.key })
  return m
})()

/** 某部位下的全部伤病 */
export function conditionsForRegion(regionId) {
  return db.conditions.filter((c) => c.regions.includes(regionId))
}

/** 全局搜索：命中主名或任一别名（含拼音别名） */
export function searchConditions(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []
  return db.conditions.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true
    return c.aliases.some((a) => a.toLowerCase().includes(q))
  })
}

/** 动力链关联解析：根据 ChainLink 拿关联伤病对象 */
export function resolveLink(link) {
  return conditionMap[link.conditionId]
}

/** 展开一个伤病关联到的动作对象列表 */
export function resolveExercises(ids) {
  return ids.map((id) => exerciseMap[id]).filter(Boolean)
}

/**
 * 动力链子图：只看「用户已选伤病集合内部」的有向关联（上下游）。
 * 返回 [{ from, to, note, status }]。方向只用于组织观察顺序，不声明因果。
 */
export function chainEdges(selectedIds) {
  return collectSelectedRelationshipEdges(db.conditions, selectedIds)
}

/** 将全部已选关系按弱连通分组；不会因“最长路径”丢弃节点或边。 */
export function chainGroups(selectedIds, edges = chainEdges(selectedIds)) {
  return groupRelationshipGraph(selectedIds, edges)
}

/** 汇总一组伤病的所有康复 + 预防动作 id（去重） */
export function aggregateExerciseIds(conditionIds) {
  const ids = new Set()
  for (const id of conditionIds) {
    const c = conditionMap[id]
    if (!c) continue
    ;(c.rehabExercises || []).forEach((x) => ids.add(x))
    ;(c.prevention || []).forEach((x) => ids.add(x))
  }
  return [...ids]
}

/** 去重取得一个星期计划块中的全部动作。 */
export function exerciseIdsForPlanDay(day) {
  if (!day) return []
  return [...new Set([
    ...(day.supportExerciseIds || []),
    ...(day.warmup || []),
    ...(day.functional || []).map((item) => item.id),
  ])]
}

/** 当前关注动作优先，并补充当天星期计划；Today 与 Training 共用。 */
export function currentSessionExerciseIds(conditionIds, day) {
  return [...new Set([...aggregateExerciseIds(conditionIds), ...exerciseIdsForPlanDay(day)])]
}

export function selectedTrainingSplit(id) {
  return resolveSelectedSplit(db.trainingSplits, id, db.defaultSplitId)
}

export function trainingDayForSplit(splitId, weekday = new Date().getDay()) {
  return splitDayForWeekday(selectedTrainingSplit(splitId), weekday)
}

export function suggestedSportModule(trackId, date = new Date()) {
  return sportModuleSuggestion(getFunctionalTrack(trackId), weekRotationIndex(date))
}

export function exercisesForFunctionalModule(module) {
  return (module?.exercises || []).map((item) => ({
    ...item,
    exercise: getExercise(item.exerciseId),
  })).filter((item) => item.exercise)
}

/** 合并康复与日常维护动作，并保留每个动作承担的角色。 */
export function conditionExerciseRoles(condition) {
  const roles = new Map()
  for (const id of condition?.rehabExercises || []) {
    roles.set(id, { id, role: '重点练习' })
  }
  for (const id of condition?.prevention || []) {
    const current = roles.get(id)
    roles.set(id, { id, role: current ? '重点练习 · 日常维护' : '日常维护' })
  }
  return [...roles.values()]
}

export function assetUrl(path) {
  if (!path) return ''
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}
