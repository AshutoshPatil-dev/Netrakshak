import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, openEntityProfile, notifyStateChange } from '../state.js';
import { showToast } from '../components/Toast.js';

// Predefined intelligence clusters & dynamic community groups
// Predefined intelligence clusters matching the 31 entities in PostgreSQL
export const DEFAULT_COMMUNITIES = [
  {
    id: 0,
    name: 'Community #0',
    alias: 'ShadowFlow Cyber-Financial Syndicate',
    description: 'Primary VoIP boiler room, burner SIM handlers and ATM cash withdrawal network active across Shivajinagar & Deccan.',
    members: [
      { name: 'Sameer Khan', id: 'e0000001-0000-0000-0000-000000000001', risk: 'high', role: 'Syndicate Kingpin' },
      { name: 'Vikram Rathi', id: 'e0000001-0000-0000-0000-000000000002', risk: 'high', role: 'Technical Mule Manager' },
      { name: 'Ajay Deshmukh', id: 'e0000001-0000-0000-0000-000000000003', risk: 'medium', role: 'ATM Cash Mule' },
      { name: 'Deepak Verma', id: 'e0000001-0000-0000-0000-000000000010', risk: 'high', role: 'VoIP Team Lead' },
      { name: '+91 98811 55421', id: 'e0000002-0000-0000-0000-000000000001', risk: 'high', role: 'Primary Burner Phone' },
      { name: '+91 98199 44312', id: 'e0000002-0000-0000-0000-000000000002', risk: 'high', role: 'Technical SIM Line' },
      { name: '+91 97655 88910', id: 'e0000002-0000-0000-0000-000000000003', risk: 'medium', role: 'Courier Mobile' },
      { name: 'MH-12-PQ-9081', id: 'e0000003-0000-0000-0000-000000000001', risk: 'high', role: 'Getaway Swift' },
      { name: 'HDFC-50100492817291', id: 'e0000004-0000-0000-0000-000000000001', risk: 'high', role: 'Tier-1 Layering Account' },
      { name: 'ICICI-0021948102', id: 'e0000004-0000-0000-0000-000000000002', risk: 'high', role: 'Split Layering Account' },
      { name: 'Cell Tower PN-CY-482', id: 'e0000005-0000-0000-0000-000000000001', risk: 'high', role: 'FC Road Base Tower' },
      { name: 'Global Smart Solutions', id: 'e0000006-0000-0000-0000-000000000002', risk: 'high', role: 'VoIP Front' }
    ]
  },
  {
    id: 1,
    name: 'Community #1',
    alias: 'Swargate Hawala & Extortion Ring',
    description: 'Protection money collection, motorcycle threat delivery and pooled bank account laundering active in Swargate.',
    members: [
      { name: 'Suresh Shinde', id: 'e0000001-0000-0000-0000-000000000005', risk: 'high', role: 'Extortion Kingpin' },
      { name: 'Arjun Pawar', id: 'e0000001-0000-0000-0000-000000000004', risk: 'medium', role: 'Mule Recruiter' },
      { name: 'Pappu More', id: 'e0000001-0000-0000-0000-000000000007', risk: 'medium', role: 'Muscle Enforcer' },
      { name: '+91 94220 33190', id: 'e0000002-0000-0000-0000-000000000006', risk: 'high', role: 'Threat Caller SIM' },
      { name: '+91 99230 44102', id: 'e0000002-0000-0000-0000-000000000004', risk: 'medium', role: 'Recruiter SIM' },
      { name: 'MH-14-EA-7712', id: 'e0000003-0000-0000-0000-000000000002', risk: 'medium', role: 'Delivery Motorcycle' },
      { name: 'BOM-60129948102', id: 'e0000004-0000-0000-0000-000000000004', risk: 'medium', role: 'Extortion Pool A/C' },
      { name: 'Cell Tower PN-SWR-312', id: 'e0000005-0000-0000-0000-000000000003', risk: 'medium', role: 'Swargate Sector Tower' }
    ]
  },
  {
    id: 2,
    name: 'Community #2',
    alias: 'Kothrud Safehouse & ATM Dispersal Hub',
    description: 'Hardware burner custody and rapid ATM cash dispersion unit linked to FIR-MH-2026-1940.',
    members: [
      { name: 'Rohit Salunkhe', id: 'e0000001-0000-0000-0000-000000000006', risk: 'medium', role: 'Safehouse Custodian' },
      { name: 'Ajay Deshmukh', id: 'e0000001-0000-0000-0000-000000000003', risk: 'medium', role: 'ATM Cash Runner' },
      { name: 'AXIS-91201004812', id: 'e0000004-0000-0000-0000-000000000003', risk: 'high', role: 'ATM Cashout Account' },
      { name: 'Cell Tower PN-DEC-104', id: 'e0000005-0000-0000-0000-000000000002', risk: 'medium', role: 'Deccan ATM Tower' }
    ]
  },
  {
    id: 3,
    name: 'Community #3',
    alias: 'Apex & Nexus Corporate Shell Network',
    description: 'Corporate shell fronts and P2P crypto gateways facilitating multi-crore digital bond off-ramping.',
    members: [
      { name: 'Maya Shelar', id: 'e0000001-0000-0000-0000-000000000008', risk: 'high', role: 'Shell Director' },
      { name: 'Vikram Rathi', id: 'e0000001-0000-0000-0000-000000000002', risk: 'high', role: 'Technical Director' },
      { name: 'Karan Mehra', id: 'e0000001-0000-0000-0000-000000000009', risk: 'high', role: 'P2P Crypto Exchanger' },
      { name: '+91 98210 99812', id: 'e0000002-0000-0000-0000-000000000005', risk: 'high', role: 'Crypto Trading Line' },
      { name: 'MH-01-DK-3490', id: 'e0000003-0000-0000-0000-000000000003', risk: 'high', role: 'Corporate Fortuner' },
      { name: 'KOTAK-9810284711', id: 'e0000004-0000-0000-0000-000000000005', risk: 'high', role: 'Fintech Aggregator A/C' },
      { name: 'Apex Digital Asset LLP', id: 'e0000006-0000-0000-0000-000000000001', risk: 'high', role: 'Shell Company' },
      { name: 'Cell Tower MUM-BKC-901', id: 'e0000005-0000-0000-0000-000000000004', risk: 'high', role: 'BKC Corporate Tower' }
    ]
  }
];

