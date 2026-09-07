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

export const db = {
  regions: regionsData.regions,
  conditions: conditionsData.conditions,
  exercises: exercisesData.exercises,
  videos: videosData.videos,
  plan: planData,
  muscles: musclesData.muscles,
}

const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]))
const regionMap = byId(db.regions)
const conditionMap = byId(db.conditions)
const exerciseMap = byId(db.exercises)
const videoMap = byId(db.videos)

export const getRegion = (id) => regionMap[id]
export const getCondition = (id) => conditionMap[id]
export const getExercise = (id) => exerciseMap[id]
export const getVideo = (id) => videoMap[id]

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
export function resolveExercises(ids, memo = {}) {
  return ids.map((id) => exerciseMap[id]).filter(Boolean)
}

/** 我的身体档案默认载入的旗舰动力链（你自己的问题：右脚踝→…→肱骨前移） */
export const FLAGSHIP_CHAIN = [
  'cond-ankle-dorsiflex-right',
  'cond-pelvic-rotation',
  'cond-thoracic-shift-right',
  'cond-scapular-weakness-right',
  'cond-humeral-anterior-glide',
]

/**
 * 动力链子图：只看「用户已选伤病集合内部」的有向关联（上下游）。
 * 返回 [{ from, to, note }]，方向 = from → to（from 是上游/根因，to 是下游症状）。
 */
export function chainEdges(selectedIds) {
  const sel = new Set(selectedIds)
  const edgesMap = new Map()
  for (const id of sel) {
    const c = conditionMap[id]
    if (!c) continue
    for (const l of c.downstreamSymptoms || []) {
      if (sel.has(l.conditionId)) {
        const k = id + '>' + l.conditionId
        if (!edgesMap.has(k)) edgesMap.set(k, { from: id, to: l.conditionId, note: l.note })
      }
    }
  }
  return [...edgesMap.values()]
}

/**
 * 在链子图中找「最长主链」（节点数最多的有向路径）。
 * 小规模图直接 DFS 枚举足够，用于把用户的问题串成一条主线展示。
 */
export function findSpine(edges) {
  const adj = {}
  const nodes = new Set()
  for (const e of edges) {
    nodes.add(e.from); nodes.add(e.to)
    ;(adj[e.from] ||= []).push(e.to)
  }
  let best = []
  function dfs(node, path) {
    if (path.length > best.length) best = [...path]
    for (const n of adj[node] || []) {
      if (!path.includes(n)) dfs(n, [...path, n])
    }
  }
  for (const n of nodes) dfs(n, [n])
  return best
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
