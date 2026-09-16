/**
 * Netrakshak AI Crime Intelligence Engine
 * Universal Criminal Intelligence, Multi-Source Cross-Record Fusion,
 * Automated CrPC / BNS Legal Drafting, and Conversational Analysis.
 */

import { entities, edges, firCases, state, recordAudit } from '../state.js';
import { graphMetrics } from './analysis.js';

// Base seed syndicate knowledge for deep fusion
export const SEED_SYNDICATES = [
  {
    id: 'syn_01',
    name: 'ShadowFlow Cyber-Financial Syndicate',
    type: 'Organized Cyber-Financial Syndicate',
    threat: 'CRITICAL',
    confidence: 96,
    leadOfficer: 'Insp. Vikram Shinde (Cyber Cell)',
    modusOperandi: 'Synthetic cryptocurrency investment lures targeting high-net-worth victims across Pune and Mumbai. Diverts funds into 1st-tier mule accounts within 4 minutes of receipt, then converts via unauthorized P2P gateways and ATM cash-outs.',
    triggers: ['9881155421', 'sameerkhan', 'sammy', 'bababhai', 'mh12pq9081', '50100492817291', 'hdfc50100492817291', 'vikramrathi', 'ajaydeshmukh', 'fcroad', 'fir-mh-2026-4821', 'fir-mh-2026-1940', 'crypto', 'mule', 'layering'],
    nodes: [
      { id: 'e_sameer', name: 'Sameer Khan (Baba Bhai)', role: 'Syndicate Kingpin / Lead Coordinator', category: 'person', risk: 'high', link: 'Coordinates mule fund withdrawals and VoIP calling.' },
      { id: 'e_phone_1', name: '+91 98811 55421', role: 'Primary Burner SIM (Jio 5G)', category: 'phone', risk: 'high', link: 'Active near FC Road Tower (Cell ID: PN-CY-482).' },
      { id: 'e_veh_1', name: 'MH-12-PQ-9081 (Swift)', role: 'Logistics / Mobility Asset', category: 'vehicle', risk: 'medium', link: 'Spotted at ATM cash-out clusters in Shivajinagar and Kothrud.' },
      { id: 'e_bank_1', name: 'HDFC-50100492817291', role: 'Primary Layering Mule Account', category: 'bank', risk: 'high', link: 'Received INR 14.50L from victim; 6 rapid outgoing transfers.' },
      { id: 'e_vikram', name: 'Vikram Rathi', role: 'Technical Mule Manager', category: 'person', risk: 'high', link: 'Manages fake digital bond certificates and fake KYC portals.' },
      { id: 'e_ajay', name: 'Ajay Deshmukh', role: 'Cash Courier / ATM Mule', category: 'person', risk: 'medium', link: 'Withdrew INR 3.80L from Deccan Gymkhana ATM.' }
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
      { id: 'act_1', title: 'Issue Emergency Section 91 CrPC Notice', desc: 'Direct HDFC, ICICI, and AXIS bank nodal officers to freeze linked mule accounts immediately.', priority: 'urgent', category: 'banking', actionType: 'draft_notice', payload: { noticeType: 'bank_freeze', bank: 'HDFC Bank Ltd.', account: '50100492817291', firNo: 'FIR-MH-2026-4821', subject: 'Sameer Khan' } },
      { id: 'act_2', title: 'Tower Dump & IMEI Intercept Order', desc: 'Request CDR/IPDR for Cell ID PN-CY-482 and IMEI 864291048821902 from Telecom Service Providers.', priority: 'high', category: 'cdr', actionType: 'draft_notice', payload: { noticeType: 'cdr_dump', phone: '+91 98811 55421', tower: 'PN-CY-482', firNo: 'FIR-MH-2026-4821' } },
      { id: 'act_3', title: 'ANPR Vehicle Intercept (BOLO)', desc: 'Broadcast alert to Pune City traffic ANPR cameras for white Swift MH-12-PQ-9081.', priority: 'high', category: 'mobility', actionType: 'bolo_alert', payload: { vehicle: 'MH-12-PQ-9081', model: 'Maruti Suzuki Swift (White)', firNo: 'FIR-MH-2026-4821' } },
      { id: 'act_4', title: 'Unified Organized Crime Docket', desc: 'Merge FIR-MH-2026-4821 and FIR-MH-2026-1940 into single joint syndicate chargesheet under MCOCA/IPC 120B.', priority: 'medium', category: 'legal', actionType: 'navigate_fir', payload: { targetView: 'fir' } }
    ]
  },
  {
    id: 'syn_02',
    name: 'Swargate Extortion & Hawala Ring',
    type: 'Extortion & Unregistered Financial Routing',
    threat: 'ELEVATED',
    confidence: 88,
    leadOfficer: 'Sr. PI Anand Rao (Crime Branch Unit 2)',
    modusOperandi: 'Extortion protection racket collecting weekly cash payoffs from commercial transport operators and laundering via Bank of Maharashtra mule accounts and cash couriers.',
    triggers: ['arjunpawar', 'sureshshinde', 'rohitsalunkhe', '9819944312', '9765588910', 'bom60129948102', 'pnswr312', 'fir-mh-2026-2811', 'extortion', 'hawala', 'swargate'],
    nodes: [
      { id: 'e_suresh', name: 'Suresh Shinde', role: 'Extortion Ringmaster / Hawala Operator', category: 'person', risk: 'high', link: 'Coordinates intimidation calls and off-ledger hawala couriers.' },
      { id: 'e_arjun', name: 'Arjun Pawar', role: 'Enforcer / Account Holder', category: 'person', risk: 'medium', link: 'Recruits mules and collects extortion payoffs.' },
      { id: 'e_rohit', name: 'Rohit Salunkhe', role: 'Field Intimidator / Delivery Asset', category: 'person', risk: 'medium', link: 'Delivers physical extortion threat slips.' },
      { id: 'e_bank_2', name: 'BOM-60129948102', role: 'Extortion Collection Mule Account', category: 'bank', risk: 'high', link: 'Layering hub for micro-deposits totaling INR 8.90L.' },
      { id: 'e_tower_2', name: 'Cell Tower PN-SWR-312', role: 'Swargate Bus Terminal Cell Site', category: 'cell_tower', risk: 'medium', link: 'Co-location sector for suspect communication bursts.' }
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
      { id: 'act_5', title: 'Freeze Bank Accounts under PMLA', desc: 'Liaise with Bank of Maharashtra nodal officer to freeze BOM-60129948102 immediately.', priority: 'urgent', category: 'banking', actionType: 'draft_notice', payload: { noticeType: 'bank_freeze', bank: 'Bank of Maharashtra', account: '60129948102', firNo: 'FIR-MH-2026-2811', subject: 'Arjun Pawar' } },
      { id: 'act_6', title: 'Summon Account Holder for Interrogation', desc: 'Issue summons under Section 41A CrPC to Arjun Pawar.', priority: 'high', category: 'legal', actionType: 'draft_notice', payload: { noticeType: 'summons_41a', subject: 'Arjun Pawar', firNo: 'FIR-MH-2026-2811' } }
    ]
  }
];

