import assert from 'node:assert/strict'
import test from 'node:test'
import { collectSelectedRelationshipEdges, groupRelationshipGraph } from '../src/data/graph-core.mjs'

test('selected edges include upstream-only records and deduplicate mirrored metadata', () => {
  const conditions = [
    { id: 'a', downstreamSymptoms: [{ conditionId: 'b', note: 'downstream' }] },
    { id: 'b', upstreamCauses: [{ conditionId: 'a', note: 'mirror' }] },
    { id: 'c', upstreamCauses: [{ conditionId: 'b', note: 'upstream only', status: 'source-supported' }] },
  ]
  assert.deepEqual(collectSelectedRelationshipEdges(conditions, ['a', 'b', 'c']), [
    { from: 'a', to: 'b', note: 'downstream', status: 'needs-validation', reference: undefined },
    { from: 'b', to: 'c', note: 'upstream only', status: 'source-supported', reference: undefined },
  ])
})

test('empty and singleton selections stay explicit without inventing a chain', () => {
  assert.deepEqual(groupRelationshipGraph([], []), { groups: [], unlinkedIds: [] })
  assert.deepEqual(groupRelationshipGraph(['only'], []), { groups: [], unlinkedIds: ['only'] })
})

test('relationship grouping returns every connected group, node, and edge in stable order', () => {
  const selectedIds = ['ankle', 'knee', 'hip', 'shoulder', 'neck', 'unlinked']
  const edges = [
    { from: 'ankle', to: 'knee', note: 'a' },
    { from: 'knee', to: 'hip', note: 'b' },
    { from: 'shoulder', to: 'neck', note: 'c' },
  ]
  const result = groupRelationshipGraph(selectedIds, edges)
  assert.deepEqual(result.groups.map((group) => group.nodeIds), [
    ['ankle', 'knee', 'hip'],
    ['shoulder', 'neck'],
  ])
  assert.deepEqual(result.groups.flatMap((group) => group.edges.map((edge) => `${edge.from}>${edge.to}`)), [
    'ankle>knee',
    'knee>hip',
    'shoulder>neck',
  ])
  assert.deepEqual(result.unlinkedIds, ['unlinked'])
})

test('branching and cyclic relationships keep each node once and every directed edge', () => {
  const result = groupRelationshipGraph(['a', 'b', 'c', 'd'], [
    { from: 'a', to: 'b' },
    { from: 'a', to: 'c' },
    { from: 'b', to: 'd' },
    { from: 'd', to: 'a' },
    { from: 'a', to: 'b', note: 'duplicate' },
  ])
  assert.deepEqual(result.groups[0].nodeIds, ['a', 'b', 'c', 'd'])
  assert.deepEqual(result.groups[0].edges.map((edge) => `${edge.from}>${edge.to}`), [
    'a>b',
    'a>c',
    'b>d',
    'd>a',
  ])
  assert.equal(result.groups[0].hasCycle, true)
})
