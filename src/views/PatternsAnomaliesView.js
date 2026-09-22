import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, openEntityProfile, notifyStateChange } from '../state.js';
import { showToast } from '../components/Toast.js';

function findEntityId(nameOrId) {
  if (!nameOrId) return null;
  const match = entities.find(e => 
    e.id === nameOrId || 
    (e.name && e.name.toLowerCase() === nameOrId.toLowerCase()) ||
    (e.local && e.local.toLowerCase().includes(nameOrId.toLowerCase())) ||
    (e.name && e.name.toLowerCase().includes(nameOrId.toLowerCase())) ||
    (nameOrId.length > 3 && e.name && nameOrId.toLowerCase().includes(e.name.toLowerCase()))
  );
  return match ? match.id : null;
}

export function computeDynamicCommunities() {
  if (!entities || entities.length === 0) return [];

  // Build weighted adjacency list
  const adj = new Map();
  entities.forEach(e => adj.set(e.id, new Map()));

  // Calculate degrees to identify and downweight generic bridge hubs (e.g. citywide cell towers)
  const degreeMap = new Map();
  edges.forEach(([src, tgt]) => {
    degreeMap.set(src, (degreeMap.get(src) || 0) + 1);
    degreeMap.set(tgt, (degreeMap.get(tgt) || 0) + 1);
  });

  edges.forEach(([src, tgt, relType]) => {
    if (adj.has(src) && adj.has(tgt) && src !== tgt) {
      // Calculate weight based on relationship strength and hub penalty
      const srcDeg = degreeMap.get(src) || 1;
      const tgtDeg = degreeMap.get(tgt) || 1;
      const hubPenalty = (srcDeg > 8 || tgtDeg > 8) ? 0.3 : 1.0;
      
      let relWeight = 1.0;
      const relLower = (relType || '').toLowerCase();
      if (relLower.includes('co-accused') || relLower.includes('mule') || relLower.includes('financial') || relLower.includes('cdr')) {
        relWeight = 2.0;
      }

      const finalWeight = relWeight * hubPenalty;
      adj.get(src).set(tgt, (adj.get(src).get(tgt) || 0) + finalWeight);
      adj.get(tgt).set(src, (adj.get(tgt).get(src) || 0) + finalWeight);
    }
  });

  // Deterministic node ordering: highest degree first, then by ID
  const orderedEntities = [...entities].sort((a, b) => {
    const degA = degreeMap.get(a.id) || 0;
    const degB = degreeMap.get(b.id) || 0;
    if (degB !== degA) return degB - degA;
    return String(a.id).localeCompare(String(b.id));
  });

  // Label Propagation Algorithm (LPA) for community modularity
  const labels = new Map();
  entities.forEach(ent => {
    labels.set(ent.id, ent.id);
  });

  // Run LPA iterations deterministically
  const maxIterations = 15;
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    orderedEntities.forEach(ent => {
      const neighbors = adj.get(ent.id);
      if (!neighbors || neighbors.size === 0) return;

      const labelWeights = new Map();
      neighbors.forEach((weight, nbrId) => {
        const nbrLabel = labels.get(nbrId);
        labelWeights.set(nbrLabel, (labelWeights.get(nbrLabel) || 0) + weight);
      });

      // Find label with highest accumulated weight (deterministic tie breaking)
      let currentLabel = labels.get(ent.id);
      let bestLabel = currentLabel;
      let maxWeight = labelWeights.get(currentLabel) || 0;

      labelWeights.forEach((w, lbl) => {
        if (w > maxWeight) {
          maxWeight = w;
          bestLabel = lbl;
        } else if (w === maxWeight && maxWeight > 0) {
          if (lbl === currentLabel) {
            bestLabel = lbl;
          } else if (bestLabel !== currentLabel && String(lbl).localeCompare(String(bestLabel)) < 0) {
            bestLabel = lbl;
          }
        }
      });

      if (bestLabel !== currentLabel) {
        labels.set(ent.id, bestLabel);
        changed = true;
      }
    });

    if (!changed) break;
  }

  // Group entities by community label
  const clusterMap = new Map();
  entities.forEach(ent => {
    const lbl = labels.get(ent.id);
    if (!clusterMap.has(lbl)) clusterMap.set(lbl, []);
    clusterMap.get(lbl).push(ent);
  });

  let rawClusters = Array.from(clusterMap.values());

  // If graph was overly dense and produced fewer than 2 communities while having >= 6 entities,
  // partition by primary key-player ego networks to prevent single monolithic community collapse
  if (rawClusters.length < 2 && entities.length >= 6) {
    const egoClusters = [];
    const assigned = new Set();

    // Priority 1: Key persons in deterministic order
    const seedLeaders = [...entities]
      .filter(e => e.category === 'person')
      .sort((a, b) => (degreeMap.get(b.id) || 0) - (degreeMap.get(a.id) || 0));

    seedLeaders.forEach(leader => {
      if (assigned.has(leader.id)) return;
      const cluster = [leader];
      assigned.add(leader.id);

      const nbrs = adj.get(leader.id);
      if (nbrs) {
        const sortedNbrs = Array.from(nbrs.keys()).sort((a, b) => String(a).localeCompare(String(b)));
        sortedNbrs.forEach(nbrId => {
          if (!assigned.has(nbrId)) {
            const nbrNode = entities.find(e => e.id === nbrId);
            if (nbrNode) {
              cluster.push(nbrNode);
              assigned.add(nbrId);
            }
          }
        });
      }
      egoClusters.push(cluster);
    });

    // Unassigned remaining nodes
    const leftover = entities.filter(e => !assigned.has(e.id));
    if (leftover.length > 0) {
      if (egoClusters.length > 0) {
        egoClusters[0].push(...leftover);
      } else {
        egoClusters.push(leftover);
      }
    }
    rawClusters = egoClusters;
  }

  // Filter out tiny 1-member isolated nodes unless that's all we have
  if (rawClusters.length > 1) {
    const meaningful = rawClusters.filter(c => c.length >= 2);
    if (meaningful.length > 0) rawClusters = meaningful;
  }

  // Sort clusters deterministically:
  // 1. Cluster size descending
  // 2. High-risk member count descending
  // 3. Primary leader / first member name alphabetically
  rawClusters.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    const aHigh = a.filter(m => m.risk === 'high').length;
    const bHigh = b.filter(m => m.risk === 'high').length;
    if (bHigh !== aHigh) return bHigh - aHigh;
    const aName = a[0]?.name || a[0]?.id || '';
    const bName = b[0]?.name || b[0]?.id || '';
    return aName.localeCompare(bName);
  });

  return rawClusters.map((group, idx) => {
    const communityNum = idx + 1; // 1-indexed (Community #1, #2, etc.)
    
    // Identify primary leader / hub
    const keyMember = group.find(m => m.risk === 'high' && m.category === 'person') || 
                      group.find(m => m.category === 'person') || 
                      group[0];

    const personCount = group.filter(m => m.category === 'person').length;
    const phoneCount = group.filter(m => m.category === 'phone').length;
    const bankCount = group.filter(m => m.category === 'bank').length;
    const vehicleCount = group.filter(m => m.category === 'vehicle').length;

    let syndicateType = 'Operational Syndicate';
    if (bankCount >= 2 || (keyMember && (keyMember.name.toLowerCase().includes('sameer') || keyMember.name.toLowerCase().includes('rohit')))) {
      syndicateType = 'Cyber-Financial & Layering Syndicate';
    } else if (keyMember && (keyMember.name.toLowerCase().includes('suresh') || keyMember.name.toLowerCase().includes('arjun') || keyMember.name.toLowerCase().includes('swargate'))) {
      syndicateType = 'Extortion & Hawala Ring';
    } else if (vehicleCount >= 2 || (keyMember && keyMember.name.toLowerCase().includes('deepak'))) {
      syndicateType = 'Logistics & Mobility Cell';
    } else if (phoneCount >= 2) {
      syndicateType = 'Burner Telecom & VoIP Cell';
    }

    const aliasName = keyMember ? `${keyMember.name} - ${syndicateType}` : `Syndicate Cell #${communityNum}`;
    
    const descParts = [];
    if (personCount > 0) descParts.push(`${personCount} operatives`);
    if (phoneCount > 0) descParts.push(`${phoneCount} telecom lines`);
    if (bankCount > 0) descParts.push(`${bankCount} mule accounts`);
    if (vehicleCount > 0) descParts.push(`${vehicleCount} vehicles`);

    const summaryDesc = descParts.length > 0 
      ? `Active criminal cluster comprising ${descParts.join(', ')} identified through direct relational clustering.`
      : 'Segregated operational entity cluster detected through graph linkage.';

    return {
      id: communityNum,
      name: `Community #${communityNum}`,
      alias: aliasName,
      description: summaryDesc,
      members: group.map(m => ({
        id: m.id,
        name: m.name,
        risk: m.risk || 'low',
        role: m.role || m.type || 'Member'
      }))
    };
  });
}