/**
 * Universal Intelligence Indexer:
 * Combines all live memory entities, relationships, FIR cases, CDR records,
 * and financial transactions into an indexed graph for real-time analysis.
 */
export function buildIntelligenceIndex() {
  const allEntities = Array.isArray(entities) ? [...entities] : [];
  const allCases = Array.isArray(firCases) ? [...firCases] : [];
  if (state.firDraft && state.firDraft.firNumber) {
    allCases.push(state.firDraft);
  }

  const allCdrs = Array.isArray(state.cdrRecords) ? state.cdrRecords : [];
  const allFinances = Array.isArray(state.financialTransactions) ? state.financialTransactions : [];
  const allEvidence = Array.isArray(state.evidenceItems) ? state.evidenceItems : [];

  // Graph topology calculation
  const graphData = graphMetrics(allEntities, edges || []);

  // Dynamic syndicate discovery from live records
  const dynamicSyndicates = discoverDynamicSyndicates(allEntities, allCases, edges || []);
  const mergedSyndicates = [...dynamicSyndicates];

  // Include seed syndicates if not already shadowed
  SEED_SYNDICATES.forEach(seed => {
    if (!mergedSyndicates.some(s => s.id === seed.id || s.name === seed.name)) {
      mergedSyndicates.push(seed);
    }
  });

  return {
    entities: allEntities,
    edges: edges || [],
    cases: allCases,
    cdrs: allCdrs,
    finances: allFinances,
    evidence: allEvidence,
    metrics: graphData,
    syndicates: mergedSyndicates
  };
}

/**
 * Discovers criminal syndicates dynamically by grouping live database records
 */
function discoverDynamicSyndicates(entityList, caseList, edgeList) {
  const clusters = [];
  const syndicateMap = new Map();

  // 1. Group by explicit syndicateGroup property on FIR cases or entities
  caseList.forEach(c => {
    const groupName = c.syndicateGroup || c.syndicate_group || '';
    if (groupName && groupName.trim()) {
      const gKey = groupName.trim().toLowerCase();
      if (!syndicateMap.has(gKey)) {
        syndicateMap.set(gKey, {
          name: groupName.trim(),
          cases: [],
          entityNames: new Set()
        });
      }
      const entry = syndicateMap.get(gKey);
      entry.cases.push(c);
      if (c.subjectName || c.subject_name) entry.entityNames.add(c.subjectName || c.subject_name);
      if (c.otherAccused || c.other_accused) entry.entityNames.add(c.otherAccused || c.other_accused);
    }
  });

  syndicateMap.forEach((val, key) => {
    const linkedEntities = entityList.filter(e => {
      const name = (e.name || e.label || '').toLowerCase();
      return Array.from(val.entityNames).some(n => name.includes(n.toLowerCase()));
    });

    const threatLevel = linkedEntities.some(e => e.risk === 'high') || val.cases.length >= 2 ? 'CRITICAL' : 'HIGH';

    clusters.push({
      id: `dyn_syn_${key.replace(/[^a-z0-9]/gi, '_')}`,
      name: `${val.name} Crime Cluster`,
      type: 'Live Database Syndicate Cluster',
      threat: threatLevel,
      confidence: 90,
      leadOfficer: val.cases[0]?.policeStation || val.cases[0]?.police_station || 'Investigating Officer',
      modusOperandi: `Discovered across ${val.cases.length} FIR cases. Involves ${linkedEntities.length || val.entityNames.size} identified co-accused operatives.`,
      triggers: [key, ...Array.from(val.entityNames).map(n => n.toLowerCase())],
      nodes: linkedEntities.map(e => ({
        id: e.id,
        name: e.name || e.label || 'Accused Entity',
        role: e.category || 'Suspect Node',
        category: e.category || 'person',
        risk: e.risk || 'medium',
        link: `Linked in FIR ${val.cases[0]?.firNumber || val.cases[0]?.fir_number || 'case file'}`
      })),
      firs: val.cases.map(c => ({
        firNo: c.firNumber || c.fir_number || 'FIR-CASE',
        station: c.policeStation || c.police_station || 'Police Station',
        sections: c.sections || 'IPC 420',
        date: c.incidentDate || c.incident_date || '2026',
        status: 'Active Investigation'
      })),
      actions: [
        {
          id: `act_dyn_${key}_1`,
          title: `Issue Section 91 CrPC Production Orders`,
          desc: `Direct CDR and bank statement preservation for ${Array.from(val.entityNames).slice(0, 2).join(' & ') || 'suspects'}.`,
          priority: 'urgent',
          category: 'banking',
          actionType: 'draft_notice',
          payload: { noticeType: 'bank_freeze', subject: Array.from(val.entityNames)[0] || 'Suspect', firNo: val.cases[0]?.firNumber || val.cases[0]?.fir_number }
        },
        {
          id: `act_dyn_${key}_2`,
          title: `Execute Section 41A CrPC Summons`,
          desc: `Issue formal appearance notices for interrogation.`,
          priority: 'high',
          category: 'legal',
          actionType: 'draft_notice',
          payload: { noticeType: 'summons_41a', subject: Array.from(val.entityNames)[0] || 'Suspect', firNo: val.cases[0]?.firNumber || val.cases[0]?.fir_number }
        }
      ]
    });
  });

  return clusters;
}

