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

export function computeExplainableRiskSignals(entity, allEntities = [], allEdges = [], allFIRs = []) {
  if (!entity) return { totalScore: 0, severity: 'low', signals: [], summary: 'No entity data' };

  const signals = [];
  let score = 0;

  // 1. Cross-Case FIR Analysis
  const eName = (entity.name || '').toLowerCase();
  const eLocal = (entity.local || '').toLowerCase();
  const matchedCases = allFIRs.filter(c => {
    const sName = (c.subjectName || c.subject_name || '').toLowerCase();
    const oAcc = (c.otherAccused || c.other_accused || '').toLowerCase();
    const phone = (c.phone || '').replace(/[^0-9]/g, '');
    const veh = (c.vehicle || '').toLowerCase();
    const bnk = (c.bank || '').toLowerCase();
    const ePhone = (entity.phone || entity.name || '').replace(/[^0-9]/g, '');

    return sName.includes(eName) || 
      oAcc.includes(eName) || 
      (eLocal && (sName.includes(eLocal) || oAcc.includes(eLocal))) ||
      (ePhone.length >= 10 && phone.includes(ePhone)) ||
      (veh && (eName.includes(veh) || veh.includes(eName))) ||
      (bnk && (eName.includes(bnk) || bnk.includes(eName)));
  });

  if (matchedCases.length >= 2) {
    score += 35;
    signals.push({
      category: 'Multi-Jurisdiction Crime',
      severity: 'high',
      points: '+35 pts',
      title: 'Multi-FIR Syndicate Operative',
      reason: `Directly named across ${matchedCases.length} separate registered police FIR dossiers across multiple police stations.`
    });
  } else if (matchedCases.length === 1) {
    score += 20;
    signals.push({
      category: 'Police Case Registration',
      severity: 'medium',
      points: '+20 pts',
      title: 'Active Case Subject',
      reason: `Formally cited as suspect/asset in case (${matchedCases[0].firNumber || matchedCases[0].fir_number}).`
    });
  }

  // 2. Hardware / Burner Telephony intersection
  if (entity.type === 'Phone' || entity.identifiers?.imei) {
    const imei = entity.identifiers?.imei;
    const isSharedImei = allEntities.some(other => other.id !== entity.id && other.identifiers?.imei && other.identifiers.imei === imei);
    if (isSharedImei) {
      score += 30;
      signals.push({
        category: 'Hardware Forensics',
        severity: 'high',
        points: '+30 pts',
        title: 'Shared IMEI Burner Swap',
        reason: `Physical device IMEI (${imei || 'Shared Handset'}) is reused across multiple suspect phone lines to bypass individual wiretap surveillance.`
      });
    } else {
      score += 15;
      signals.push({
        category: 'Telephony',
        severity: 'medium',
        points: '+15 pts',
        title: 'Burner Telephony Line',
        reason: 'Active cellular subscriber identity registered under syndicate communications network.'
      });
    }
  }

  // 3. Money Laundering & Financial Mule Routing
  if (entity.type === 'Bank' || (entity.role && entity.role.toLowerCase().includes('mule'))) {
    score += 30;
    signals.push({
      category: 'Financial Intelligence',
      severity: 'high',
      points: '+30 pts',
      title: 'Layering Mule Financial Route',
      reason: 'Identified money laundering terminal for rapid IMPS/P2P fund layering and cashout dispersal.'
    });
  }

  // 4. Vehicle Mobility & ANPR Hits
  if (entity.type === 'Vehicle') {
    const sightings = Number(entity.identifiers?.anprSightings) || entity.events || 0;
    if (sightings >= 15) {
      score += 25;
      signals.push({
        category: 'Mobility Intelligence',
        severity: 'high',
        points: '+25 pts',
        title: 'High-Frequency ANPR Corridor Sightings',
        reason: `Tracked in ${sightings} automated number plate recognition (ANPR) sightings across crime scene corridors.`
      });
    } else {
      score += 15;
      signals.push({
        category: 'Mobility Intelligence',
        severity: 'medium',
        points: '+15 pts',
        title: 'Syndicate Logistics Asset',
        reason: 'Identified getaway or executive conveyance vehicle linked to active syndicate operatives.'
      });
    }
  }

  // 5. Network Graph Topology / Degree & Betweenness
  const connectedEdges = allEdges.filter(([u, v]) => u === entity.id || v === entity.id);
  if (connectedEdges.length >= 4) {
    score += 20;
    signals.push({
      category: 'Network Topology',
      severity: 'high',
      points: '+20 pts',
      title: 'Central Hub Node',
      reason: `Directly interconnected with ${connectedEdges.length} separate criminal operatives, shell entities, and logistics assets.`
    });
  }

  // 6. Base risk clamp & severity
  const computedTotal = Math.min(100, Math.max(15, score + (entity.risk === 'high' ? 25 : entity.risk === 'medium' ? 10 : 0)));
  const finalSeverity = computedTotal >= 70 ? 'high' : computedTotal >= 40 ? 'medium' : 'low';

  return {
    totalScore: computedTotal,
    severity: finalSeverity,
    signals,
    summary: `${signals.length} algorithmic risk signals detected based on FIR registrations, hardware CDRs, and graph topology.`
  };
}