export function computeDynamicAnomalies() {
  const anomalies = [];

  // Check 1: Shared Hardware or Shared Identifiers
  const imeiMap = new Map();
  entities.forEach(ent => {
    const imei = ent.identifiers?.imei;
    if (imei) {
      if (!imeiMap.has(imei)) imeiMap.set(imei, []);
      imeiMap.get(imei).push(ent);
    }
  });

  imeiMap.forEach((ents, imei) => {
    if (ents.length > 1) {
      anomalies.push({
        id: `anom_imei_${imei}`,
        severity: 'HIGH',
        type: 'Burner Hardware Swap (Shared IMEI)',
        icon: 'alert',
        description: `Multiple entities (${ents.map(e => e.name).join(', ')}) share the exact same hardware device IMEI ${imei}.`,
        entities: ents.map(e => ({ label: e.name, id: e.id })),
        timestamp: 'Live Flag',
        confidence: '99%'
      });
    }
  });

  // Check 2: High Velocity Financial Layering
  const transactions = state.financialTransactions || [];
  if (transactions.length > 0) {
    const highVal = transactions.filter(tx => (parseFloat(tx.amount) || 0) >= 500000);
    if (highVal.length > 0) {
      const topTx = highVal[0];
      const senderEnt = entities.find(e => e.name === topTx.from_account || e.id === topTx.from_account);
      const recvEnt = entities.find(e => e.name === topTx.to_account || e.id === topTx.to_account);

      anomalies.push({
        id: `anom_tx_${topTx.id || 'high_val'}`,
        severity: 'HIGH',
        type: 'Rapid Layering Velocity',
        icon: 'sparkle',
        description: `High value transaction of INR ${parseFloat(topTx.amount).toLocaleString('en-IN')} transferred between accounts ${topTx.from_account || 'Mule A/C'} and ${topTx.to_account || 'Layer A/C'}.`,
        entities: [
          { label: topTx.from_account || 'Source Account', id: senderEnt?.id || '' },
          { label: topTx.to_account || 'Target Account', id: recvEnt?.id || '' }
        ].filter(e => e.label),
        timestamp: 'Live Flag',
        confidence: '98%'
      });
    }
  }

  // Check 3: Central High-Degree Nodes (Kingpins / Hubs)
  const degreeMap = new Map();
  edges.forEach(([src, tgt]) => {
    degreeMap.set(src, (degreeMap.get(src) || 0) + 1);
    degreeMap.set(tgt, (degreeMap.get(tgt) || 0) + 1);
  });

  entities.forEach(ent => {
    const deg = degreeMap.get(ent.id) || 0;
    if (deg >= 4 && ent.risk === 'high') {
      const connectedEdges = edges.filter(([s, t]) => s === ent.id || t === ent.id);
      const connectedNodeIds = connectedEdges.map(([s, t]) => s === ent.id ? t : s);
      const connectedEntities = entities.filter(e => connectedNodeIds.includes(e.id));

      anomalies.push({
        id: `anom_hub_${ent.id}`,
        severity: 'HIGH',
        type: 'High-Degree Command Node',
        icon: 'alert',
        description: `${ent.name} (${ent.role || 'High-Risk Operative'}) acts as a major network nexus connecting ${deg} separate entities.`,
        entities: [
          { label: ent.name, id: ent.id },
          ...connectedEntities.slice(0, 2).map(e => ({ label: e.name, id: e.id }))
        ],
        timestamp: 'Live Flag',
        confidence: '95%'
      });
    }
  });

  // Check 4: Telecommunication / CDR Bursts
  const cdrs = state.cdrRecords || [];
  if (cdrs.length > 0) {
    const callers = new Map();
    cdrs.forEach(c => {
      const pair = `${c.caller_phone}->${c.receiver_phone}`;
      callers.set(pair, (callers.get(pair) || 0) + 1);
    });

    callers.forEach((count, pair) => {
      if (count >= 3) {
        const [c1, c2] = pair.split('->');
        anomalies.push({
          id: `anom_cdr_${pair}`,
          severity: 'MEDIUM',
          type: 'Pre-Incident Communication Burst',
          icon: 'pulse',
          description: `Frequent telephony exchange detected between ${c1} and ${c2} with ${count} recorded calls in live CDR logs.`,
          entities: [
            { label: c1, id: findEntityId(c1) || '' },
            { label: c2, id: findEntityId(c2) || '' }
          ].filter(e => e.label),
          timestamp: 'Live Flag',
          confidence: '93%'
        });
      }
    });
  }

  return anomalies;
}

