function uniqueStrings(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item) => typeof item === 'string' && item.length > 0))]
}

export function collectSelectedRelationshipEdges(conditions, selectedIds) {
  const orderedIds = uniqueStrings(selectedIds)
  const selectedSet = new Set(orderedIds)
  const conditionMap = new Map((Array.isArray(conditions) ? conditions : []).map((condition) => [condition.id, condition]))
  const edges = new Map()
  const addEdge = (from, to, relationship) => {
    if (!selectedSet.has(from) || !selectedSet.has(to)) return
    const key = `${from}>${to}`
    if (edges.has(key)) return
    edges.set(key, {
      from,
      to,
      note: relationship.note,
      status: relationship.status || 'needs-validation',
      reference: relationship.reference,
    })
  }

  orderedIds.forEach((id) => {
    const condition = conditionMap.get(id)
    if (!condition) return
    ;(condition.downstreamSymptoms || []).forEach((relationship) => addEdge(id, relationship.conditionId, relationship))
    ;(condition.upstreamCauses || []).forEach((relationship) => addEdge(relationship.conditionId, id, relationship))
  })
  return [...edges.values()]
}

function hasDirectedCycle(nodeIds, edges) {
  const nodeSet = new Set(nodeIds)
  const adjacency = new Map(nodeIds.map((id) => [id, []]))
  edges.forEach((edge) => {
    if (nodeSet.has(edge.from) && nodeSet.has(edge.to)) adjacency.get(edge.from).push(edge.to)
  })
  const visiting = new Set()
  const visited = new Set()
  function visit(id) {
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    for (const next of adjacency.get(id) || []) {
      if (visit(next)) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }
  return nodeIds.some(visit)
}

export function groupRelationshipGraph(selectedIds, inputEdges) {
  const orderedIds = uniqueStrings(selectedIds)
  const selectedSet = new Set(orderedIds)
  const rank = new Map(orderedIds.map((id, index) => [id, index]))
  const edges = []
  const edgeKeys = new Set()
  for (const edge of Array.isArray(inputEdges) ? inputEdges : []) {
    if (!selectedSet.has(edge?.from) || !selectedSet.has(edge?.to)) continue
    const key = `${edge.from}>${edge.to}`
    if (edgeKeys.has(key)) continue
    edgeKeys.add(key)
    edges.push(edge)
  }
  const connectedIds = new Set()
  const adjacency = new Map(orderedIds.map((id) => [id, new Set()]))
  edges.forEach((edge) => {
    connectedIds.add(edge.from)
    connectedIds.add(edge.to)
    adjacency.get(edge.from).add(edge.to)
    adjacency.get(edge.to).add(edge.from)
  })

  const seen = new Set()
  const groups = []
  for (const startId of orderedIds) {
    if (!connectedIds.has(startId) || seen.has(startId)) continue
    const queue = [startId]
    const component = []
    seen.add(startId)
    while (queue.length) {
      const id = queue.shift()
      component.push(id)
      const neighbors = [...(adjacency.get(id) || [])]
        .sort((a, b) => rank.get(a) - rank.get(b))
      neighbors.forEach((neighbor) => {
        if (seen.has(neighbor)) return
        seen.add(neighbor)
        queue.push(neighbor)
      })
    }
    component.sort((a, b) => rank.get(a) - rank.get(b))
    const componentSet = new Set(component)
    const groupEdges = edges
      .filter((edge) => componentSet.has(edge.from) && componentSet.has(edge.to))
      .sort((a, b) => {
        const fromDifference = rank.get(a.from) - rank.get(b.from)
        return fromDifference || rank.get(a.to) - rank.get(b.to)
      })
    groups.push({
      id: `chain-group-${groups.length + 1}`,
      nodeIds: component,
      edges: groupEdges,
      hasCycle: hasDirectedCycle(component, groupEdges),
    })
  }

  return {
    groups,
    unlinkedIds: orderedIds.filter((id) => !connectedIds.has(id)),
  }
}
