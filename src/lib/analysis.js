export function graphMetrics(nodes, links) {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  links.forEach(([source, target]) => {
    degree.set(source, (degree.get(source) || 0) + 1);
    degree.set(target, (degree.get(target) || 0) + 1);
  });
  const maxDegree = Math.max(1, ...degree.values());
  return nodes.map((node) => ({
    ...node,
    degree: degree.get(node.id) || 0,
    influence: Math.round(((degree.get(node.id) || 0) / maxDegree) * 100),
  }));
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
