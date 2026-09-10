import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { trainingDayExerciseGroups } from '../src/data/training-core.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const conditions = readJson('content/conditions.json').conditions
const rehabilitationExercises = readJson('content/exercises.json').exercises
const performanceExercises = readJson('content/performance-exercises.json').exercises
const exercises = [...rehabilitationExercises, ...performanceExercises]
const rehabilitationGuidance = readJson('content/exercise-guidance.json').guidance
const performanceGuidance = readJson('content/performance-guidance.json').guidance
const guidance = [...rehabilitationGuidance, ...performanceGuidance]
const regions = readJson('content/regions.json').regions
const videos = readJson('content/videos.json').videos
const trainingSplits = readJson('content/training-splits.json')
const functionalPrograms = readJson('content/functional-programs.json')

const ids = (items) => new Set(items.map((item) => item.id))

test('all 41 exercises have complete guidance and a project-owned image', () => {
  assert.equal(rehabilitationExercises.length, 19)
  assert.equal(performanceExercises.length, 22)
  assert.equal(exercises.length, 41)
  assert.equal(guidance.length, exercises.length)
  assert.deepEqual([...ids(guidance)].sort(), [...ids(exercises)].sort())
  guidance.forEach((item) => {
    for (const field of ['image', 'imageAlt', 'purpose', 'dosage', 'side', 'regression', 'progression']) {
      assert.ok(item[field], `${item.id} is missing ${field}`)
    }
    for (const field of ['setup', 'stopConditions', 'references']) {
      assert.ok(Array.isArray(item[field]) && item[field].length > 0, `${item.id} is missing ${field}`)
    }
    assert.ok(existsSync(resolve(root, 'src', item.image)), `${item.id} image is missing: ${item.image}`)
    item.references.forEach((source) => assert.doesNotThrow(() => new URL(source.url)))
  })
})

test('five split templates resolve every support action and keep chest legs back as default', () => {
  const exerciseIds = ids(exercises)
  assert.equal(trainingSplits.defaultId, 'split-chest-legs-back')
  assert.equal(trainingSplits.splits.length, 5)
  assert.deepEqual(new Set(trainingSplits.splits.map((split) => split.id)).size, 5)
  trainingSplits.splits.forEach((split) => {
    assert.ok(split.name && split.audience && split.frequency && split.summary)
    assert.ok(Array.isArray(split.advantages) && split.advantages.length)
    assert.ok(Array.isArray(split.tradeoffs) && split.tradeoffs.length)
    assert.ok(split.recovery)
    assert.equal(split.days.length, 7)
    assert.deepEqual([...split.days.map((day) => day.weekday)].sort(), [0, 1, 2, 3, 4, 5, 6])
    split.days.forEach((day) => (day.supportExerciseIds || []).forEach((id) => {
      assert.ok(exerciseIds.has(id), `${split.id} references missing support action ${id}`)
    }))
  })
})

test('Thursday chest B keeps the example lower-chain concerns out of Today', () => {
  const split = trainingSplits.splits.find((item) => item.id === trainingSplits.defaultId)
  const day = split.days.find((item) => item.weekday === 4)
  const selectedConditionIds = [
    'cond-ankle-dorsiflex-right',
    'cond-pelvic-rotation',
    'cond-thoracic-shift-right',
    'cond-scapular-weakness-right',
    'cond-humeral-anterior-glide',
  ]
  const result = trainingDayExerciseGroups({ conditions, selectedConditionIds, day })
  assert.deepEqual(result.preparationIds, ['ex-cat-cow', 'ex-ytw', 'ex-band-external-rotation'])
  assert.equal(result.personalRehabIds.length, 3)
  const lowerChainIds = new Set([
    'ex-knee-to-wall', 'ex-calf-foamroll', 'ex-dead-bug',
    'ex-clamshell', 'ex-bird-dog', 'ex-side-lying-abduction',
  ])
  result.allIds.forEach((id) => assert.ok(!lowerChainIds.has(id), `chest day leaked lower-chain action ${id}`))
})

