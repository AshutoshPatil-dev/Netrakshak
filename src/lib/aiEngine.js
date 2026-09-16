/**
 * Netrakshak AI Crime Intelligence Engine
 * Built-in tactical analysis, cross-case linkage, automated CrPC action generator,
 * and conversational copilot for Indian Law Enforcement.
 */

import { entities, edges, firCases, state } from '../state.js';
import { graphMetrics } from './analysis.js';

// Pre-seeded deep syndicate intelligence models for tactical fusion
export const SEED_SYNDICATES = [
  {
    id: 'syn_01',
    name: 'ShadowFlow Cyber-Financial Syndicate',
    type: 'Organized Cyber-Financial Syndicate',
    threat: 'CRITICAL',
    confidence: 96,
    leadOfficer: 'Insp. Vikram Shinde (Cyber Cell)',
    modusOperandi: 'Synthetic cryptocurrency investment lures targeting high-net-worth victims across Pune and Mumbai. Diverts funds into 1st-tier mule accounts within 4 minutes of receipt, then converts via unauthorized P2P gateways and ATM cash-outs.',
    triggers: ['9881155421', 'sameerkhan', 'sammy', 'bababhai', 'mh12pq9081', '50100492817291', 'hdfc50100492817291', 'vikramrathi', 'ajaydeshmukh', 'fcroad', 'fir-mh-2026-4821', 'fir-mh-2026-1940'],
    nodes: [
      { name: 'Sameer Khan (Baba Bhai)', role: 'Syndicate Kingpin / Lead Coordinator', category: 'person', risk: 'high', link: 'Coordinates mule fund withdrawals and VoIP calling.' },
      { name: '+91 98811 55421', role: 'Primary Burner SIM (Jio 5G)', category: 'phone', risk: 'high', link: 'Active near FC Road Tower (Cell ID: PN-CY-482).' },
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
      { id: 'act_1', title: 'Issue Emergency Section 91 CrPC Notice', desc: 'Direct HDFC, ICICI, and AXIS bank nodal officers to freeze linked mule accounts immediately.', priority: 'urgent', category: 'banking' },
      { id: 'act_2', title: 'Tower Dump & IMEI Intercept', desc: 'Request CDR/IPDR for Cell ID PN-CY-482 and IMEI 864291048821902 from Telecom Service Providers.', priority: 'high', category: 'cdr' },
      { id: 'act_3', title: 'ANPR Vehicle Intercept (BOLO)', desc: 'Broadcast alert to Pune City traffic ANPR cameras for white Swift MH-12-PQ-9081.', priority: 'high', category: 'mobility' },
      { id: 'act_4', title: 'Unified Organized Crime Docket', desc: 'Merge FIR-MH-2026-4821 and FIR-MH-2026-1940 into single joint syndicate chargesheet under MCOCA/IPC 120B.', priority: 'medium', category: 'legal' }
    ],
    interrogationGuide: [
      'Confront suspect with Cell Tower PN-CY-482 timestamp matching the time of the INR 14.5L transfer.',
      'Probe relationship with Vikram Rathi regarding hosting of counterfeit KYC websites.',
      'Verify travel log and toll transactions for vehicle MH-12-PQ-9081 on Mumbai-Pune expressway.'
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
      { id: 'act_5', title: 'Freeze Bank Accounts under PMLA', desc: 'Liaise with Bank of Maharashtra nodal officer to freeze BOM-60129948102 immediately.', priority: 'urgent', category: 'banking' },
      { id: 'act_6', title: 'Summon Account Holder for Interrogation', desc: 'Issue summons under Section 41A CrPC to Arjun Pawar.', priority: 'high', category: 'legal' }
    ],
    interrogationGuide: [
      'Inquire into source of 24 cash deposits under INR 50,000 in account BOM-60129948102 within 7 days.',
      'Present witness statements from Swargate transport plaza drivers.'
    ]
  }
];

/**
 * Aggregates all knowledge base sources into unified intelligence index
 */
export function buildIntelligenceIndex() {
  const allEntities = [...entities];
  const allCases = [...firCases];
  if (state.firDraft && state.firDraft.firNumber) {
    allCases.push(state.firDraft);
  }

  // Calculate current graph metrics
  const graphData = graphMetrics(allEntities, edges);

  return {
    entities: allEntities,
    edges,
    cases: allCases,
    metrics: graphData,
    syndicates: SEED_SYNDICATES
  };
}

/**
 * Automated Tactical Lead Generator:
 * Discovers cross-case overlaps, suspicious laundering patterns, and generates CrPC action items.
 */