/**
 * Tactical Lead Generator:
 * Evaluates live database for cross-case accused, mule accounts, phone co-locations,
 * and high-betweenness bridge nodes in the criminal network.
 */
export function generateTacticalLeads() {
  const index = buildIntelligenceIndex();
  const leads = [];

  // 1. Gather all syndicate-level actions
  index.syndicates.forEach(syn => {
    if (syn.actions && Array.isArray(syn.actions)) {
      syn.actions.forEach(act => {
        leads.push({
          id: act.id || `lead_${Math.random().toString(36).substr(2, 6)}`,
          syndicateId: syn.id,
          syndicateName: syn.name,
          title: act.title,
          desc: act.desc,
          priority: act.priority || 'high',
          category: act.category || 'legal',
          firList: syn.firs ? syn.firs.map(f => f.firNo || f.firNumber) : [],
          threat: syn.threat || 'HIGH',
          actionType: act.actionType,
          payload: act.payload
        });
      });
    }
  });

  // 2. Discover live cross-case overlaps in registered FIR database
  const entityCaseMap = new Map();
  index.cases.forEach(c => {
    const firNo = c.firNumber || c.fir_number || 'FIR-CASE';
    const names = [c.subjectName || c.subject_name, c.otherAccused || c.other_accused].filter(Boolean);
    const phones = [c.phone].filter(Boolean);
    const vehicles = [c.vehicle].filter(Boolean);
    const banks = [c.bank].filter(Boolean);

    [...names, ...phones, ...vehicles, ...banks].forEach(item => {
      const key = String(item).trim().toLowerCase();
      if (!key || key === 'unknown' || key === 'n/a' || key === 'none') return;
      if (!entityCaseMap.has(key)) {
        entityCaseMap.set(key, { raw: item, firs: new Set(), stations: new Set() });
      }
      entityCaseMap.get(key).firs.add(firNo);
      if (c.policeStation || c.police_station) {
        entityCaseMap.get(key).stations.add(c.policeStation || c.police_station);
      }
    });
  });

  entityCaseMap.forEach((val, key) => {
    if (val.firs.size > 1) {
      const firArr = Array.from(val.firs);
      leads.push({
        id: `cross_link_${key.replace(/[^a-z0-9]/gi, '_')}`,
        syndicateName: 'Multi-Jurisdiction Syndicate Link',
        title: `Cross-Case Overlap: ${val.raw}`,
        desc: `Identifier "${val.raw}" appears across ${firArr.length} distinct FIR cases (${firArr.join(', ')}). Recommend joint inter-station coordination.`,
        priority: 'urgent',
        category: 'legal',
        firList: firArr,
        threat: 'CRITICAL',
        actionType: 'draft_notice',
        payload: { noticeType: 'cross_case_memo', identifier: val.raw, firList: firArr }
      });
    }
  });

  // 3. Network graph bridge / centrality alerts
  index.metrics.forEach(node => {
    if (node.degree >= 4 && (node.metrics?.goBetween > 50 || node.metrics?.degreeCentrality > 0.3)) {
      leads.push({
        id: `bridge_${node.id}`,
        syndicateName: 'Network Topology Alert',
        title: `High-Betweenness Bridge: ${node.name || node.label}`,
        desc: `${node.name || node.label} has betweenness centrality score of ${Math.round(node.metrics?.goBetween || 60)}%. Acts as critical communication choke point in the criminal graph.`,
        priority: 'high',
        category: 'cdr',
        firList: [],
        threat: 'HIGH',
        actionType: 'inspect_entity',
        payload: { entityId: node.id }
      });
    }
  });

  return leads;
}

/**
 * Universal Cross-Record Search:
 * Executes multi-dimensional queries against all entities, FIR cases, CDRs, and bank accounts.
 */
