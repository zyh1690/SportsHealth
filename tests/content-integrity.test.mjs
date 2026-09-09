import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const conditions = readJson('content/conditions.json').conditions
const exercises = readJson('content/exercises.json').exercises
const guidance = readJson('content/exercise-guidance.json').guidance
const regions = readJson('content/regions.json').regions
const videos = readJson('content/videos.json').videos

const ids = (items) => new Set(items.map((item) => item.id))

test('all 19 exercises have complete guidance and a project-owned image', () => {
  assert.equal(exercises.length, 19)
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

test('condition, region, exercise, and relationship references resolve', () => {
  const conditionIds = ids(conditions)
  const exerciseIds = ids(exercises)
  const regionIds = ids(regions)
  conditions.forEach((condition) => {
    condition.regions.forEach((id) => assert.ok(regionIds.has(id), `${condition.id} references missing region ${id}`))
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
