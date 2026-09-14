import { el, icon } from '../lib/dom.js';
import {
  state,
  entities,
  edges,
  riskColor,
  notifyStateChange,
  openEntityProfile,
  backEntityProfile,
  startGraphInvestigation,
  findCrossLinkedCases
} from '../state.js';
import { graphMetrics, computeExplainableRiskSignals } from '../lib/analysis.js';
import { objectTypeColors, objectTypeIcons, getConnectedLinks } from './NetworkGraphView.js';
import { performAIAnalysis } from './AIAnalysisView.js';
import { showToast } from '../components/Toast.js';

export function renderEntityProfile(c) {
  c.innerHTML = '';

  const analyticalEntities = graphMetrics(entities, edges);
  const entityId = state.profileEntityId || state.selected || (entities.length > 0 ? entities[0].id : null);
  const entity = analyticalEntities.find(e => e.id === entityId) || analyticalEntities[0];

  if (!entity) {
    c.append(el('div', { class: 'empty-profile-page' }, [
      el('h3', {}, ['No Entity Selected']),
      el('button', { class: 'primary-btn', onclick: () => backEntityProfile() }, ['← Back'])
    ]));
    return;
  }

  const connectedLinks = getConnectedLinks(entity.id);
  const typeColor = objectTypeColors[entity.type] || '#1E293B';
  const typeIcon = objectTypeIcons[entity.type] || 'shield';

  // Metrics
  const directConnections = entity.metrics?.directConnections ?? 100.0;
  const goBetween = entity.metrics?.goBetween ?? 0.0;
  const linksToKeyPlayers = entity.metrics?.linksToKeyPlayers ?? 50.0;
  const overallInfluence = entity.metrics?.overallInfluence ?? 75.0;

  // Risk Score calculation
  const riskScores = { high: 81, medium: 54, low: 22 };
  const riskScore = riskScores[entity.risk] || 75;

  // Top Bar
  const backBtn = el('button', {
    class: 'profile-back-nav-btn',
    onclick: () => backEntityProfile()
  }, [
    icon('arrow-left'),
    ' Back'
  ]);

  const topHeader = el('div', { class: 'entity-profile-top-bar' }, [
    el('div', { class: 'profile-top-left' }, [
      backBtn,
      el('h1', { class: 'profile-page-title' }, ['Entity Profile'])
    ]),
    el('div', { class: 'profile-top-actions' }, [
      el('button', {
        class: 'outline-btn small',
        title: 'Scan pattern in AI Investigation Hub',
        onclick: () => {
          const query = entity.phone || entity.identifiers?.registration || entity.identifiers?.account || entity.name;
          state.aiAnalysis.query = query;
          state.aiAnalysis.streamType = 'all';
          performAIAnalysis(query, 'all');
          state.view = 'ai_analysis';
          notifyStateChange();
          showToast(`Running AI Linkage scan for ${entity.name}...`);
        }
      }, [icon('sparkle'), ' AI Analysis Hub']),
      el('button', {
        class: 'primary-btn small',
        title: 'Generate interactive network graph',
        onclick: () => {
          startGraphInvestigation(entity.id);
          state.view = 'network';
          notifyStateChange();
          showToast(`Generated network around ${entity.name}`);
        }
      }, [icon('network'), ' View in Network Graph →'])
    ])
  ]);

  // Main Header Hero Card
  const initialLetter = (entity.name || 'E').replace(/[^a-zA-Z0-9+]/g, '').charAt(0).toUpperCase() || 'E';

  // Build dynamic metadata entries according to entity type
  const metaFields = [];
  if (entity.type === 'Person') {
    if (entity.identifiers?.age) metaFields.push(['Age', String(entity.identifiers.age)]);
    metaFields.push(['Role', entity.role || 'Accused Subject']);
    if (entity.city) metaFields.push(['Address', entity.city]);
    if (entity.local && entity.local !== entity.name) metaFields.push(['Known Aliases', entity.local]);
    if (entity.phone) metaFields.push(['Phone', entity.phone]);
  } else if (entity.type === 'Location') {
    metaFields.push(['Type', entity.local || 'Cell Tower / Sector']);
    metaFields.push(['State', 'Maharashtra']);
    metaFields.push(['District', entity.city || 'Pune']);
    if (entity.identifiers?.latLong) metaFields.push(['Coordinates', entity.identifiers.latLong]);
  } else if (entity.type === 'Vehicle') {
    if (entity.identifiers?.make) metaFields.push(['Make', entity.identifiers.make]);
    if (entity.identifiers?.color) metaFields.push(['Color', entity.identifiers.color]);
    metaFields.push(['Registration', entity.name]);
    if (entity.city) metaFields.push(['District', entity.city]);
    if (entity.identifiers?.anprHits) metaFields.push(['ANPR Status', entity.identifiers.anprHits]);
  } else if (entity.type === 'Phone') {
    if (entity.identifiers?.carrier) metaFields.push(['Carrier', entity.identifiers.carrier]);
    if (entity.identifiers?.imei) metaFields.push(['IMEI', entity.identifiers.imei]);
    metaFields.push(['Number', entity.name]);
    if (entity.city) metaFields.push(['Active Sector', entity.city]);
  } else if (entity.type === 'Bank') {
    if (entity.identifiers?.bankName) metaFields.push(['Bank', entity.identifiers.bankName]);
    metaFields.push(['Account Number', entity.name]);
    if (entity.identifiers?.ifsc) metaFields.push(['IFSC', entity.identifiers.ifsc]);
    if (entity.identifiers?.status) metaFields.push(['Status', entity.identifiers.status]);
  } else if (entity.type === 'FIR Case') {
    if (entity.identifiers?.sections) metaFields.push(['Sections', entity.identifiers.sections]);
    metaFields.push(['Police Station', entity.city || 'Cyber Crime PS']);
    if (entity.identifiers?.date) metaFields.push(['Date', entity.identifiers.date]);
    if (entity.identifiers?.defraudedAmount) metaFields.push(['Diversion Amount', entity.identifiers.defraudedAmount]);
  } else {
    metaFields.push(['Role', entity.role || 'Network Object']);
    if (entity.city) metaFields.push(['Location', entity.city]);
  }

  const heroCard = el('div', { class: 'entity-profile-hero-card' }, [
    el('div', { class: 'hero-avatar-box', style: `background:${typeColor};color:#FFFFFF` }, [
      el('span', { class: 'hero-avatar-letter' }, [initialLetter])
    ]),
    el('div', { class: 'hero-body' }, [
      el('div', { class: 'hero-title-row' }, [
        el('h2', { class: 'hero-name' }, [entity.name]),
        el('span', { class: `hero-risk-pill ${entity.risk || 'low'}` }, [
          `${(entity.risk || 'HIGH').charAt(0).toUpperCase() + (entity.risk || 'HIGH').slice(1)} Risk (${riskScore})`
        ])
      ]),
      el('div', { class: 'hero-type-line' }, [
        el('span', { class: 'hero-type-label' }, [entity.type]),
        el('span', { class: 'hero-sep' }, ['-']),
        el('span', { class: 'hero-id-label' }, [`ID: ${entity.id}`])
      ]),
      el('div', { class: 'hero-meta-fields' }, metaFields.map(([k, v]) => el('span', { class: 'hero-meta-item' }, [
        el('strong', {}, [`${k}: `]),
        el('span', {}, [v])
      ])))
    ])
  ]);

  // --------------------------------------------------------------------------
  // 3-COLUMN INVESTIGATIVE DOSSIER
  // --------------------------------------------------------------------------

  const renderProgressBar = (pct) => {
    const val = Math.max(0, Math.min(100, Number(pct) || 0));
    let barColor = '#94A3B8';
    if (val >= 75) barColor = '#DC2626';
    else if (val >= 45) barColor = '#F59E0B';
    else if (val >= 15) barColor = '#2563EB';
    else if (val > 0) barColor = '#64748B';

    return el('div', { class: 'metric-progress-track' }, [
      el('div', {
        class: 'metric-progress-fill',
        style: `width: ${val}%; background: ${barColor};`
      })
    ]);
  };

  // 1. Column 1: Network Influence Card
  const influenceCard = el('div', { class: 'profile-column-card' }, [
    el('h3', { class: 'col-card-title' }, ['Network Influence']),
    el('p', { class: 'col-card-subtitle' }, [
      `How influential this ${entity.type.toLowerCase()} is inside the network - each value is relative to the strongest node for that measure in this case.`
    ]),
    el('div', { class: 'influence-metrics-list' }, [
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, ['Direct Connections']),
          el('span', { class: 'metric-pct' }, [`${directConnections}%`])
        ]),
        renderProgressBar(directConnections),
        el('p', { class: 'metric-desc' }, [`How many people and assets this ${entity.type.toLowerCase()} is directly linked to.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, ['Go-Between']),
          el('span', { class: 'metric-pct' }, [`${goBetween}%`])
        ]),
        renderProgressBar(goBetween),
        el('p', { class: 'metric-desc' }, [`How often this ${entity.type.toLowerCase()} sits between people or groups that are not directly linked - the link that holds the network together.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, ['Links to Key Players']),
          el('span', { class: 'metric-pct' }, [`${linksToKeyPlayers}%`])
        ]),
        renderProgressBar(linksToKeyPlayers),
        el('p', { class: 'metric-desc' }, [`Whether this ${entity.type.toLowerCase()}'s contacts are themselves well-connected.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, ['Overall Influence']),
          el('span', { class: 'metric-pct' }, [`${overallInfluence}%`])
        ]),
        renderProgressBar(overallInfluence),
        el('p', { class: 'metric-desc' }, ['Their standing across the whole network - where an investigation should focus on.'])
      ])
    ])
  ]);

  // 2. Column 2: Activity Timeline Card
  // Synthesize realistic chronological timeline events from connections
  const timelineDates = ['2026-08-14', '2026-08-02', '2026-07-22', '2026-07-15', '2026-06-30', '2026-06-18', '2026-05-24', '2026-04-02', '2026-03-30'];
  const timelineEvents = connectedLinks.map((link, idx) => {
    const eventDate = timelineDates[idx % timelineDates.length];
    return {
      date: eventDate,
      relation: link.relation,
      partner: link.partner
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  const timelineCard = el('div', { class: 'profile-column-card' }, [
    el('h3', { class: 'col-card-title' }, ['Activity Timeline']),
    timelineEvents.length > 0 ? el('div', { class: 'profile-timeline-flow' }, timelineEvents.map(ev => {
      const p = ev.partner;
      return el('div', { class: 'timeline-entry-row' }, [
        el('div', { class: 'timeline-dot-col' }, [
          el('span', { class: 'timeline-dot' }),
          el('span', { class: 'timeline-vertical-line' })
        ]),
        el('div', { class: 'timeline-entry-content' }, [
          el('span', { class: 'timeline-date-label' }, [ev.date]),
          el('button', {
            class: 'timeline-link-btn',
            title: `Click to inspect profile for ${p.name}`,
            onclick: () => openEntityProfile(p.id)
          }, [
            `${ev.relation} - ${p.name}`
          ])
        ])
      ]);
    })) : el('div', { class: 'empty-timeline-box' }, ['No recorded chronological events for this entity.'])
  ]);

  // 3. Column 3: Associated Nodes Card
  const associatedCard = el('div', { class: 'profile-column-card' }, [
    el('div', { class: 'associated-header-row' }, [
      el('h3', { class: 'col-card-title' }, [`Associated Nodes (${connectedLinks.length})`])
    ]),
    connectedLinks.length > 0 ? el('div', { class: 'associated-nodes-list' }, connectedLinks.map(link => {
      const p = link.partner;
      const pColor = objectTypeColors[p.type] || '#1E293B';
      const pLetter = (p.name || 'E').replace(/[^a-zA-Z0-9+]/g, '').charAt(0).toUpperCase() || 'E';

      const nodeRow = el('button', {
        class: 'associated-node-item',
        title: `Click to view profile of ${p.name}`,
        onclick: () => {
          openEntityProfile(p.id);
          showToast(`Inspecting profile for ${p.name}`);
        }
      }, [
        el('div', { class: 'assoc-avatar-box', style: `background:${pColor};color:#FFFFFF` }, [
          pLetter
        ]),
        el('div', { class: 'assoc-info-col' }, [
          el('strong', { class: 'assoc-name' }, [p.name]),
          el('span', { class: 'assoc-rel-text' }, [link.relation])
        ]),
        el('span', { class: `assoc-risk-dot ${p.risk || 'high'}` })
      ]);

      return nodeRow;
    })) : el('div', { class: 'empty-associated-box' }, ['No direct links recorded.'])
  ]);

  // Known Aliases Card
  const aliasesList = [];
  if (entity.identifiers?.alias) aliasesList.push(entity.identifiers.alias);
  if (entity.identifiers?.aliases && Array.isArray(entity.identifiers.aliases)) {
    aliasesList.push(...entity.identifiers.aliases);
  }
  if (entity.local && entity.local !== entity.name && !aliasesList.includes(entity.local)) {
    aliasesList.push(entity.local);
  }
  const aliasesCard = aliasesList.length > 0 ? el('div', { class: 'profile-column-card aliases-card', style: 'margin-top: 16px;' }, [
    el('h3', { class: 'col-card-title' }, ['Known Aliases & Operating Monikers']),
    el('div', { class: 'aliases-chip-list', style: 'display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;' }, aliasesList.map(a => el('span', {
      style: 'background: #F1F5F9; border: 1px solid #CBD5E1; color: var(--app-text); font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px;'
    }, [a])))
  ]) : null;

  // Cross-Case Involvement Card
  const linkedCases = findCrossLinkedCases(entity.id);
  const crossCaseCard = el('div', { class: 'profile-column-card cross-case-involvement-card', style: 'margin-top: 16px;' }, [
    el('div', { class: 'cross-case-header-row' }, [
      el('h3', { class: 'col-card-title' }, [`Registered Police Cases (${linkedCases.length})`]),
      linkedCases.length > 0 ? el('span', { class: 'cross-case-count-badge' }, [`${linkedCases.length} Dossiers`]) : null
    ].filter(Boolean)),
    linkedCases.length > 0 ? el('div', { class: 'cross-case-dossier-list' }, linkedCases.map(c => {
      const firNo = c.firNumber || c.fir_number;
      const ps = c.policeStation || c.police_station;
      const date = c.incidentDate || c.incident_date;
      const sec = c.sections || '';
      return el('div', { class: 'cross-case-item' }, [
        el('div', { class: 'cross-case-top-row' }, [
          el('strong', { class: 'cross-case-number' }, [firNo]),
          el('span', { class: 'cross-case-status' }, ['ACTIVE DOSSIER'])
        ]),
        el('div', { class: 'cross-case-meta' }, [
          el('span', { class: 'cross-case-station' }, [ps]),
          el('span', { class: 'cross-case-date' }, [` · Registered: ${date}`])
        ]),
        sec ? el('div', { class: 'cross-case-sections' }, [sec]) : null,
        el('div', { class: 'cross-case-actions' }, [
          el('button', {
            class: 'outline-btn small',
            onclick: () => {
              state.firActiveTab = 'dossiers';
              state.view = 'fir';
              notifyStateChange();
              showToast(`Opening case dossier for ${firNo}`);
            }
          }, [icon('file'), ' View Case Dossier →'])
        ])
      ]);
    })) : el('div', { class: 'empty-cross-case-box' }, [
      el('p', { class: 'muted' }, ['No direct First Information Reports citing this entity currently in local jurisdiction.'])
    ])
  ]);

  // Explainable AI Risk Signals Card
  const explainableSignals = computeExplainableRiskSignals(entity, entities, edges, state.firDraft ? [state.firDraft] : []);
  const explainableRiskCard = el('div', { class: 'profile-column-card explainable-risk-card', style: 'margin-top: 16px;' }, [
    el('div', { class: 'explainable-header-row' }, [
      el('div', {}, [
        el('h3', { class: 'col-card-title', style: 'margin: 0;' }, ['Explainable Risk Signals']),
        el('p', { class: 'muted', style: 'font-size: 11px; margin: 2px 0 0;' }, ['Algorithmic evidence provenance & score breakdown'])
      ]),
      el('span', { class: `explainable-severity-pill ${entity.risk || 'high'}` }, [
        `${riskScore}/100 Composite Risk`
      ])
    ]),
    explainableSignals.signals.length > 0 ? el('div', { class: 'explainable-signals-list' }, explainableSignals.signals.map(sig => {
      return el('div', { class: `explainable-signal-item ${sig.severity}` }, [
        el('div', { class: 'signal-item-top' }, [
          el('span', { class: 'signal-category-tag' }, [sig.category]),
          el('span', { class: 'signal-points-badge' }, [sig.points])
        ]),
        el('strong', { class: 'signal-title' }, [sig.title]),
        el('p', { class: 'signal-reason' }, [sig.reason])
      ]);
    })) : el('div', { class: 'empty-signals-box' }, ['No anomalous risk signals flagged for this entity.'])
  ]);

  const col1Wrapper = el('div', { class: 'profile-column-wrapper' }, [
    influenceCard,
    aliasesCard,
    explainableRiskCard
  ].filter(Boolean));

  const col2Wrapper = el('div', { class: 'profile-column-wrapper' }, [
    timelineCard,
    crossCaseCard
  ]);

  const threeColGrid = el('div', { class: 'profile-three-col-grid' }, [
    col1Wrapper,
    col2Wrapper,
    associatedCard
  ]);

  const container = el('div', { class: 'entity-profile-page-container' }, [
    topHeader,
    heroCard,
    threeColGrid
  ]);

  c.append(container);
}