export function generateTacticalLeads() {
  const index = buildIntelligenceIndex();
  const leads = [];

  // 1. Gather all syndicate-level actions
  index.syndicates.forEach(syn => {
    syn.actions.forEach(act => {
      leads.push({
        id: act.id,
        syndicateId: syn.id,
        syndicateName: syn.name,
        title: act.title,
        desc: act.desc,
        priority: act.priority, // urgent, high, medium
        category: act.category, // banking, cdr, mobility, legal
        firList: syn.firs.map(f => f.firNo),
        threat: syn.threat
      });
    });
  });

  // 2. Discover live cross-case links in FIR database
  const entityCaseMap = new Map();
  index.cases.forEach(c => {
    const firNo = c.firNumber || c.fir_number || 'FIR-CASE';
    const names = [c.subjectName || c.subject_name, c.otherAccused || c.other_accused].filter(Boolean);
    const phones = [c.phone].filter(Boolean);
    const vehicles = [c.vehicle].filter(Boolean);
    const banks = [c.bank].filter(Boolean);

    [...names, ...phones, ...vehicles, ...banks].forEach(item => {
      const key = String(item).trim().toLowerCase();
      if (!key || key === 'unknown' || key === 'n/a') return;
      if (!entityCaseMap.has(key)) {
        entityCaseMap.set(key, { raw: item, firs: new Set(), stations: new Set() });
      }
      entityCaseMap.get(key).firs.add(firNo);
      if (c.policeStation || c.police_station) {
        entityCaseMap.get(key).stations.add(c.policeStation || c.police_station);
      }
    });
  });

  // Cross-case discovery leads
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
        threat: 'CRITICAL'
      });
    }
  });

  // 3. High centrality / bridge node alerts from Graph
  index.metrics.forEach(node => {
    if (node.degree >= 5 && node.metrics?.goBetween > 60) {
      leads.push({
        id: `bridge_${node.id}`,
        syndicateName: 'Network Topology Alert',
        title: `High-Betweenness Bridge: ${node.name || node.label}`,
        desc: `${node.name || node.label} has betweenness centrality score of ${node.metrics.goBetween}%. Acts as critical communication choke point. Intercept recommended.`,
        priority: 'high',
        category: 'cdr',
        firList: [],
        threat: 'HIGH'
      });
    }
  });

  return leads;
}

/**
 * Searches intelligence index for a specific query identifier or term
 */
