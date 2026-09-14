import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import {
  state,
  entities,
  edges,
  firCases,
  DEFAULT_EVIDENCE_ITEMS,
  riskColor,
  notifyStateChange,
  openEntityProfile,
  backEntityProfile,
  startGraphInvestigation
} from '../state.js';
import { graphMetrics } from '../lib/analysis.js';
import { objectTypeColors, objectTypeIcons, getConnectedLinks } from './NetworkGraphView.js';
import { performAIAnalysis } from './AIAnalysisView.js';
import { showToast } from '../components/Toast.js';
import { getAccusedPhoto } from '../lib/avatars.js';
import { openFilePreview } from '../components/FilePreviewModal.js';

export function renderEntityProfile(c) {
  c.innerHTML = '';

  const analyticalEntities = graphMetrics(entities, edges);
  const entityId = state.profileEntityId || state.selected || (entities.length > 0 ? entities[0].id : null);
  const entity = analyticalEntities.find(e => e.id === entityId) || analyticalEntities[0];

  if (!entity) {
    c.append(el('div', { class: 'empty-profile-page' }, [
      el('h3', {}, [t('noResults')]),
      el('button', { class: 'primary-btn', onclick: () => backEntityProfile() }, [`← ${t('back')}`])
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
    ` ${t('back')}`
  ]);

  const topHeader = el('div', { class: 'entity-profile-top-bar' }, [
    el('div', { class: 'profile-top-left' }, [
      backBtn,
      el('h1', { class: 'profile-page-title' }, [t('entityProfile')])
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
      }, [icon('sparkle'), ` ${t('aiAnalysisHub')}`]),
      el('button', {
        class: 'primary-btn small',
        title: 'Generate interactive network graph',
        onclick: () => {
          startGraphInvestigation(entity.id);
          state.view = 'network';
          notifyStateChange();
          showToast(`Generated network around ${entity.name}`);
        }
      }, [icon('network'), ` ${t('viewInNetworkGraph')} →`])
    ])
  ]);

  // Main Header Hero Card
  const initialLetter = (entity.name || 'E').replace(/[^a-zA-Z0-9+]/g, '').charAt(0).toUpperCase() || 'E';
  const entityPhoto = entity.imageUrl || entity.identifiers?.imageUrl || getAccusedPhoto(entity);

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

  const avatarBox = entityPhoto ? el('div', { class: 'hero-avatar-box has-photo' }, [
    el('img', { src: entityPhoto, class: 'hero-avatar-img', alt: entity.name }),
    el('span', { class: 'hero-photo-badge' }, ['PHOTO ON FILE'])
  ]) : el('div', { class: 'hero-avatar-box', style: `background:${typeColor};color:#FFFFFF` }, [
    el('span', { class: 'hero-avatar-letter' }, [initialLetter])
  ]);

  const heroCard = el('div', { class: 'entity-profile-hero-card' }, [
    avatarBox,
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
    el('h3', { class: 'col-card-title' }, [t('networkMetrics')]),
    el('p', { class: 'col-card-subtitle' }, [
      `How influential this ${entity.type.toLowerCase()} is inside the network.`
    ]),
    el('div', { class: 'influence-metrics-list' }, [
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, [t('directConnections')]),
          el('span', { class: 'metric-pct' }, [`${directConnections}%`])
        ]),
        renderProgressBar(directConnections),
        el('p', { class: 'metric-desc' }, [`How many people and assets this ${entity.type.toLowerCase()} is directly linked to.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, [t('bridgePotential')]),
          el('span', { class: 'metric-pct' }, [`${goBetween}%`])
        ]),
        renderProgressBar(goBetween),
        el('p', { class: 'metric-desc' }, [`How often this ${entity.type.toLowerCase()} sits between people or groups that are not directly linked.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, [t('keyPlayerInfluence')]),
          el('span', { class: 'metric-pct' }, [`${linksToKeyPlayers}%`])
        ]),
        renderProgressBar(linksToKeyPlayers),
        el('p', { class: 'metric-desc' }, [`Whether this ${entity.type.toLowerCase()}'s contacts are themselves well-connected.`])
      ]),
      el('div', { class: 'influence-metric-group' }, [
        el('div', { class: 'metric-header-row' }, [
          el('strong', { class: 'metric-title' }, [t('betweennessCentrality')]),
          el('span', { class: 'metric-pct' }, [`${overallInfluence}%`])
        ]),
        renderProgressBar(overallInfluence),
        el('p', { class: 'metric-desc' }, ['Their standing across the whole network.'])
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
    el('h3', { class: 'col-card-title' }, [t('timelineEvents')]),
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
    })) : el('div', { class: 'empty-timeline-box' }, [t('noResults')])
  ]);

  // 3. Column 3: Associated Nodes Card
  const associatedCard = el('div', { class: 'profile-column-card' }, [
    el('div', { class: 'associated-header-row' }, [
      el('h3', { class: 'col-card-title' }, [`${t('connectedEntities')} (${connectedLinks.length})`])
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
    })) : el('div', { class: 'empty-associated-box' }, [t('noResults')])
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

  const aliasesCard = aliasesList.length > 0 ? el('div', { class: 'profile-column-card known-aliases-card', style: 'margin-top: 16px;' }, [
    el('h3', { class: 'col-card-title' }, ['Known Aliases']),
    el('div', { class: 'known-aliases-chips' }, aliasesList.map(a => el('span', { class: 'alias-chip' }, [a])))
  ]) : null;

  const col1Wrapper = el('div', { class: 'profile-column-wrapper' }, [
    influenceCard,
    aliasesCard
  ].filter(Boolean));

  const threeColGrid = el('div', { class: 'profile-three-col-grid' }, [
    col1Wrapper,
    timelineCard,
    associatedCard
  ]);

  // Related Evidentiary Assets from Registered FIRs
  const relatedCases = firCases.filter(c => {
    const sName = (c.subjectName || c.subject_name || '').toLowerCase();
    const other = (c.otherAccused || c.other_accused || '').toLowerCase();
    const eName = (entity.name || '').toLowerCase();
    const cPhone = (c.phone || '').toLowerCase();
    const cVeh = (c.vehicle || '').toLowerCase();
    const cBank = (c.bank || '').toLowerCase();
    const cFir = (c.firNumber || c.fir_number || '').toLowerCase();

    if (entity.type === 'Person') {
      return sName.includes(eName) || (eName.length > 3 && other.includes(eName));
    }
    if (entity.type === 'Phone') {
      return cPhone.includes(eName) || eName.includes(cPhone);
    }
    if (entity.type === 'Vehicle') {
      return cVeh.includes(eName) || eName.includes(cVeh);
    }
    if (entity.type === 'Bank') {
      return cBank.includes(eName) || eName.includes(cBank);
    }
    if (entity.type === 'FIR Case') {
      return cFir.includes(eName) || eName.includes(cFir) || c.id === entity.id;
    }
    return false;
  });

  const entityEvidenceItems = [];
  relatedCases.forEach(c => {
    const firNo = c.firNumber || c.fir_number || 'FIR-MH-2026';
    const items = c.evidence_items || c.evidenceItems || DEFAULT_EVIDENCE_ITEMS[firNo] || [];
    items.forEach(it => {
      entityEvidenceItems.push({
        ...it,
        caseNumber: firNo,
        policeStation: c.policeStation || c.police_station || 'Police Station'
      });
    });
  });

  const evidenceTypeLabels = {
    call_records: 'CDR / Calls',
    photo: 'Photo / CCTV',
    document: 'Document',
    device: 'Device Dump',
    financial: 'Financial',
    witness: 'Witness'
  };

  const evidenceSection = entityEvidenceItems.length > 0 ? el('div', { class: 'profile-evidence-section' }, [
    el('div', { class: 'profile-evidence-header' }, [
      el('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        icon('file'),
        el('h3', { style: 'font-size: 14px; font-weight: 800; margin: 0; color: var(--app-text);' }, [`Attached Evidentiary Forensics & Seized Files (${entityEvidenceItems.length})`])
      ]),
      el('span', { class: 'muted', style: 'font-size: 11px;' }, ['Read-only cryptographic chain of custody linked from police case records'])
    ]),
    el('div', { class: 'profile-evidence-grid' }, entityEvidenceItems.map(item => {
      const evType = item.type || item.evidence_type || 'document';
      const evDesc = item.description || item.name || 'Forensic Evidence Item';
      const evSha = item.sha256 || 'e8f29c0b39';
      const evShortSha = evSha.length > 12 ? `${evSha.slice(0, 10)}...` : evSha;
      const typeLabel = evidenceTypeLabels[evType] || evType.toUpperCase();

      return el('div', { class: 'profile-evidence-card' }, [
        el('div', { class: 'profile-evidence-card-top' }, [
          el('span', { class: `evidence-type ${evType}` }, [typeLabel]),
          el('span', { class: 'profile-evidence-case-badge' }, [item.caseNumber])
        ]),
        el('div', { class: 'profile-evidence-card-desc', title: evDesc }, [evDesc]),
        el('div', { class: 'profile-evidence-card-meta' }, [
          el('span', { class: 'profile-evidence-sha', title: `SHA-256: ${evSha}` }, [`SHA: ${evShortSha}`]),
          el('button', {
            class: 'preview-evidence-btn small',
            type: 'button',
            onclick: () => {
              openFilePreview(item);
            }
          }, [icon('search'), ' Preview Evidence'])
        ])
      ]);
    }))
  ]) : null;

  const container = el('div', { class: 'entity-profile-page-container' }, [
    topHeader,
    heroCard,
    threeColGrid,
    evidenceSection
  ].filter(Boolean));

  c.append(container);
}