export const DEFAULT_ANOMALIES = [
  {
    id: 'anom_01',
    severity: 'HIGH',
    type: 'Burner Hardware Swap (Shared IMEI)',
    icon: 'alert',
    description: '+91 98811 55421 (Sameer Khan) and +91 98199 44312 (Vikram Rathi) share the exact same physical IMEI 864291048821902 active across FC Road and Mumbai.',
    entities: [
      { label: '+91 98811 55421', id: 'e0000002-0000-0000-0000-000000000001' },
      { label: '+91 98199 44312', id: 'e0000002-0000-0000-0000-000000000002' },
      { label: 'Sameer Khan', id: 'e0000001-0000-0000-0000-000000000001' }
    ],
    timestamp: '1 hour ago',
    confidence: '99%'
  },
  {
    id: 'anom_02',
    severity: 'HIGH',
    type: 'Rapid Layering Velocity',
    icon: 'sparkle',
    description: 'INR 14,50,000 received into HDFC-50100492817291 was dispersed within 13 minutes across ICICI, AXIS, and KOTAK accounts.',
    entities: [
      { label: 'HDFC-50100492817291', id: 'e0000004-0000-0000-0000-000000000001' },
      { label: 'ICICI-0021948102', id: 'e0000004-0000-0000-0000-000000000002' },
      { label: 'AXIS-91201004812', id: 'e0000004-0000-0000-0000-000000000003' }
    ],
    timestamp: '3 hours ago',
    confidence: '98%'
  },
  {
    id: 'anom_03',
    severity: 'HIGH',
    type: 'Cross-Station Crime Sighting',
    icon: 'alert',
    description: 'Vehicle MH-12-PQ-9081 registered to Ajay Deshmukh linked to FC Road Cyber FIR-MH-2026-4821 was sighted at Deccan Gymkhana ATM cash-out hub.',
    entities: [
      { label: 'MH-12-PQ-9081', id: 'e0000003-0000-0000-0000-000000000001' },
      { label: 'Ajay Deshmukh', id: 'e0000001-0000-0000-0000-000000000003' }
    ],
    timestamp: '6 hours ago',
    confidence: '95%'
  },
  {
    id: 'anom_04',
    severity: 'MEDIUM',
    type: 'Pre-Incident Communication Burst',
    icon: 'pulse',
    description: '+91 94220 33190 (Suresh Shinde) contacted +91 99230 44102 (Arjun Pawar) 12 times in the 48 hours prior to FIR-MH-2026-2811 extortion dispatch.',
    entities: [
      { label: '+91 94220 33190', id: 'e0000002-0000-0000-0000-000000000006' },
      { label: '+91 99230 44102', id: 'e0000002-0000-0000-0000-000000000004' },
      { label: 'Suresh Shinde', id: 'e0000001-0000-0000-0000-000000000005' }
    ],
    timestamp: '10 hours ago',
    confidence: '92%'
  },
  {
    id: 'anom_05',
    severity: 'MEDIUM',
    type: 'Spatial-Temporal Co-Location',
    icon: 'pulse',
    description: 'Phone +91 98811 55421 and Vehicle MH-12-PQ-9081 pinged Cell Tower PN-CY-482 (FC Road) within 90 seconds during victim transfer window.',
    entities: [
      { label: '+91 98811 55421', id: 'e0000002-0000-0000-0000-000000000001' },
      { label: 'MH-12-PQ-9081', id: 'e0000003-0000-0000-0000-000000000001' },
      { label: 'Cell Tower PN-CY-482', id: 'e0000005-0000-0000-0000-000000000001' }
    ],
    timestamp: '1 day ago',
    confidence: '94%'
  },
  {
    id: 'anom_06',
    severity: 'MEDIUM',
    type: 'P2P Crypto Off-Ramp Routing',
    icon: 'sparkle',
    description: 'INR 3,80,000 transferred from KOTAK-9810284711 into Binance P2P Escrow via Karan Mehra (+91 98210 99812).',
    entities: [
      { label: 'KOTAK-9810284711', id: 'e0000004-0000-0000-0000-000000000005' },
      { label: 'Karan Mehra', id: 'e0000001-0000-0000-0000-000000000009' }
    ],
    timestamp: '2 days ago',
    confidence: '96%'
  }
];