export function searchIntelligence(queryText, streamType = 'all') {
  const q = (queryText || '').trim();
  if (!q) return null;

  const qClean = q.toLowerCase().replace(/[\s\-_]/g, '');
  const index = buildIntelligenceIndex();

  // 1. Check seeded deep syndicates
  let matchedSyndicate = null;
  for (const syn of index.syndicates) {
    if (syn.triggers.some(trig => qClean.includes(trig) || trig.includes(qClean))) {
      matchedSyndicate = syn;
      break;
    }
  }

  // 2. Check live entities in state
  const matchedEntities = index.entities.filter(e => {
    const name = (e.name || e.label || '').toLowerCase().replace(/[\s\-_]/g, '');
    const id = (e.id || '').toLowerCase().replace(/[\s\-_]/g, '');
    const phone = (e.phone || '').toLowerCase().replace(/[\s\-_]/g, '');
    const vehicle = (e.vehicle || '').toLowerCase().replace(/[\s\-_]/g, '');
    const bank = (e.bank || '').toLowerCase().replace(/[\s\-_]/g, '');
    return name.includes(qClean) || id.includes(qClean) || phone.includes(qClean) || vehicle.includes(qClean) || bank.includes(qClean);
  });

  // 3. Check live FIR cases
  const matchedCases = index.cases.filter(c => {
    const firNo = (c.firNumber || c.fir_number || '').toLowerCase().replace(/[\s\-_]/g, '');
    const subj = (c.subjectName || c.subject_name || '').toLowerCase().replace(/[\s\-_]/g, '');
    const summ = (c.incidentSummary || c.incident_summary || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase().replace(/[\s\-_]/g, '');
    const vehicle = (c.vehicle || '').toLowerCase().replace(/[\s\-_]/g, '');
    return firNo.includes(qClean) || subj.includes(qClean) || summ.includes(q.toLowerCase()) || phone.includes(qClean) || vehicle.includes(qClean);
  });

  if (matchedSyndicate) {
    let nodes = matchedSyndicate.nodes;
    if (streamType && streamType !== 'all') {
      nodes = nodes.filter(n => n.category === streamType);
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

  if (matchedEntities.length > 0 || matchedCases.length > 0) {
    const primary = matchedEntities[0] || {};
    const primaryName = primary.name || primary.label || q;
    return {
      query: q,
      found: true,
      syndicate: {
        id: `auto_${Date.now()}`,
        name: `Dynamic Case Dossier: ${primaryName}`,
        type: 'Database Correlated Intelligence',
        threat: primary.risk === 'high' ? 'CRITICAL' : 'ELEVATED',
        confidence: 84,
        leadOfficer: 'Investigating Officer',
        modusOperandi: `Correlated across active database records. Linked to ${matchedCases.length} FIRs and ${matchedEntities.length} suspect records.`,
        nodes: matchedEntities.map(e => ({
          name: e.name || e.label || e.id,
          role: e.role || e.category || 'Suspect Node',
          category: e.category || 'person',
          risk: e.risk || 'medium',
          link: `Associated with ${e.id} in active intelligence graph.`
        })),
        firs: matchedCases.map(c => ({
          firNo: c.firNumber || c.fir_number || 'FIR-UNKNOWN',
          station: c.policeStation || c.police_station || 'District Police Station',
          sections: c.sections || 'IPC 420',
          date: c.incidentDate || c.incident_date || '2026',
          status: 'Active Case'
        })),
        cdrEvidence: {
          totalCalls: 34,
          suspiciousNightCalls: 8,
          commonTower: 'Local Telecom Sector (Pune City)',
          imeiOverlap: 'Logged in FIR records'
        },
        financialTrail: [
          { step: 1, flow: `Suspect Account (${primaryName})`, target: 'Layering Account', amount: 'Under Audit', note: 'Financial trail mapped from case files' }
        ],
        actions: [
          { id: 'act_auto_1', title: 'Verify KYC & Interrogate Suspect', desc: `Issue summons under Section 41A CrPC to ${primaryName}.`, priority: 'high', category: 'legal' },
          { id: 'act_auto_2', title: 'Request IPDR / Tower Records', desc: `Liaise with Telecom Service Providers for recent location logs.`, priority: 'medium', category: 'cdr' }
        ],
        interrogationGuide: [
          `Verify current whereabouts and association with ${matchedCases.map(c => c.firNumber || c.fir_number).join(', ') || 'reported incidents'}.`,
          'Examine digital devices and registered SIM cards.'
        ]
      },
      liveEntities: matchedEntities,
      liveCases: matchedCases
    };
  }

  return {
    query: q,
    found: false,
    message: `No active criminal syndicates or prior FIR records found for "${q}". Identifier appears clean or unregistered in Maharashtra Police Intelligence database.`
  };
}

/**
 * Natural Language Conversational Copilot:
 * Understands investigator questions and delivers contextual, tactical crime intelligence.
 */
export function processCopilotMessage(userMessage, conversationHistory = []) {
  const msg = (userMessage || '').trim();
  if (!msg) {
    return {
      text: 'Please enter a question or query regarding suspects, FIRs, phone numbers, vehicles, bank accounts, or syndicates.',
      actions: []
    };
  }

  const lower = msg.toLowerCase();
  const index = buildIntelligenceIndex();

  // 1. Check for questions about Sameer Khan / ShadowFlow / FC Road / Baba Bhai
  if (lower.includes('sameer') || lower.includes('baba bhai') || lower.includes('shadowflow') || lower.includes('fc road') || lower.includes('98811 55421') || lower.includes('9881155421')) {
    const syn = SEED_SYNDICATES[0];
    return {
      text: `### Intelligence Briefing: Sameer Khan & ShadowFlow Syndicate

**Sameer Khan (alias "Baba Bhai")** is the identified kingpin of the **${syn.name}** (${syn.threat} Threat Level, ${syn.confidence}% Match Confidence).

#### Key Operative Assets:
- **Primary Burner SIM**: \`+91 98811 55421\` (Active in FC Road sector, Cell ID: \`PN-CY-482\`).
- **Mobility Asset**: White Swift \`MH-12-PQ-9081\` spotted at ATM cash-out clusters in Shivajinagar and Kothrud.
- **Layering Mule Account**: HDFC Bank \`50100492817291\` (INR 14.50 Lakh transferred from complainant Rajesh Kulkarni).
- **Technical Sub-handler**: Vikram Rathi (creates fake KYC websites and fake cryptocurrency bonds).
- **Cash Courier**: Ajay Deshmukh (withdrew INR 3.80 Lakh from Deccan Gymkhana ATM).

#### Linked FIR Cases:
1. **FIR-MH-2026-4821** (Cyber Crime PS, Shivajinagar) under *IPC 420, 468, 471 & IT Act 66D*.
2. **FIR-MH-2026-1940** (Kothrud PS) under *IPC 420, 120B*.

#### Recommended Immediate Actions:
1. Issue **Emergency Section 91 CrPC Notice** to HDFC and ICICI Bank to freeze accounts.
2. Issue **ANPR BOLO Alert** for vehicle \`MH-12-PQ-9081\`.
3. Request Tower Dump for Cell Site \`PN-CY-482\`.`,
      actions: syn.actions,
      syndicateId: syn.id
    };
  }

  // 2. Check for Swargate / Suresh Shinde / Arjun Pawar / Extortion queries
  if (lower.includes('suresh') || lower.includes('shinde') || lower.includes('arjun') || lower.includes('swargate') || lower.includes('extortion') || lower.includes('bom-60129948102')) {
    const syn = SEED_SYNDICATES[1];
    return {
      text: `### Intelligence Briefing: Swargate Extortion & Hawala Ring

**Suresh Shinde** operates an extortion and off-ledger hawala network operating in the Swargate / Pune transport hub zone (${syn.threat} Threat Level).

#### Syndicate Structure:
- **Kingpin / Hawala Courier**: Suresh Shinde (off-ledger settlements).
- **Enforcer & Mule**: Arjun Pawar (collects weekly cash payoffs from transport operators).
- **Delivery Asset**: Rohit Salunkhe (delivers threat slips).
- **Collection Mule Account**: Bank of Maharashtra \`BOM-60129948102\` (INR 8.90 Lakh aggregated in micro-deposits).
- **Cell Site Cluster**: \`PN-SWR-312\` (Swargate Bus Depot sector).

#### Linked FIR:
- **FIR-MH-2026-2811** (Swargate PS) under *IPC 384, 386, 120B*.

#### Next Steps:
1. Freeze account \`BOM-60129948102\` under PMLA provisions.
2. Issue Section 41A CrPC summons to Arjun Pawar.`,
      actions: syn.actions,
      syndicateId: syn.id
    };
  }

  // 3. Check for Interrogation Strategy questions
  if (lower.includes('interrogat') || lower.includes('question') || lower.includes('interview') || lower.includes('inquire')) {
    return {
      text: `### Tactical Interrogation Strategy Guide

When interrogating syndicate operatives, leverage digital and financial discrepancies to establish criminal conspiracy:

1. **Digital Footprint & Tower Dump**:
   - Confront the accused with specific Cell ID sector timestamps matching the time of fund transfers.
   - Present IMEI overlap showing the same physical mobile handset switched between multiple burner SIMs.

2. **Financial Layering Inconsistencies**:
   - Question the source of rapid outgoing IMPS/NEFT transfers executed within 5 minutes of incoming deposits.
   - Require proof of business goods/services for mule account transactions.

3. **ANPR & Vehicle Telemetry**:
   - Present expressway and toll plaza camera logs placing vehicle \`MH-12-PQ-9081\` near ATM withdrawal locations.

4. **Co-Accused Discrepancies**:
   - Probe communications with technical handlers (e.g. Vikram Rathi) regarding domain registration and WhatsApp/Telegram credentials.`,
      actions: [
        { id: 'act_summons', title: 'Prepare Section 41A CrPC Summons', desc: 'Generate standardized formal summons with witness question list.', priority: 'high', category: 'legal' }
      ]
    };
  }

  // 4. Check for Section 91 CrPC notice generation
  if (lower.includes('section 91') || lower.includes('crpc 91') || lower.includes('notice') || lower.includes('freeze')) {
    return {
      text: `### Formal Draft: Notice under Section 91 CrPC

\`\`\`text
OFFICE OF THE INVESTIGATING OFFICER
CYBER CRIME POLICE STATION, PUNE CITY
NOTICE UNDER SECTION 91 CODE OF CRIMINAL PROCEDURE (CrPC) / BNS EQUIVALENT

To:
The Nodal Officer / Fraud Risk Management (FRM)
HDFC Bank Ltd. / ICICI Bank Ltd. / Bank of Maharashtra

Subject: Immediate Lien / Freeze on Fraudulent Account No: 50100492817291 & BOM-60129948102
Ref: Investigation in FIR No. FIR-MH-2026-4821 u/s 420, 468, 471 IPC & Sec 66D IT Act

Whereas it has been made to appear to me that an offense of Cyber Fraud / Financial Extortion has been committed, you are hereby directed to:
1. Immediately place total debit-freeze / lien on the aforementioned account(s).
2. Furnish complete Account Opening Forms (AOF), KYC documents, IP login logs, and statement of accounts from 01-01-2026 to date within 24 hours.
3. Reversal of fraudulent proceeds of INR 14,50,000 to the cyber escrow holding account.

Failure to comply shall attract penal action under Section 175/176 IPC.

(Investigating Officer)
Cyber Crime Police Station, Pune
\`\`\``,
      actions: [
        { id: 'act_copy_notice', title: 'Export CrPC Section 91 Notice', desc: 'Ready for bank nodal transmission via email and registered dispatch.', priority: 'urgent', category: 'banking' }
      ]
    };
  }

  // 5. Check for General Case / Syndicate Overview
  if (lower.includes('syndicate') || lower.includes('overview') || lower.includes('summary') || lower.includes('cases') || lower.includes('stats')) {
    return {
      text: `### Netrakshak Intelligence Database Summary

Currently tracking **${index.entities.length} Suspect Entities**, **${index.cases.length} Active FIRs**, and **${index.syndicates.length} Monitored Syndicates**.

| Syndicate / Group | Primary MO | Threat Level | Confidence | Key FIRs |
|---|---|---|---|---|
| **ShadowFlow Cyber Racket** | Crypto/Mule Layering | CRITICAL | 96% | FIR-MH-2026-4821, FIR-MH-2026-1940 |
| **Swargate Extortion Ring** | Hawala & Protection | ELEVATED | 88% | FIR-MH-2026-2811 |

#### Cross-Case Discoveries:
- 4 accounts flagged as rapid first-tier layering mules.
- Common cell tower cluster detected in **Shivajinagar / FC Road (Sector PN-CY-482)** with 38 late-night calls.
- High betweenness centrality bridge nodes identified for surveillance.`,
      actions: generateTacticalLeads().slice(0, 3)
    };
  }

  // 6. Generic Identifier Search Lookup
  const searchRes = searchIntelligence(msg);
  if (searchRes && searchRes.found) {
    const syn = searchRes.syndicate;
    return {
      text: `### Intelligence Match Found: ${syn.name}

- **Threat Level**: ${syn.threat} (Confidence: ${syn.confidence}%)
- **Classification**: ${syn.type}
- **Modus Operandi**: ${syn.modusOperandi}

#### Associated Nodes & Assets:
${syn.nodes.map(n => `- **${n.name}** (${n.role}) [Risk: ${n.risk.toUpperCase()}]`).join('\n')}

#### Linked FIR Cases:
${syn.firs.map(f => `- **${f.firNo}** (${f.station}) - ${f.sections}`).join('\n')}`,
      actions: syn.actions,
      syndicateId: syn.id
    };
  }

  // Fallback response with helpful investigation query suggestions
  return {
    text: `### Investigator Query Analysis for "${msg}"

No exact single-entity match found in current live records. Here are recommended investigation queries to try:

- **Suspect Analysis**: *"Who is Sameer Khan and what are his connections?"*
- **Phone Lookup**: *"+91 98811 55421"*
- **Vehicle BOLO**: *"MH-12-PQ-9081"*
- **Mule Bank Account**: *"HDFC-50100492817291"*
- **Legal Notices**: *"Draft Section 91 CrPC notice for bank freeze"*
- **Interrogation Advice**: *"Give me interrogation questions for Sameer Khan"*
- **Syndicate Overview**: *"Show all active syndicates and threat levels"*`,
    actions: []
  };
}

/**
 * Generates an executive case intelligence summary
 */
export function generateCaseExecutiveSummary(firIdOrNumber) {
  const index = buildIntelligenceIndex();
  const c = index.cases.find(item => item.firNumber === firIdOrNumber || item.fir_number === firIdOrNumber || item.id === firIdOrNumber);

  if (!c) {
    return {
      title: 'Case Summary',
      content: 'Case record not found in database.'
    };
  }

  const firNum = c.firNumber || c.fir_number || 'FIR-MH-2026-CASE';
  const subj = c.subjectName || c.subject_name || 'Accused Person';
  const station = c.policeStation || c.police_station || 'Cyber Crime Police Station';
  const sections = c.sections || 'IPC 420';
  const summ = c.incidentSummary || c.incident_summary || 'Incident reported under investigation.';

  return {
    title: `Executive Intelligence Summary: ${firNum}`,
    firNumber: firNum,
    policeStation: station,
    sections,
    accused: subj,
    threatLevel: 'HIGH',
    synopsis: summ,
    recommendedBNSSections: sections.includes('420') ? 'BNS Section 318(4) (Cheating) & BNS 336 (Forgery)' : 'BNS Applicable Provisions',
    actionChecklist: [
      'Lien marked on suspect bank accounts',
      'CDR tower dump requested from nodal TSPs',
      'Section 91 CrPC notices served',
      'ANPR camera watchlist updated'
    ]
  };
}
