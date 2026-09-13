export function graphMetrics(nodes, links) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map(nodes.map(n => [n.id, new Set()]));

  links.forEach(([source, target]) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source).add(target);
      adj.get(target).add(source);
    }
  });

  // 1. Degree Centrality
  const degrees = new Map();
  nodes.forEach(n => degrees.set(n.id, adj.get(n.id)?.size || 0));
  const maxDegree = Math.max(1, ...degrees.values());

  // 2. Betweenness Centrality (Brandes algorithm for unweighted graphs)
  const betweenness = new Map(nodes.map(n => [n.id, 0]));
  nodes.forEach(s => {
    const stack = [];
    const pred = new Map(nodes.map(n => [n.id, []]));
    const sigma = new Map(nodes.map(n => [n.id, 0]));
    const dist = new Map(nodes.map(n => [n.id, -1]));

    sigma.set(s.id, 1);
    dist.set(s.id, 0);
    const queue = [s.id];

    while (queue.length > 0) {
      const v = queue.shift();
      stack.push(v);
      const vNeighbors = adj.get(v) || new Set();
      vNeighbors.forEach(w => {
        if (dist.get(w) < 0) {
          dist.set(w, dist.get(v) + 1);
          queue.push(w);
        }
        if (dist.get(w) === dist.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          pred.get(w).push(v);
        }
      });
    }

    const delta = new Map(nodes.map(n => [n.id, 0]));
    while (stack.length > 0) {
      const w = stack.pop();
      pred.get(w).forEach(v => {
        const coeff = (sigma.get(v) / (sigma.get(w) || 1)) * (1 + delta.get(w));
        delta.set(v, delta.get(v) + coeff);
      });
      if (w !== s.id) {
        betweenness.set(w, betweenness.get(w) + delta.get(w));
      }
    }
  });

  // Halve betweenness for undirected edges
  nodes.forEach(n => betweenness.set(n.id, betweenness.get(n.id) / 2));
  const maxBetweenness = Math.max(0.001, ...betweenness.values());

  // 3. Key Players / Neighbor connectivity (2-hop connection weight)
  const keyPlayers = new Map();
  nodes.forEach(n => {
    const neighbors = adj.get(n.id) || new Set();
    let neighborDegreeSum = 0;
    neighbors.forEach(nbrId => {
      neighborDegreeSum += degrees.get(nbrId) || 0;
    });
    keyPlayers.set(n.id, neighborDegreeSum);
  });
  const maxKeyPlayers = Math.max(1, ...keyPlayers.values());

  return nodes.map(node => {
    const deg = degrees.get(node.id) || 0;
    const directPct = Number(((deg / maxDegree) * 100).toFixed(1));
    const betweenPct = Number((((betweenness.get(node.id) || 0) / maxBetweenness) * 100).toFixed(1));
    const keyPlayersPct = Number((((keyPlayers.get(node.id) || 0) / maxKeyPlayers) * 100).toFixed(1));

    const overallPct = Number((directPct * 0.35 + betweenPct * 0.35 + keyPlayersPct * 0.30).toFixed(1));

    return {
      ...node,
      degree: deg,
      influence: overallPct,
      metrics: {
        directConnections: directPct,
        goBetween: betweenPct,
        linksToKeyPlayers: keyPlayersPct,
        overallInfluence: overallPct
      }
    };
  });
}

export function suspiciousPatterns(nodes, links) {
  const metrics = graphMetrics(nodes, links);
  return metrics.filter((node) => (
    (node.degree >= 4 && node.risk === 'low') ||
    (node.degree >= 8 && node.recent >= 75)
  )).map((node) => ({
    entityId: node.id,
    type: node.degree >= 8 ? 'high_connectivity' : 'risk_mismatch',
    severity: node.degree >= 8 ? 'high' : 'medium',
    explanation: node.degree >= 8 ? 'High connectivity and recent activity' : 'Connectivity is higher than recorded risk',
  }));
}