test('sport tracks contain resolved purpose-led modules and the confirmed 22 performance actions', () => {
  const confirmedIds = new Set([
    'ex-calf-raise', 'ex-soleus-raise', 'ex-step-down', 'ex-runner-lunge-balance',
    'ex-farmer-carry', 'ex-front-rack-carry', 'ex-bear-crawl', 'ex-walking-lunge', 'ex-sled-push-rehearsal', 'ex-wall-ball-rehearsal',
    'ex-kettlebell-swing', 'ex-turkish-get-up', 'ex-landmine-rotation', 'ex-med-ball-rotational-throw', 'ex-med-ball-slam', 'ex-box-jump',
    'ex-broad-jump-stick', 'ex-lateral-bound', 'ex-cossack-squat', 'ex-front-rack-reverse-lunge', 'ex-suitcase-carry', 'ex-copenhagen-plank',
  ])
  assert.deepEqual(ids(performanceExercises), confirmedIds)
  assert.deepEqual(functionalPrograms.tracks.map((track) => track.id), ['running', 'hyrox', 'fitness'])
  const exerciseIds = ids(exercises)
  functionalPrograms.tracks.forEach((track) => {
    assert.equal(track.modules.length, 3)
    track.modules.forEach((module) => {
      assert.ok(module.name && module.purpose && module.duration && module.frequency && module.placement)
      assert.ok(module.exercises.length)
      module.exercises.forEach((item) => {
        assert.ok(exerciseIds.has(item.exerciseId), `${track.id}/${module.id} references missing ${item.exerciseId}`)
        assert.ok(item.purpose, `${track.id}/${module.id}/${item.exerciseId} is missing purpose`)
      })
    })
  })
  const fitness = functionalPrograms.tracks.find((track) => track.id === 'fitness')
  assert.deepEqual(fitness.modules.filter((module) => module.priority === 'primary').map((module) => module.code), ['A', 'C'])
  assert.deepEqual(fitness.modules.filter((module) => module.priority === 'optional').map((module) => module.code), ['B'])
  const forbiddenWarmups = new Set(['ex-90-90-hip-switch', 'ex-shoulder-cars', 'ex-hip-cars'])
  fitness.modules.flatMap((module) => module.exercises).forEach((item) => assert.ok(!forbiddenWarmups.has(item.exerciseId)))
})

test('pes anserine guidance is searchable by confirmed common terms', () => {
  const condition = conditions.find((item) => item.id === 'cond-pes-anserine')
  assert.ok(condition)
  const searchable = [condition.name, ...(condition.aliases || []), ...(condition.tags || [])].join(' ')
  ;['鹅足', '鹅足滑囊炎', '膝内侧'].forEach((term) => assert.ok(searchable.includes(term)))
  assert.ok(condition.redFlags.length)
  assert.ok(condition.differentialNotes.length)
  assert.ok(condition.managementGuidance.length)
})

test('condition, region, exercise, and relationship references resolve', () => {
  const conditionIds = ids(conditions)
  const exerciseIds = ids(exercises)
  const regionIds = ids(regions)
  conditions.forEach((condition) => {
    condition.regions.forEach((id) => assert.ok(regionIds.has(id), `${condition.id} references missing region ${id}`))
    ;(condition.references || []).forEach((source) => {
      assert.ok(source.name, `${condition.id} condition source is missing a name`)
      assert.doesNotThrow(() => new URL(source.url), `${condition.id} condition source has an invalid URL`)
    })
    ;[...(condition.rehabExercises || []), ...(condition.prevention || [])].forEach((id) => assert.ok(exerciseIds.has(id), `${condition.id} references missing exercise ${id}`))
    ;[...(condition.upstreamCauses || []), ...(condition.downstreamSymptoms || [])].forEach((link) => {
      assert.ok(conditionIds.has(link.conditionId), `${condition.id} references missing condition ${link.conditionId}`)
      assert.ok(['personal-observation', 'source-supported', 'needs-validation'].includes(link.status), `${condition.id} has invalid relationship status`)
      if (link.status === 'source-supported') {
        assert.ok(link.reference?.name, `${condition.id} source-supported relationship is missing a source name`)
        assert.doesNotThrow(() => new URL(link.reference.url), `${condition.id} source-supported relationship has an invalid source URL`)
      }
    })
  })
})

test('unverified videos remain marked unavailable to interactive cards', () => {
  assert.ok(videos.some((video) => !video.verified), 'fixture should include unverified media')
  videos.forEach((video) => assert.equal(typeof video.verified, 'boolean'))
})