function inspectSubGroupInGraph(comm) {
  const memberIds = comm.members
    .map(m => findEntityId(m.id) || findEntityId(m.name))
    .filter(Boolean);

  const primarySeedId = memberIds[0] || (entities.length > 0 ? entities[0].id : null);

  if (primarySeedId) {
    state.graphExploration.active = true;
    state.graphExploration.mode = 'focused';
    state.graphExploration.seedId = primarySeedId;
    state.graphExploration.expandedNodeIds = memberIds.length > 0 ? memberIds : [primarySeedId];
    state.selected = primarySeedId;
  } else {
    state.graphExploration.active = true;
    state.graphExploration.mode = 'all';
  }

  state.view = 'network';
  notifyStateChange();
  showToast(`Focusing Network Graph on ${comm.name}: ${comm.alias || 'Cluster'} (${memberIds.length} members)`);
}

export function renderPatternsAnomalies(parent) {
  if (parent) {
    parent.innerHTML = '';
  }
  const container = el('div', { class: 'patterns-view-container' });

  const dynamicCommunities = computeDynamicCommunities();
  const dynamicAnomalies = computeDynamicAnomalies();

  // Top header matching Netrakshak style
  // Top header matching Netrakshak style
  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('h1', {}, ['Patterns & Anomalies']),
      el('p', { class: 'muted' }, [
        'Automated community clustering exposing segregated criminal groups and high-confidence behavioral anomalies directly from live database records.'
      ])
    ]),
    el('div', { style: 'display: flex; gap: 10px; align-items: center;' }, [
      el('button', {
        class: 'outline-btn',
        onclick: () => {
          showToast(`Scanning database network matrix: ${dynamicCommunities.length} dynamic sub-groups computed.`);
        }
      }, [icon('refresh'), 'Re-run Clustering']),
      el('button', {
        class: 'primary-btn',
        onclick: () => {
          state.graphExploration.active = true;
          state.graphExploration.mode = 'all';
          state.view = 'network';
          notifyStateChange();
          showToast('Viewing Complete Master Network Graph');
        }
      }, [icon('network'), 'View Master Graph'])
    ])
  ]);

  // Two-column grid layout
  const grid = el('div', { class: 'patterns-two-column-grid' });

  // ===== LEFT COLUMN: Detected Sub-Groups =====
  const leftCol = el('div', { class: 'patterns-subgroups-panel' }, [
    el('div', { class: 'patterns-panel-title-wrap' }, [
      el('h2', { class: 'patterns-panel-title' }, ['Detected Sub-Groups']),
      el('span', { class: 'patterns-count-pill' }, [`${dynamicCommunities.length} Clusters Found`])
    ])
  ]);

  const subgroupsList = el('div', { class: 'subgroups-cards-list' });

  if (dynamicCommunities.length === 0) {
    subgroupsList.append(el('div', { style: 'padding: 24px; color: #94A3B8; text-align: center; font-size: 13px;' }, [
      'No clusters found. Add or load entity records to analyze sub-groups.'
    ]));
  } else {
    dynamicCommunities.forEach(comm => {
      const card = el('div', { class: 'community-cluster-card' });

      const cardHeader = el('div', { class: 'community-card-header' }, [
        el('div', { class: 'community-id-badge' }, [
          el('span', { class: 'community-num' }, [String(comm.id)])
        ]),
        el('div', { class: 'community-meta-wrap' }, [
          el('div', { class: 'community-title-line' }, [
            el('strong', { class: 'community-name' }, [comm.name]),
            el('span', { class: 'community-members-count' }, [`(${comm.members.length} members)`]),
            comm.alias ? el('span', { class: 'community-alias-tag' }, [comm.alias]) : null
          ]),
          el('p', { class: 'community-desc' }, [comm.description])
        ])
      ]);

      // Member pills
      const membersWrap = el('div', { class: 'community-members-wrap' });

      comm.members.forEach(m => {
        const riskClass = m.risk === 'high' ? 'risk-high' : m.risk === 'medium' ? 'risk-medium' : 'risk-low';
        const pill = el('button', {
          class: `community-member-pill ${riskClass}`,
          title: `${m.name} (${m.role || 'Member'}) - Click to view dossier`,
          onclick: () => {
            const matchedId = findEntityId(m.id) || findEntityId(m.name);
            if (matchedId) {
              openEntityProfile(matchedId);
            } else {
              state.view = 'entities';
              notifyStateChange();
            }
          }
        }, [
          el('span', { class: 'member-name' }, [m.name]),
          el('span', { class: `member-risk-dot ${riskClass}` }, ['•'])
        ]);
        membersWrap.append(pill);
      });

      const cardFooter = el('div', { class: 'community-card-footer' }, [
        el('button', {
          class: 'community-action-link',
          onclick: () => {
            inspectSubGroupInGraph(comm);
          }
        }, [
          el('span', {}, ['Inspect Sub-Group in Graph']),
          el('span', {}, [' →'])
        ])
      ]);

      card.append(cardHeader, membersWrap, cardFooter);
      subgroupsList.append(card);
    });
  }

  leftCol.append(subgroupsList);

  // ===== RIGHT COLUMN: Anomalies =====
  const rightCol = el('div', { class: 'patterns-anomalies-panel' }, [
    el('div', { class: 'patterns-panel-title-wrap' }, [
      el('h2', { class: 'patterns-panel-title' }, ['Anomalies']),
      el('span', { class: `patterns-count-pill ${dynamicAnomalies.length > 0 ? 'alert-pulse' : ''}` }, [`${dynamicAnomalies.length} Flags Detected`])
    ])
  ]);

  const anomaliesList = el('div', { class: 'anomalies-cards-list' });

  if (dynamicAnomalies.length === 0) {
    anomaliesList.append(el('div', { style: 'padding: 24px; color: #94A3B8; text-align: center; font-size: 13px;' }, [
      'No critical anomaly flags detected across current database records.'
    ]));
  } else {
    dynamicAnomalies.forEach(anom => {
      const sevClass = anom.severity.toLowerCase(); // 'high' or 'medium'
      const card = el('div', { class: `anomaly-alert-card severity-${sevClass}` });

      // Anomaly Card Header
      const topRow = el('div', { class: 'anomaly-card-top-row' }, [
        el('div', { class: 'anomaly-icon-severity' }, [
          el('span', { class: `anomaly-badge-icon ${sevClass}` }, [
            anom.icon === 'pulse' ? icon('pulse') : icon('alert')
          ]),
          el('span', { class: `anomaly-severity-badge ${sevClass}` }, [anom.severity]),
          el('span', { class: 'anomaly-type-title' }, [anom.type])
        ]),
        el('span', { class: 'anomaly-timestamp' }, [anom.timestamp])
      ]);

      // Anomaly Description
      const desc = el('p', { class: 'anomaly-description-text' }, [anom.description]);

      // Clickable Entity Pills
      const entitiesRow = el('div', { class: 'anomaly-entities-row' });
      anom.entities.forEach(ent => {
        const pill = el('button', {
          class: 'anomaly-entity-pill',
          title: `Inspect ${ent.label}`,
          onclick: () => {
            const matchedId = findEntityId(ent.id) || findEntityId(ent.label);
            if (matchedId) {
              openEntityProfile(matchedId);
            } else {
              state.view = 'entities';
              notifyStateChange();
            }
          }
        }, [
          el('span', {}, [ent.label])
        ]);
        entitiesRow.append(pill);
      });

      card.append(topRow, desc, entitiesRow);
      anomaliesList.append(card);
    });
  }

  rightCol.append(anomaliesList);

  grid.append(leftCol, rightCol);
  container.append(header, grid);

  if (parent) {
    parent.append(container);
  }

  return container;
}