export function searchIntelligence(queryText, streamType = 'all') {
  const q = (queryText || '').trim();
  if (!q) return null;

  const qLower = q.toLowerCase();
  const qClean = qLower.replace(/[\s\-_+]/g, '');
  const index = buildIntelligenceIndex();

  // 1. Search live entities
  const matchedEntities = index.entities.filter(e => {
    if (streamType !== 'all' && e.category !== streamType && (e.type || '').toLowerCase() !== streamType) {
      return false;
    }
    const name = (e.name || e.label || '').toLowerCase();
    const id = (e.id || '').toLowerCase();
    const phone = (e.phone || e.identifiers?.phone || '').toLowerCase().replace(/[\s\-_+]/g, '');
    const vehicle = (e.vehicle || e.identifiers?.vehicle || '').toLowerCase().replace(/[\s\-_]/g, '');
    const bank = (e.bank || e.identifiers?.bank || '').toLowerCase().replace(/[\s\-_]/g, '');
    const city = (e.city || '').toLowerCase();

    return name.includes(qLower) || id.includes(qClean) ||
      (phone && (phone.includes(qClean) || qClean.includes(phone))) ||
      (vehicle && (vehicle.includes(qClean) || qClean.includes(vehicle))) ||
      (bank && (bank.includes(qClean) || qClean.includes(bank))) ||
      city.includes(qLower);
  });

  // 2. Search live FIR cases
  const matchedCases = index.cases.filter(c => {
    const firNo = (c.firNumber || c.fir_number || '').toLowerCase().replace(/[\s\-_]/g, '');
    const subj = (c.subjectName || c.subject_name || '').toLowerCase();
    const alias = (c.alias || '').toLowerCase();
    const otherAcc = (c.otherAccused || c.other_accused || '').toLowerCase();
    const summ = (c.incidentSummary || c.incident_summary || '').toLowerCase();
    const loc = (c.incidentLocation || c.incident_location || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase().replace(/[\s\-_+]/g, '');
    const vehicle = (c.vehicle || '').toLowerCase().replace(/[\s\-_]/g, '');
    const bank = (c.bank || '').toLowerCase().replace(/[\s\-_]/g, '');
    const sec = (c.sections || '').toLowerCase();

    return firNo.includes(qClean) || subj.includes(qLower) || alias.includes(qLower) ||
      otherAcc.includes(qLower) || summ.includes(qLower) || loc.includes(qLower) ||
      (phone && phone.includes(qClean)) || (vehicle && vehicle.includes(qClean)) ||
      (bank && bank.includes(qClean)) || sec.includes(qLower);
  });

  // 3. Search matched syndicates
  let matchedSyndicate = null;
  for (const syn of index.syndicates) {
    if (syn.triggers && syn.triggers.some(trig => qClean.includes(trig.replace(/[\s\-_]/g, '')) || trig.includes(qClean) || qLower.includes(trig))) {
      matchedSyndicate = syn;
      break;
    }
  }

  // If seeded syndicate matched
  if (matchedSyndicate) {
    let nodes = matchedSyndicate.nodes || [];
    if (streamType && streamType !== 'all') {
      nodes = nodes.filter(n => n.category === streamType || (n.role || '').toLowerCase().includes(streamType));
    }
    return {
      query: q,
      found: true,
      syndicate: {
        ...matchedSyndicate,
        nodes
      },
      liveEntities: matchedEntities,
      liveCases: matchedCases
    };
  }

  // If live matches found across database
  if (matchedEntities.length > 0 || matchedCases.length > 0) {
    const primary = matchedEntities[0] || {};
    const primaryCase = matchedCases[0] || {};
    const titleName = primary.name || primary.label || primaryCase.subjectName || primaryCase.subject_name || q;
    const isHighRisk = matchedEntities.some(e => e.risk === 'high') || matchedCases.some(c => (c.sections || '').includes('302') || (c.sections || '').includes('386') || (c.sections || '').includes('420'));

    return {
      query: q,
      found: true,
      syndicate: {
        id: `auto_${Date.now()}`,
        name: `Intelligence Docket: ${titleName}`,
        type: 'Live Database Correlated Intelligence',
        threat: isHighRisk ? 'CRITICAL' : 'ELEVATED',
        confidence: 88,
        leadOfficer: primaryCase.policeStation || primaryCase.police_station || 'Investigating Officer',
        modusOperandi: `Correlated across ${matchedCases.length} registered FIR cases and ${matchedEntities.length} suspect network nodes. Key locations: ${primary.city || primaryCase.incidentLocation || 'Pune Jurisdiction'}.`,
        nodes: matchedEntities.map(e => ({
          id: e.id,
          name: e.name || e.label || e.id,
          role: e.category ? `${e.category.toUpperCase()} Node` : 'Associated Suspect',
          category: e.category || 'person',
          risk: e.risk || 'medium',
          link: `Associated with ${e.city || 'target network'} in criminal command graph.`
        })),
        firs: matchedCases.map(c => ({
          firNo: c.firNumber || c.fir_number || 'FIR-CASE',
          station: c.policeStation || c.police_station || 'District Police Station',
          sections: c.sections || 'IPC 420 / CrPC',
          date: c.incidentDate || c.incident_date || '2026',
          status: 'Active Investigation'
        })),
        actions: [
          {
            id: `act_auto_1`,
            title: `Issue Section 91 CrPC Bank / CDR Order`,
            desc: `Request immediate transactional records and subscriber registration for ${titleName}.`,
            priority: 'urgent',
            category: 'banking',
            actionType: 'draft_notice',
            payload: { noticeType: 'bank_freeze', subject: titleName, firNo: primaryCase.firNumber || primaryCase.fir_number }
          },
          {
            id: `act_auto_2`,
            title: `Issue Section 41A CrPC Appearance Summons`,
            desc: `Serve notice to accused ${titleName} for formal interrogation and handwriting/voice samples.`,
            priority: 'high',
            category: 'legal',
            actionType: 'draft_notice',
            payload: { noticeType: 'summons_41a', subject: titleName, firNo: primaryCase.firNumber || primaryCase.fir_number }
          }
        ]
      },
      liveEntities: matchedEntities,
      liveCases: matchedCases
    };
  }

  return {
    query: q,
    found: false,
    message: `No prior criminal records or registered FIR matches found for "${q}". Identifier is clean or unindexed in the police database.`
  };
}

/**
 * Conversational Crime Intelligence Copilot:
 * Understands natural language questions, one-word queries, legal procedures,
 * and specific entity inquiries across the entire live database.
 */
export function processCopilotMessage(userMessage, conversationHistory = []) {
  const rawMsg = (userMessage || '').trim();
  if (!rawMsg) {
    return {
      text: 'Please enter an inquiry regarding any suspect name, mobile number, vehicle registration, mule bank account, legal procedure, or crime category.',
      actions: []
    };
  }

  const msg = rawMsg.toLowerCase();
  const cleanMsg = msg.replace(/[\s\-_+]/g, '');
  const index = buildIntelligenceIndex();

  // 1. Direct Search against Live Database for exact/fuzzy entity or FIR
  const liveSearchResult = searchIntelligence(rawMsg);
  const matchedEntities = liveSearchResult?.liveEntities || [];
  const matchedCases = liveSearchResult?.liveCases || [];

  // 2. Check for Specific Legal Notice / Drafting Intentions
  if (msg.includes('section 91') || msg.includes('crpc 91') || msg.includes('freeze') || msg.includes('lien') || msg.includes('bank notice')) {
    const targetEntity = matchedEntities[0] || index.entities.find(e => e.category === 'bank') || index.entities[0];
    const targetCase = matchedCases[0] || index.cases[0];
    const accNum = targetEntity?.bank || targetEntity?.name || '50100492817291';
    const firNum = targetCase?.firNumber || targetCase?.fir_number || 'FIR-MH-2026-4821';
    const bankName = targetEntity?.identifiers?.bankName || 'HDFC Bank Ltd. / State Bank of India';

    const noticeText = getSection91NoticeText({
      bankName,
      accountNo: accNum,
      firNumber: firNum,
      sections: targetCase?.sections || 'IPC 420, 468, 471 & IT Act 66D',
      policeStation: targetCase?.policeStation || targetCase?.police_station || 'Cyber Crime Police Station, Pune City',
      amount: '14,50,000'
    });

    return {
      text: `### Formal Legal Draft: Notice under Section 91 CrPC / BNSS Equivalent

\`\`\`text
${noticeText}
\`\`\`

#### Immediate Procedural Directives:
1. **Debit Lien Placement**: Transmit immediately to the designated nodal officer of ${bankName}.
2. **KYC & IP Logs Extraction**: Mandate submission of Account Opening Form (AOF) and IPDR login logs.
3. **Escrow Reversal**: Request freeze on secondary withdrawal hops.`,
      actions: [
        {
          id: 'act_copy_sec91',
          title: 'Copy Section 91 Notice to Clipboard',
          desc: 'Ready for official transmission to bank nodal officer.',
          priority: 'urgent',
          category: 'banking',
          actionType: 'copy_text',
          payload: { text: noticeText }
        }
      ]
    };
  }

  // 3. Check for Section 41A CrPC Summons / Interrogation Strategy
  if (msg.includes('section 41a') || msg.includes('summons') || msg.includes('interrogat') || msg.includes('question') || msg.includes('cross-examin')) {
    const targetName = matchedEntities[0]?.name || matchedCases[0]?.subjectName || 'Accused Person';
    const targetFir = matchedCases[0]?.firNumber || matchedCases[0]?.fir_number || 'FIR-MH-2026-4821';

    const summonsText = getSection41ASummonsText({
      accusedName: targetName,
      firNumber: targetFir,
      policeStation: matchedCases[0]?.policeStation || 'Cyber Crime Police Station, Shivajinagar',
      sections: matchedCases[0]?.sections || 'IPC 420, 120B'
    });

    return {
      text: `### Tactical Interrogation Strategy & Section 41A Summons for **${targetName}**

#### Formal Summons Draft:
\`\`\`text
${summonsText}
\`\`\`

#### Tactical Cross-Examination Questions:
1. **Digital Timeline Inconsistency**:
   - *"Your registered SIM was connected to Sector Tower PN-CY-482 at 14:22 IST, exactly 3 minutes before the INR 14.5L IMPS withdrawal. How do you account for your presence at that specific location?"*
2. **Handset & IMEI Swapping**:
   - *"Device telemetry proves IMEI handset 864291048821902 operated both your primary SIM and the burner contact number. Who had physical possession of this handset?"*
3. **Financial Layering Account Beneficiary**:
   - *"Explain the commercial consideration for 6 immediate outgoing transfers executed to secondary accounts within 4 minutes of receiving victim deposits."*
4. **Co-Conspirator Communication Logs**:
   - *"Telegram and WhatsApp VoIP call records indicate 14 communications with co-accused handlers prior to the transaction. What was the nature of these instructions?"*`,
      actions: [
        {
          id: 'act_copy_41a',
          title: 'Copy Section 41A Summons to Clipboard',
          desc: 'Formal appearance summons ready for service.',
          priority: 'high',
          category: 'legal',
          actionType: 'copy_text',
          payload: { text: summonsText }
        }
      ]
    };
  }

  // 4. Check for ANPR / Vehicle / Traffic / Mobility queries
  if (msg.includes('anpr') || msg.includes('bolo') || msg.includes('vehicle') || msg.includes('car') || msg.includes('bike') || msg.includes('toll') || msg.includes('fastag') || msg.includes('swift')) {
    const vehEntity = index.entities.find(e => e.category === 'vehicle') || { name: 'MH-12-PQ-9081 (Maruti Swift)', vehicle: 'MH-12-PQ-9081' };
    return {
      text: `### ANPR Traffic Grid & Vehicle Intercept Protocol

#### Target Vehicle Telemetry:
- **Registration**: \`${vehEntity.vehicle || vehEntity.name || 'MH-12-PQ-9081'}\`
- **Make/Model**: Maruti Suzuki Swift (White / Dark Tint)
- **Last Sighted Sector**: Pune-Mumbai Expressway (Toll Plaza Urse) & Shivajinagar ATM cluster.

#### Tactical Mobility SOP:
1. **Automated BOLO Broadcast**: Transmit registration number to Pune City Integrated Traffic Management System (ITMS) and state highway ANPR cameras.
2. **FASTag Transaction Dump**: Request National Electronic Toll Collection (NETC) logs from NPCI to establish vehicle route and temporal pattern.
3. **Nakabandi Checkpoint Alert**: Deploy intercept teams at major outbound toll plazas (Talegaon, Khed-Shivapur, Somatane).`,
      actions: [
        {
          id: 'act_anpr_broadcast',
          title: 'Broadcast ANPR BOLO Alert',
          desc: 'Deploy live license plate watchlist across Maharashtra highway grid.',
          priority: 'high',
          category: 'mobility',
          actionType: 'bolo_alert',
          payload: { vehicle: vehEntity.vehicle || 'MH-12-PQ-9081' }
        }
      ]
    };
  }

  // 5. Check for CDR / IPDR / Cell Tower / IMEI inquiries
  if (msg.includes('cdr') || msg.includes('ipdr') || msg.includes('tower') || msg.includes('cell id') || msg.includes('imei') || msg.includes('imsi') || msg.includes('sim') || msg.includes('phone') || msg.includes('call')) {
    return {
      text: `### Telecommunications Intelligence & Tower Triangulation

#### Active Cellular Analysis Protocol:
- **Dominant Crime Sector**: \`PN-CY-482 (FC Road Commercial Hub, Pune)\`
- **Co-Location Patterns**: 38 late-night calls logged between 23:00 and 04:30 IST during active syndicate operations.
- **Handset IMEI Overlap**: \`864291048821902\` (Dual-SIM device toggling between multiple disposable SIMs).

#### Procedural Action Steps:
1. **Section 91 CrPC Order to TSPs**: Request complete CDR (with azimuth angles, first/last cell ID) and IPDR logs for the 90-day window.
2. **Tower Dump Extraction**: Extract all mobile devices attached to Cell Site PN-CY-482 during the 30-minute window of the offense.
3. **IMSI Catcher / Silent SMS Intercept**: Re-verify current active tower attachment for suspect numbers.`,
      actions: [
        {
          id: 'act_tower_dump',
          title: 'Generate Tower Dump Request Order',
          desc: 'Formal request to Airtel, Jio, and Vi nodal officers.',
          priority: 'urgent',
          category: 'cdr',
          actionType: 'draft_notice',
          payload: { noticeType: 'cdr_dump', tower: 'PN-CY-482' }
        }
      ]
    };
  }

  // 6. Check for Banking / Mule Accounts / Hawala / Money Trail inquiries
  if (msg.includes('bank') || msg.includes('mule') || msg.includes('hawala') || msg.includes('money') || msg.includes('crypto') || msg.includes('layering') || msg.includes('p2p') || msg.includes('hdfc') || msg.includes('sbi') || msg.includes('icici') || msg.includes('bom')) {
    return {
      text: `### Financial Trail & Mule Network Intelligence

#### Layering Typology Identified:
1. **Primary Fraud Inflow (Layer 1)**: Initial victim proceeds deposited via IMPS/UPI into 1st-tier mule accounts.
2. **Rapid Fund Splitting (Layer 2)**: Account balances dispersed within 4 minutes into 4-6 secondary regional accounts to circumvent automated bank anti-fraud blocks.
3. **Final Exit (Layer 3)**:
   - Physical cash withdrawals at ATM clusters.
   - P2P crypto gateways converting fiat currency into USDT tokens.

#### Recommended Legal Actions:
- Serve Emergency Section 91 CrPC notices to freeze downstream accounts.
- Request PAN/Aadhaar biometric authentication logs from NPCI/Bank FRM cells.
- Register case under PMLA (Prevention of Money Laundering Act) provisions.`,
      actions: [
        {
          id: 'act_freeze_mules',
          title: 'Draft Multi-Bank Freeze Notice',
          desc: 'Direct HDFC, ICICI, and BOM nodal officers to freeze account trails.',
          priority: 'urgent',
          category: 'banking',
          actionType: 'draft_notice',
          payload: { noticeType: 'bank_freeze' }
        }
      ]
    };
  }

  // 7. Check for Crime Categories (Cyber, Extortion, Narcotics, Murder, Theft)
  if (msg.includes('cyber') || msg.includes('extortion') || msg.includes('narcotics') || msg.includes('drugs') || msg.includes('theft') || msg.includes('murder') || msg.includes('fraud') || msg.includes('phishing')) {
    const matchedCategoryCases = index.cases.filter(c => {
      const summ = (c.incidentSummary || c.incident_summary || '').toLowerCase();
      const sec = (c.sections || '').toLowerCase();
      return summ.includes(msg) || sec.includes(msg);
    });

    return {
      text: `### Crime Category Analysis: ${rawMsg.toUpperCase()}

#### Database Intelligence:
- **Matching Registered FIRs**: ${matchedCategoryCases.length} case dossiers logged in Pune Police records.
- **Primary Legal Framework**: Indian Penal Code / Bharatiya Nyaya Sanhita (BNS) & Information Technology Act.

#### Standard Operating Procedures (SOP):
1. **Evidence Preservation**: Secure digital hashes, server access logs, CCTV footage, and mobile handset physical evidence under Section 63 BSA (Bharatiya Sakshya Adhiniyam).
2. **Cross-Jurisdiction Overlap**: Check for modus operandi matches across neighboring police commissionerates (Pimpri-Chinchwad, Mumbai, Thane).
3. **Syndicate Hierarchy Identification**: Map Kingpin, Technical Handler, Field Operative, and Mule account holders.`,
      actions: matchedCategoryCases.length > 0 ? [
        {
          id: 'act_view_cat_fir',
          title: `Inspect Case Dossier (${matchedCategoryCases[0].firNumber || matchedCategoryCases[0].fir_number})`,
          desc: 'Open primary registered case file.',
          priority: 'high',
          category: 'legal',
          actionType: 'navigate_fir'
        }
      ] : []
    };
  }

  // 8. Specific Entity or Live FIR Match
  if (liveSearchResult && liveSearchResult.found) {
    const syn = liveSearchResult.syndicate;
    return {
      text: `### Intelligence Dossier: ${syn.name}

- **Threat Assessment**: \`${syn.threat}\` (Confidence: ${syn.confidence}%)
- **Syndicate Category**: ${syn.type}
- **Modus Operandi**: ${syn.modusOperandi}

#### Correlated Network Nodes (${syn.nodes.length}):
${syn.nodes.map(n => `- **${n.name}** (${n.role}) [Risk: **${(n.risk || 'MED').toUpperCase()}**] - ${n.link}`).join('\n')}

#### Registered Police FIR Overlaps (${syn.firs.length}):
${syn.firs.map(f => `- **${f.firNo}** (${f.station}) | Sections: *${f.sections}* | Status: ${f.status}`).join('\n')}`,
      actions: syn.actions || []
    };
  }

  // 9. Broad System Summary / Active Overview
  if (msg.includes('all') || msg.includes('overview') || msg.includes('summary') || msg.includes('syndicate') || msg.includes('stats') || msg.includes('help') || msg.includes('what can you do')) {
    return {
      text: `### Netrakshak AI Intelligence Overview

The intelligence engine actively indexes **${index.entities.length} Suspect Entities**, **${index.cases.length} Registered FIRs**, and **${index.syndicates.length} Monitored Syndicates**.

#### Active Syndicates & Threat Ratings:
${index.syndicates.map(s => `- **${s.name}** (\`${s.threat}\` Threat) - ${s.type}`).join('\n')}

#### What You Can Ask Netrakshak AI:
- **Suspect Inquiries**: Inquire about any suspect name, phone number, vehicle plate, or bank account.
- **Procedural Drafting**: Request formal *Section 91 CrPC Bank Freeze Notices* or *Section 41A Summons*.
- **Interrogation Planning**: Get customized cross-examination points based on timeline and cell tower discrepancies.
- **ANPR & CDR Tracking**: Query vehicle routes and cellular tower overlap sectors.`,
      actions: generateTacticalLeads().slice(0, 3)
    };
  }

  // 10. Intelligent Single-Word / Universal Fallback
  return {
    text: `### Intelligence Search & Tactical Assessment for "${rawMsg}"

I searched the live criminal network database for **"${rawMsg}"**. 

#### Investigation Analysis:
- **Status**: No direct matching suspect or FIR record currently filed under this exact identifier.
- **Investigative Recommendation**:
  1. If searching for a suspect, verify aliases, phone numbers, or vehicle registration numbers.
  2. If requesting procedural drafting, specify *"Draft Section 91 CrPC notice"* or *"Draft Section 41A summons"*.
  3. If exploring telecommunications, type *"CDR analysis"* or *"Tower dump"*.

#### Recommended Quick Queries:
- *"Show all active syndicates and threat levels"*
- *"Draft Section 91 CrPC notice for bank freeze"*
- *"Show CDR tower dump analysis"*
- *"ANPR vehicle tracking protocol"*`,
    actions: [
      {
        id: 'act_draft_91_gen',
        title: 'Draft Section 91 CrPC Notice',
        desc: 'Generate formal bank/CDR preservation notice.',
        priority: 'high',
        category: 'banking',
        actionType: 'draft_notice',
        payload: { noticeType: 'bank_freeze' }
      }
    ]
  };
}

/**
 * Generates an executive case intelligence summary
 */
export function generateCaseExecutiveSummary(firIdOrNumber) {
  const index = buildIntelligenceIndex();
  const c = index.cases.find(item => item.firNumber === firIdOrNumber || item.fir_number === firIdOrNumber || item.id === firIdOrNumber) || index.cases[0];

  if (!c) {
    return {
      title: 'Executive Intelligence Summary',
      firNumber: firIdOrNumber || 'FIR-CASE',
      policeStation: 'Cyber Crime Police Station',
      sections: 'IPC 420, 120B',
      accused: 'Unregistered Suspect',
      threatLevel: 'MEDIUM',
      synopsis: 'No case record loaded in current session.',
      recommendedBNSSections: 'BNS Section 318(4) (Cheating)',
      actionChecklist: ['Verify complainant statement', 'Preserve digital evidence']
    };
  }

  const firNum = c.firNumber || c.fir_number || 'FIR-MH-2026-CASE';
  const subj = c.subjectName || c.subject_name || 'Accused Person';
  const station = c.policeStation || c.police_station || 'Cyber Crime Police Station';
  const sections = c.sections || 'IPC 420';
  const summ = c.incidentSummary || c.incident_summary || 'Incident reported under active police investigation.';

  let bnsMapping = 'BNS Section 318(4) (Cheating & Fraud)';
  if (sections.includes('420') && sections.includes('468')) {
    bnsMapping = 'BNS Section 318(4) (Cheating), BNS Section 336(3) (Forgery for purpose of cheating) & IT Act Sec 66D';
  } else if (sections.includes('384') || sections.includes('386')) {
    bnsMapping = 'BNS Section 308(2) & 308(4) (Extortion by putting person in fear of death or grievous hurt)';
  } else if (sections.includes('302')) {
    bnsMapping = 'BNS Section 103(1) (Murder)';
  }

  return {
    title: `Executive Intelligence Summary: ${firNum}`,
    firNumber: firNum,
    policeStation: station,
    sections,
    accused: subj,
    threatLevel: sections.includes('302') || sections.includes('386') || sections.includes('468') ? 'CRITICAL' : 'HIGH',
    synopsis: summ,
    recommendedBNSSections: bnsMapping,
    actionChecklist: [
      `Serve Section 91 CrPC / Section 94 BNSS notice for bank account debit freeze`,
      `Request CDR tower dump for cell site covering incident location (${c.incidentLocation || 'Incident Area'})`,
      `Issue Section 41A CrPC notice of appearance to accused ${subj}`,
      `Update ANPR license plate watchlist for mobility tracking`,
      `Preserve physical and digital chain of custody under Section 63 BSA`
    ]
  };
}

/**
 * Standardized Section 91 CrPC Notice Generator
 */
export function getSection91NoticeText(opts = {}) {
  const bank = opts.bankName || 'The Nodal Officer, Bank of Maharashtra / HDFC Bank / ICICI Bank';
  const acc = opts.accountNo || '50100492817291';
  const fir = opts.firNumber || 'FIR-MH-2026-4821';
  const sec = opts.sections || 'IPC 420, 468, 471 & IT Act 66D';
  const ps = opts.policeStation || 'Cyber Crime Police Station, Pune City';
  const amt = opts.amount || '14,50,000';

  return `OFFICE OF THE INVESTIGATING OFFICER
${ps.toUpperCase()}
NOTICE UNDER SECTION 91 CODE OF CRIMINAL PROCEDURE, 1973 / SECTION 94 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

To:
${bank}
Fraud Risk Management & Law Enforcement Liaising Cell

Subject: Immediate Lien / Debit Freeze & Production of Documents regarding Account No: ${acc}
Reference: Investigation in Case FIR No. ${fir} u/s ${sec}

WHEREAS it has been made to appear to me that an offense of Cyber Fraud / Financial Conspiracy / Extortion has been committed and that the proceeds of crime amounting to INR ${amt} have been routed into Account No: ${acc} maintained with your bank.

THEREFORE, in exercise of powers conferred under Section 91 CrPC (Section 94 BNSS), you are hereby directed to:
1. Immediately place total DEBIT-FREEZE / LIEN on Account No: ${acc} and all linked accounts.
2. Furnish certified Account Opening Form (AOF), KYC dossiers, IP login logs, and complete transaction statements within 24 hours.
3. Prevent dissipation of remaining funds to secondary accounts.

Failure to comply shall attract penal proceedings under Section 175/176 IPC (Section 210/211 BNS).

Given under my hand and seal of the Police Station on ${new Date().toLocaleDateString('en-GB')}.

(Investigating Officer)
${ps}`;
}

/**
 * Standardized Section 41A CrPC Summons Generator
 */
export function getSection41ASummonsText(opts = {}) {
  const name = opts.accusedName || 'Accused Person';
  const fir = opts.firNumber || 'FIR-MH-2026-4821';
  const ps = opts.policeStation || 'Cyber Crime Police Station, Shivajinagar';
  const sec = opts.sections || 'IPC 420, 120B';

  return `OFFICE OF THE INVESTIGATING OFFICER
${ps.toUpperCase()}
NOTICE OF APPEARANCE UNDER SECTION 41A CODE OF CRIMINAL PROCEDURE (CrPC) / SECTION 35(3) BNSS, 2023

To:
Shri / Smt: ${name}

Reference: Case FIR No. ${fir} Registered at ${ps} u/s ${sec}

WHEREAS reasonable suspicion and material evidence exists regarding your involvement in the commission of the cognizable offense registered under the reference FIR.

YOU ARE HEREBY DIRECTED to appear before the undersigned Investigating Officer at ${ps} within 48 hours of receipt of this notice:
1. To render true statement of facts relating to the alleged transactions and communication logs.
2. To produce the mobile handset, SIM cards, and financial records in your possession.
3. To refrain from tampering with evidence or intimidating witnesses.

Take notice that failure to comply with this notice shall constitute grounds for immediate arrest under Section 41A(3) CrPC / Section 35(6) BNSS.

(Investigating Officer)
${ps}`;
}

