import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, recordAudit, notifyStateChange } from '../state.js';
import { showToast } from '../components/Toast.js';

// Default analysis state
if (!state.aiAnalysis) {
  state.aiAnalysis = {
    query: '+91 98811 55421',
    streamType: 'all',
    activeResult: null,
    isAnalyzing: false,
    history: []
  };
}

export const sampleQueries = [
  { label: 'Phone: +91 98811 55421', query: '+91 98811 55421', type: 'phone', desc: 'Active suspect phone linked to cyber syndicate' },
  { label: 'Vehicle: MH-12-PQ-9081', query: 'MH-12-PQ-9081', type: 'vehicle', desc: 'White Swift linked to FC Road FIR' },
  { label: 'Bank: HDFC-50100492817291', query: 'HDFC-50100492817291', type: 'bank', desc: 'Layering mule account diverting INR 14.5L' },
  { label: 'Person: Sameer Khan', query: 'Sameer Khan', type: 'person', desc: 'Known syndicate operator with 3 aliases' },
  { label: 'Clean Test: +91 99999 00000', query: '+91 99999 00000', type: 'clean', desc: 'Unregistered clean number (no syndicate)' }
];

export function performAIAnalysis(queryText, streamType = 'all') {
  const q = (queryText || '').trim();
  if (!q) {
    showToast('Please enter an identifier, phone, vehicle, person or bank account.');
    return null;
  }

  const qClean = q.toLowerCase().replace(/[\s\-_]/g, '');

  // 1. Gather all knowledge base elements
  const allEntities = [...entities];
  const allCases = [...firCases];
  if (state.firDraft && state.firDraft.firNumber) {
    allCases.push(state.firDraft);
  }

  // Built-in intelligence dataset for cross-stream synthesis
  const intelligenceBase = [
    {
      id: 'syn_01',
      name: 'ShadowFlow Cyber Racket',
      type: 'Organized Cyber-Financial Syndicate',
      threat: 'CRITICAL',
      confidence: 96,
      modusOperandi: 'Synthetic cryptocurrency investment lures targeting high-net-worth victims across Pune & Mumbai. Diverts funds into 1st-tier mule accounts within 4 minutes of receipt, then converts via unauthorized P2P gateways.',
      triggers: ['9881155421', 'sameerkhan', 'sammy', 'bababhai', 'mh12pq9081', '50100492817291', 'hdfc50100492817291', 'vikramrathi', 'ajaydeshmukh', 'fcroad'],
      nodes: [
        { name: 'Sameer Khan (Baba Bhai)', role: 'Syndicate Kingpin / Caller', category: 'person', risk: 'high', link: 'Coordinates mule fund withdrawals and VoIP calling.' },
        { name: '+91 98811 55421', role: 'Primary burner SIM (Jio 5G)', category: 'phone', risk: 'high', link: 'Active near FC Road Tower (Cell ID: PN-CY-482).' },
        { name: 'MH-12-PQ-9081 (Swift)', role: 'Logistics / Mobility Asset', category: 'vehicle', risk: 'medium', link: 'Spotted at ATM cash-out clusters in Shivajinagar and Kothrud.' },
        { name: 'HDFC-50100492817291', role: 'Primary Layering Mule Account', category: 'bank', risk: 'high', link: 'Received INR 14.50L from victim; 6 rapid outgoing transfers.' },
        { name: 'Vikram Rathi', role: 'Technical Mule Manager', category: 'person', risk: 'high', link: 'Manages fake digital bond certificates and fake KYC portals.' },
        { name: 'Ajay Deshmukh', role: 'Cash Courier / ATM Mule', category: 'person', risk: 'medium', link: 'Withdrew INR 3.80L from Deccan Gymkhana ATM.' }
      ],
      firs: [
        { firNo: 'FIR-MH-2026-4821', station: 'Cyber Crime PS, Shivajinagar', sections: 'IPC 420, 468, 471, IT Act 66D', date: '2026-08-14', status: 'Under Active Investigation' },
        { firNo: 'FIR-MH-2026-1940', station: 'Kothrud Police Station', sections: 'IPC 420, 120B', date: '2026-07-22', status: 'Linked Cross-Case' }
      ],
      cdrEvidence: {
        totalCalls: 142,
        suspiciousNightCalls: 38,
        commonTower: 'PN-CY-482 (FC Road Commercial Complex, Pune)',
        imeiOverlap: '864291048821902 (Dual SIM handset with 2 burner numbers)'
      },
      financialTrail: [
        { step: 1, flow: 'Complainant (Rajesh Kulkarni)', target: 'HDFC-50100492817291', amount: 'INR 14,50,000', note: 'Initial IMPS Transfer' },
        { step: 2, flow: 'HDFC-50100492817291', target: 'ICICI-0021948102', amount: 'INR 6,50,000', note: 'Split Layering' },
        { step: 3, flow: 'HDFC-50100492817291', target: 'AXIS-91201004812', amount: 'INR 4,20,000', note: 'Split Layering' },
        { step: 4, flow: 'ICICI / AXIS Mule Accounts', target: 'Deccan ATM Cash-Out (Ajay Deshmukh)', amount: 'INR 3,80,000', note: 'Physical Cash Withdrawal' }
      ],
      actions: [
        { id: 'act_1', title: 'Issue Emergency Section 91 CrPC Notice', desc: 'Direct HDFC, ICICI, and AXIS bank nodal officers to freeze linked mule accounts immediately.', priority: 'urgent' },
        { id: 'act_2', title: 'Tower Dump & IMEI Intercept', desc: 'Request CDR/IPDR for Cell ID PN-CY-482 and IMEI 864291048821902 from Telecom Service Providers.', priority: 'high' },
        { id: 'act_3', title: 'ANPR Vehicle Intercept (BOLO)', desc: 'Broadcast alert to Pune City traffic ANPR cameras for white Swift MH-12-PQ-9081.', priority: 'high' },
        { id: 'act_4', title: 'Unified Organized Crime Docket', desc: 'Merge FIR-MH-2026-4821 and FIR-MH-2026-1940 into single joint syndicate chargesheet under MCOCA/IPC 120B.', priority: 'medium' }
      ]
    },
    {
      id: 'syn_02',
      name: 'Swargate Extortion & Hawala Ring',
      type: 'Extortion & Unregistered Financial Routing',
      threat: 'ELEVATED',
      confidence: 88,
      modusOperandi: 'Extortion protection racket collecting weekly cash from commercial transport operators and laundering via Bank of Maharashtra mule accounts.',
      triggers: ['arjunpawar', 'sureshshinde', 'rohitsalunkhe', '9819944312', '9765588910', 'bom60129948102', 'pnswr312', 'fir-mh-2026-2811'],
      nodes: [
        { name: 'Suresh Shinde', role: 'Extortion Ringmaster / Hawala Operator', category: 'person', risk: 'high', link: 'Coordinates intimidation calls and off-ledger hawala couriers.' },
        { name: 'Arjun Pawar', role: 'Enforcer / Account Holder', category: 'person', risk: 'medium', link: 'Recruits mules and collects extortion payoffs.' },
        { name: 'Rohit Salunkhe', role: 'Field Intimidator / Delivery Asset', category: 'person', risk: 'medium', link: 'Delivers physical extortion threat slips.' },
        { name: 'BOM-60129948102', role: 'Extortion Collection Mule Account', category: 'bank', risk: 'high', link: 'Layering hub for micro-deposits totaling INR 8.90L.' },
        { name: 'Cell Tower PN-SWR-312', role: 'Swargate Bus Terminal Cell Site', category: 'cell_tower', risk: 'medium', link: 'Co-location sector for suspect communication bursts.' }
      ],
      firs: [
        { firNo: 'FIR-MH-2026-2811', station: 'Swargate Police Station', sections: 'IPC 384, 386, 120B', date: '2026-06-19', status: 'Charge-sheet Under Preparation' }
      ],
      cdrEvidence: {
        totalCalls: 89,
        suspiciousNightCalls: 19,
        commonTower: 'PN-SWR-312 (Swargate Bus Depot Sector)',
        imeiOverlap: '358291024781901'
      },
      financialTrail: [
        { step: 1, flow: 'Transport Operator Payoffs (Multiple credits)', target: 'BOM-60129948102', amount: 'INR 8,90,000', note: 'Aggregated extortion deposits' },
        { step: 2, flow: 'BOM-60129948102', target: 'Hawala Courier Cash Handover (Suresh Shinde)', amount: 'INR 7,50,000', note: 'Off-ledger settlement' }
      ],
      actions: [
        { id: 'act_5', title: 'Freeze Bank Accounts under PMLA', desc: 'Liaise with Bank of Maharashtra nodal officer to freeze BOM-60129948102 immediately.', priority: 'urgent' },
        { id: 'act_6', title: 'Summon Account Holder for Interrogation', desc: 'Issue summons under Section 41A CrPC to Arjun Pawar.', priority: 'high' }
      ]
    }
  ];

  // Check matching syndicate
  let matchedSyndicate = null;
  for (const syn of intelligenceBase) {
    if (syn.triggers.some(trig => qClean.includes(trig) || trig.includes(qClean))) {
      matchedSyndicate = syn;
      break;
    }
  }

  // Also scan database entities and FIR cases dynamically
  const matchedEntities = allEntities.filter(e => {
    const nameMatch = (e.name || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const phoneMatch = (e.phone || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const cityMatch = (e.city || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    return nameMatch || phoneMatch || cityMatch;
  });

  const matchedFirs = allCases.filter(c => {
    const numMatch = (c.firNumber || c.fir_number || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const subjMatch = (c.subjectName || c.subject_name || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const phoneMatch = (c.phone || c.complainantPhone || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const vehMatch = (c.vehicle || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    const bankMatch = (c.bank || '').toLowerCase().replace(/[\s\-_]/g, '').includes(qClean);
    return numMatch || subjMatch || phoneMatch || vehMatch || bankMatch;
  });

  let result = null;

  if (matchedSyndicate) {
    // High-confidence syndicate detection
    result = {
      query: q,
      streamType,
      status: 'syndicate_detected',
      verdictTitle: `Syndicate Match: ${matchedSyndicate.name}`,
      threatLevel: matchedSyndicate.threat,
      confidence: matchedSyndicate.confidence,
      racketType: matchedSyndicate.type,
      modusOperandi: matchedSyndicate.modusOperandi,
      nodes: matchedSyndicate.nodes,
      firs: matchedSyndicate.firs,
      cdrEvidence: matchedSyndicate.cdrEvidence,
      financialTrail: matchedSyndicate.financialTrail,
      actions: matchedSyndicate.actions,
      timestamp: new Date().toLocaleString()
    };
  } else if (matchedEntities.length > 0 || matchedFirs.length > 0) {
    // Dynamic database match
    const primaryEntity = matchedEntities[0];
    const primaryFir = matchedFirs[0];
    result = {
      query: q,
      streamType,
      status: 'cluster_detected',
      verdictTitle: `Multi-Record Linkage Cluster Detected`,
      threatLevel: 'HIGH',
      confidence: 79,
      racketType: 'Multi-Record Cross-Linked Suspect',
      modusOperandi: `Entity identified across ${matchedEntities.length} record(s) and ${matchedFirs.length} active FIR dossier(s). Correlated with active investigation records in Maharashtra Police database.`,
      nodes: [
        ...(primaryEntity ? [{ name: primaryEntity.name, role: `${primaryEntity.type} (Database Record)`, category: 'person', risk: primaryEntity.risk || 'medium', link: `Identified in ${primaryEntity.city || 'Pune'}` }] : []),
        ...(primaryFir ? [{ name: primaryFir.firNumber || 'Active FIR', role: 'Registered Police Case', category: 'fir', risk: 'high', link: `${primaryFir.policeStation || 'Police Station'} · ${primaryFir.sections || 'IPC Acts'}` }] : []),
        ...(primaryFir?.phone ? [{ name: primaryFir.phone, role: 'Contact Identifier', category: 'phone', risk: 'medium', link: 'Discovered in case narrative' }] : []),
        ...(primaryFir?.vehicle ? [{ name: primaryFir.vehicle, role: 'Associated Vehicle', category: 'vehicle', risk: 'medium', link: 'Seized / identified in intake' }] : []),
        ...(primaryFir?.bank ? [{ name: primaryFir.bank, role: 'Financial Trail', category: 'bank', risk: 'high', link: 'Identified payment route' }] : [])
      ],
      firs: matchedFirs.map(f => ({
        firNo: f.firNumber || f.fir_number || 'FIR-MH-2026',
        station: f.policeStation || f.police_station || 'Police Station',
        sections: f.sections || 'IPC 420',
        date: f.incidentDate || f.incident_date || '2026-08',
        status: 'Active FIR Dossier'
      })),
      cdrEvidence: {
        totalCalls: 46,
        suspiciousNightCalls: 12,
        commonTower: 'PN-DT-089 (Pune Central Sector)',
        imeiOverlap: 'Discovered cross-reference match'
      },
      financialTrail: [
        { step: 1, flow: 'Target Entity Record', target: 'Identified Account / Transaction', amount: 'INR Under Audit', note: 'Database cross-match' }
      ],
      actions: [
        { id: 'act_dyn1', title: 'Cross-Match with State Crime Database', desc: 'Run automated CCTNS inquiry on all discovered phone numbers and aliases.', priority: 'urgent' },
        { id: 'act_dyn2', title: 'Examine Associate Call Patterns', desc: 'Extract full 90-day CDR history for suspect numbers.', priority: 'high' }
      ],
      timestamp: new Date().toLocaleString()
    };
  } else {
    // Clean / Unlinked record
    result = {
      query: q,
      streamType,
      status: 'clean',
      verdictTitle: `No Organized Syndicates or Cross-Case Overlaps Found`,
      threatLevel: 'CLEAN',
      confidence: 10,
      racketType: 'Isolated Identifier / No Cross-Case Overlap',
      modusOperandi: `The identifier "${q}" does not match any known organized crime syndicates, registered FIR dossiers, seized vehicle lists, or flagged mule bank accounts in the database.`,
      nodes: [
        { name: q, role: 'Queried Subject / Entity', category: 'unknown', risk: 'low', link: 'Zero co-conspirator or cross-case linkages detected.' }
      ],
      firs: [],
      cdrEvidence: null,
      financialTrail: [],
      actions: [
        { id: 'act_clean1', title: 'Continuous Watchlist Monitoring', desc: 'No coercive action required. Identifier logged for passive anomaly monitoring.', priority: 'low' }
      ],
      timestamp: new Date().toLocaleString()
    };
  }

  state.aiAnalysis.activeResult = result;
  state.aiAnalysis.history.unshift({
    query: q,
    threat: result.threatLevel,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    racket: result.racketType
  });

  recordAudit('AI Linkage analysis', `AI pattern scan executed for query "${q}" (Verdict: ${result.threatLevel} - ${result.racketType}).`, result.threatLevel === 'CRITICAL' ? 'critical' : 'info', 'analysis').catch(() => {});

  return result;
}

export function renderAIAnalysis(c) {
  const container = c || document.querySelector('main.content');
  if (container) container.innerHTML = '';

  if (!state.aiAnalysis.activeResult && state.aiAnalysis.query) {
    performAIAnalysis(state.aiAnalysis.query, state.aiAnalysis.streamType);
  }
  const activeResult = state.aiAnalysis.activeResult;

  const header = el('div', { class: 'section-header' }, [
    el('div', {}, [
      el('h1', {}, ['AI Pattern & Syndicate Analysis']),
      el('p', { class: 'subtitle' }, [
        'Universal multi-modal linkage engine: correlate phone numbers, vehicle registrations, bank accounts, suspect names, and case narratives across FIRs & CDR records to uncover hidden rackets.'
      ])
    ]),
    el('div', { class: 'header-actions' }, [
      el('button', {
        class: 'btn-secondary',
        onclick: () => {
          if (!activeResult) {
            showToast('Run an analysis first to export dossier.');
            return;
          }
          const text = `NETRAKSHAK AI INTELLIGENCE DOSSIER\nQuery: ${activeResult.query}\nVerdict: ${activeResult.verdictTitle}\nThreat Level: ${activeResult.threatLevel} (Confidence: ${activeResult.confidence}%)\nRacket Type: ${activeResult.racketType}\nModus Operandi: ${activeResult.modusOperandi}\n\nIdentified Nodes:\n${activeResult.nodes.map(n => `- ${n.name} (${n.role}) [${n.category}] - ${n.link}`).join('\n')}\n\nGenerated on: ${activeResult.timestamp}`;
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `AI_Analysis_${activeResult.query.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('✓ AI Intelligence Dossier exported successfully.');
        }
      }, [icon('file'), ' Export Intelligence Dossier'])
    ])
  ]);

  // Search input & controls
  const searchInput = el('input', {
    type: 'text',
    class: 'ai-search-input',
    placeholder: 'Enter phone number (+91…), vehicle plate (MH-12-…), bank account, person name, or lead note…',
    value: state.aiAnalysis.query || ''
  });

  const streamSelect = el('select', { class: 'ai-stream-select' }, [
    el('option', { value: 'all', selected: state.aiAnalysis.streamType === 'all' }, ['All Intelligence Streams']),
    el('option', { value: 'phone', selected: state.aiAnalysis.streamType === 'phone' }, ['Phone / CDR Triangulation']),
    el('option', { value: 'vehicle', selected: state.aiAnalysis.streamType === 'vehicle' }, ['Vehicle / Mobility']),
    el('option', { value: 'bank', selected: state.aiAnalysis.streamType === 'bank' }, ['Bank & Mule Accounts']),
    el('option', { value: 'person', selected: state.aiAnalysis.streamType === 'person' }, ['Person / Suspect Aliases']),
    el('option', { value: 'narrative', selected: state.aiAnalysis.streamType === 'narrative' }, ['Unstructured Lead / FIR Narrative'])
  ]);

  const searchBtn = el('button', {
    class: 'primary-btn ai-analyze-btn',
    onclick: () => {
      const q = searchInput.value.trim();
      state.aiAnalysis.query = q;
      state.aiAnalysis.streamType = streamSelect.value;
      performAIAnalysis(q, streamSelect.value);
      notifyStateChange();
    }
  }, [
    icon('sparkle'),
    el('span', {}, ['Run AI Linkage Scan'])
  ]);

  // Enter key trigger
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  };

  const sampleChips = el('div', { class: 'ai-sample-chips' }, [
    el('span', { class: 'chips-label' }, ['Quick Scan Presets:']),
    ...sampleQueries.map(sq => {
      let iconName = 'sparkle';
      if (sq.type === 'phone') iconName = 'pulse';
      if (sq.type === 'vehicle') iconName = 'grid';
      if (sq.type === 'bank') iconName = 'database';
      if (sq.type === 'person') iconName = 'user';
      if (sq.type === 'clean') iconName = 'check';

      const chip = el('button', {
        class: `ai-sample-chip ${state.aiAnalysis.query === sq.query ? 'active' : ''}`,
        title: sq.desc,
        onclick: () => {
          searchInput.value = sq.query;
          state.aiAnalysis.query = sq.query;
          state.aiAnalysis.streamType = 'all';
          streamSelect.value = 'all';
          performAIAnalysis(sq.query, 'all');
          notifyStateChange();
        }
      }, [icon(iconName), el('span', {}, [sq.label])]);
      return chip;
    })
  ]);

  const searchBox = el('div', { class: 'ai-search-card' }, [
    el('div', { class: 'ai-search-top' }, [
      searchInput,
      streamSelect,
      searchBtn
    ]),
    sampleChips
  ]);

  // Result content view
  let resultView = null;

  if (activeResult) {
    const isCritical = activeResult.threatLevel === 'CRITICAL';
    const isHigh = activeResult.threatLevel === 'HIGH' || activeResult.threatLevel === 'ELEVATED';
    const isClean = activeResult.threatLevel === 'CLEAN';

    const bannerClass = isCritical ? 'verdict-critical' : (isHigh ? 'verdict-elevated' : 'verdict-clean');

    // 1. Verdict Banner
    const verdictCard = el('div', { class: `ai-verdict-card ${bannerClass}` }, [
      el('div', { class: 'verdict-header' }, [
        el('div', { class: 'verdict-title-box' }, [
          el('div', { class: 'verdict-badge-row' }, [
            el('span', { class: `threat-tag threat-${activeResult.threatLevel.toLowerCase()}` }, [`RISK RATING: ${activeResult.threatLevel}`]),
            el('span', { class: 'confidence-tag' }, [`AI Confidence: ${activeResult.confidence}%`]),
            el('span', { class: 'racket-tag' }, [activeResult.racketType])
          ]),
          el('h2', { class: 'verdict-title' }, [activeResult.verdictTitle])
        ]),
        el('div', { class: 'verdict-gauge' }, [
          el('div', { class: 'gauge-val' }, [`${activeResult.confidence}%`]),
          el('div', { class: 'gauge-label' }, ['Pattern Probability'])
        ])
      ]),
      el('div', { class: 'verdict-narrative' }, [
        el('strong', {}, ['Modus Operandi & Syndicate Pattern: ']),
        el('span', {}, [activeResult.modusOperandi])
      ])
    ]);

    // 2. Discovered Overlapping Links (Nodes)
    const nodesSection = el('div', { class: 'ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Discovered Co-Conspirators & Multi-Hop Linkages (', String(activeResult.nodes.length), ')']),
        el('span', { class: 'muted' }, ['Correlated across CDR towers, FIRs, bank transfers, and suspect records'])
      ]),
      el('div', { class: 'ai-nodes-grid' }, activeResult.nodes.map(n => {
        let catIcon = 'user';
        if (n.category === 'phone') catIcon = 'pulse';
        if (n.category === 'vehicle') catIcon = 'grid';
        if (n.category === 'bank') catIcon = 'database';
        if (n.category === 'fir') catIcon = 'file';

        return el('div', { class: `ai-node-card risk-${n.risk || 'low'}` }, [
          el('div', { class: 'node-card-top' }, [
            el('div', { class: 'node-icon-box' }, [icon(catIcon)]),
            el('div', { class: 'node-info' }, [
              el('strong', { class: 'node-name' }, [n.name]),
              el('span', { class: 'node-role' }, [n.role])
            ]),
            el('span', { class: `node-risk-pill ${n.risk || 'low'}` }, [(n.risk || 'LOW').toUpperCase()])
          ]),
          el('div', { class: 'node-link-desc' }, [
            el('span', { class: 'link-arrow' }, ['↳ ']),
            el('span', {}, [n.link])
          ])
        ]);
      }))
    ]);

    // 3. Connected FIRs and Cross-Case Overlaps
    const firsSection = activeResult.firs.length > 0 ? el('div', { class: 'ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Cross-District FIR Matches & Charge-Sheet Overlaps (', String(activeResult.firs.length), ')']),
        el('span', { class: 'muted' }, ['Common accused, modus operandi, and seized property'])
      ]),
      el('div', { class: 'ai-firs-list' }, activeResult.firs.map(f => el('div', { class: 'ai-fir-item' }, [
        el('div', { class: 'fir-badge' }, [icon('file'), el('strong', {}, [f.firNo])]),
        el('div', { class: 'fir-details' }, [
          el('div', { class: 'fir-ps' }, [f.station]),
          el('div', { class: 'fir-sections' }, [f.sections]),
          el('div', { class: 'fir-meta' }, [`Date: ${f.date} · Status: ${f.status}`])
        ]),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.view = 'fir';
            notifyStateChange();
            showToast(`Opened FIR View for case ${f.firNo}`);
          }
        }, ['View Case Dossier →'])
      ])))
    ]) : null;

    // 4. CDR Tower & Telecommunication Triangulation
    const cdrSection = activeResult.cdrEvidence ? el('div', { class: 'ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['CDR Telecommunications & Tower Triangulation']),
        el('span', { class: 'muted' }, ['Call frequency, nocturnal activity, and co-location tower matches'])
      ]),
      el('div', { class: 'cdr-stats-grid' }, [
        el('div', { class: 'cdr-stat-box' }, [
          el('span', { class: 'stat-label' }, ['Total Correlated Calls']),
          el('strong', { class: 'stat-val' }, [String(activeResult.cdrEvidence.totalCalls)]),
          el('span', { class: 'stat-sub' }, ['Across identified burner cluster'])
        ]),
        el('div', { class: 'cdr-stat-box' }, [
          el('span', { class: 'stat-label' }, ['Nocturnal / Suspicious Calls']),
          el('strong', { class: 'stat-val red' }, [String(activeResult.cdrEvidence.suspiciousNightCalls)]),
          el('span', { class: 'stat-sub' }, ['Between 23:00 and 04:30 IST'])
        ]),
        el('div', { class: 'cdr-stat-box wide' }, [
          el('span', { class: 'stat-label' }, ['Dominant Cell Tower Sector']),
          el('strong', { class: 'stat-val blue' }, [activeResult.cdrEvidence.commonTower]),
          el('span', { class: 'stat-sub' }, [`IMEI Overlap: ${activeResult.cdrEvidence.imeiOverlap}`])
        ])
      ])
    ]) : null;

    // 5. Financial Money Flow / Layering Trail
    const finSection = activeResult.financialTrail.length > 0 ? el('div', { class: 'ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Financial Layering Trail & Mule Route']),
        el('span', { class: 'muted' }, ['Tracing fraud fund dissipation across intermediary bank accounts and ATM cash-outs'])
      ]),
      el('div', { class: 'financial-trail-chain' }, activeResult.financialTrail.map((ft, idx) => el('div', { class: 'fin-step-card' }, [
        el('div', { class: 'fin-step-num' }, [`0${ft.step}`]),
        el('div', { class: 'fin-step-body' }, [
          el('div', { class: 'fin-flow' }, [
            el('span', { class: 'fin-from' }, [ft.flow]),
            el('span', { class: 'fin-arrow' }, [' → ']),
            el('span', { class: 'fin-to' }, [ft.target])
          ]),
          el('div', { class: 'fin-note' }, [ft.note])
        ]),
        el('div', { class: 'fin-amount' }, [ft.amount])
      ])))
    ]) : null;

    // 6. Actionable Law Enforcement Next Steps
    const actionsSection = el('div', { class: 'ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Recommended Law Enforcement Action Steps']),
        el('span', { class: 'muted' }, ['Standard Operating Procedures (SOP) based on discovered pattern and threat level'])
      ]),
      el('div', { class: 'actions-list' }, activeResult.actions.map(act => el('div', { class: `action-item priority-${act.priority}` }, [
        el('div', { class: 'action-priority-badge' }, [act.priority.toUpperCase()]),
        el('div', { class: 'action-main' }, [
          el('strong', { class: 'action-title' }, [act.title]),
          el('p', { class: 'action-desc' }, [act.desc])
        ]),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            showToast(`✓ Action initiated: ${act.title}`);
            recordAudit('Investigative Action Initiated', `Officer initiated: ${act.title} for query ${activeResult.query}`, 'info', 'action').catch(() => {});
          }
        }, ['Initiate SOP →'])
      ])))
    ]);

    resultView = el('div', { class: 'ai-results-wrapper' }, [
      verdictCard,
      nodesSection,
      cdrSection,
      finSection,
      firsSection,
      actionsSection
    ]);
  } else {
    resultView = el('div', { class: 'ai-empty-state' }, [
      el('div', { class: 'empty-icon-box' }, [icon('sparkle')]),
      el('h3', {}, ['Ready for AI Linkage & Pattern Analysis']),
      el('p', {}, ['Enter any identifier above (phone, vehicle plate, bank account, person name, or case note) or click one of the quick presets to analyze cross-case syndicates.'])
    ]);
  }

  const mainLayout = el('div', { class: 'ai-analysis-container' }, [
    header,
    searchBox,
    resultView
  ]);

  if (container) {
    container.append(mainLayout);
  }

  return mainLayout;
}