function findEntityId(nameOrId) {
  if (!nameOrId) return null;
  const match = entities.find(e => 
    e.id === nameOrId || 
    e.name.toLowerCase() === nameOrId.toLowerCase() ||
    (e.local && e.local.toLowerCase().includes(nameOrId.toLowerCase())) ||
    e.name.toLowerCase().includes(nameOrId.toLowerCase()) ||
    (nameOrId.length > 3 && nameOrId.toLowerCase().includes(e.name.toLowerCase()))
  );
  return match ? match.id : null;
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

  // Top header matching Netrakshak style
  const header = el('div', { class: 'patterns-view-header' }, [
    el('div', { class: 'patterns-title-group' }, [
      el('h1', { class: 'patterns-main-title' }, ['Patterns & Anomalies']),
      el('p', { class: 'patterns-subtitle' }, [
        'Automated community clustering exposing segregated criminal groups and high-confidence behavioral anomalies.'
      ])
    ]),
    el('div', { class: 'patterns-header-actions' }, [
      el('button', {
        class: 'btn btn-outline',
        onclick: () => {
          showToast('Scanning network matrix: 4 distinct sub-groups verified.');
        }
      }, [
        el('span', {}, [icon('pulse')]),
        el('span', {}, ['Re-run Clustering'])
      ]),
      el('button', {
        class: 'btn btn-primary',
        onclick: () => {
          state.graphExploration.active = true;
          state.graphExploration.mode = 'all';
          state.view = 'network';
          notifyStateChange();
          showToast('Viewing Complete Master Network Graph');
        }
      }, [
        el('span', {}, [icon('network')]),
        el('span', {}, ['View Master Graph'])
      ])
    ])
  ]);

  // Two-column grid layout
  const grid = el('div', { class: 'patterns-two-column-grid' });

  // ===== LEFT COLUMN: Detected Sub-Groups =====
  const leftCol = el('div', { class: 'patterns-subgroups-panel' }, [
    el('div', { class: 'patterns-panel-title-wrap' }, [
      el('h2', { class: 'patterns-panel-title' }, ['Detected Sub-Groups']),
      el('span', { class: 'patterns-count-pill' }, [`${DEFAULT_COMMUNITIES.length} Clusters Found`])
    ])
  ]);

  const subgroupsList = el('div', { class: 'subgroups-cards-list' });

  DEFAULT_COMMUNITIES.forEach(comm => {
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

  leftCol.append(subgroupsList);

  // ===== RIGHT COLUMN: Anomalies =====
  const rightCol = el('div', { class: 'patterns-anomalies-panel' }, [
    el('div', { class: 'patterns-panel-title-wrap' }, [
      el('h2', { class: 'patterns-panel-title' }, ['Anomalies']),
      el('span', { class: 'patterns-count-pill alert-pulse' }, [`${DEFAULT_ANOMALIES.length} Flags Detected`])
    ])
  ]);

  const anomaliesList = el('div', { class: 'anomalies-cards-list' });

  DEFAULT_ANOMALIES.forEach(anom => {
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

  rightCol.append(anomaliesList);

  grid.append(leftCol, rightCol);
  container.append(header, grid);

  if (parent) {
    parent.append(container);
  }

  return container;
}
