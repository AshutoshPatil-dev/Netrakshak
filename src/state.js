import { supabase, supabaseConfigured } from './lib/supabase.js';
import { hashText } from './lib/crypto.js';

let renderCallback = null;

export function registerRender(cb) {
  renderCallback = cb;
}

export function notifyStateChange() {
  if (typeof renderCallback === 'function') {
    renderCallback();
  }
}

export function loadSavedOfficers() {
  try {
    const raw = localStorage.getItem('netrakshak_officers');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function loadSavedAuditLogs() {
  try {
    const raw = localStorage.getItem('netrakshak_audit_logs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export const DEFAULT_ENTITIES = [
  // Persons
  {
    id: 'ent_sameer',
    name: 'Sameer Khan',
    local: 'Baba Bhai, Sammy',
    type: 'Person',
    category: 'person',
    role: 'Syndicate Kingpin / Caller',
    risk: 'high',
    city: 'Pune City (Shivajinagar)',
    phone: '+91 98811 55421',
    identifiers: { alias: 'Baba Bhai, Sammy', aadhar: 'XXXX-XXXX-4912', status: 'Accused in 2 FIRs' },
    events: 4,
    recent: 92,
    x: 350,
    y: 260
  },
  {
    id: 'ent_vikram',
    name: 'Vikram Rathi',
    local: 'Vicky',
    type: 'Person',
    category: 'person',
    role: 'Technical Mule Manager',
    risk: 'high',
    city: 'Mumbai / Pune',
    phone: '+91 98199 44312',
    identifiers: { alias: 'Vicky', role: 'Forged bond creator' },
    events: 3,
    recent: 84,
    x: 480,
    y: 190
  },
  {
    id: 'ent_ajay',
    name: 'Ajay Deshmukh',
    local: 'Ajju',
    type: 'Person',
    category: 'person',
    role: 'Cash Courier / ATM Mule',
    risk: 'medium',
    city: 'Pune (Deccan)',
    phone: '+91 97655 88910',
    identifiers: { role: 'Cash withdrawal handler' },
    events: 2,
    recent: 76,
    x: 490,
    y: 350
  },
  {
    id: 'ent_arjun',
    name: 'Arjun Pawar',
    local: 'Pawar',
    type: 'Person',
    category: 'person',
    role: 'Mule Account Recruiter',
    risk: 'medium',
    city: 'Pune (Swargate)',
    phone: '+91 99230 44102',
    identifiers: { role: 'Student bank account recruiter' },
    events: 3,
    recent: 70,
    x: 180,
    y: 380
  },
  {
    id: 'ent_suresh',
    name: 'Suresh Shinde',
    local: 'Shinde Seth',
    type: 'Person',
    category: 'person',
    role: 'Hawala Operator',
    risk: 'high',
    city: 'Pune (Camp)',
    phone: '+91 98224 55119',
    identifiers: { role: 'Off-ledger settlement' },
    events: 2,
    recent: 65,
    x: 120,
    y: 280
  },
  {
    id: 'ent_rajesh',
    name: 'Rajesh Kulkarni',
    local: 'Complainant',
    type: 'Person',
    category: 'person',
    role: 'Complainant / Victim',
    risk: 'low',
    city: 'Pune (Kothrud)',
    phone: '+91 98220 11984',
    identifiers: { role: 'Defrauded investor (INR 14.5L)' },
    events: 1,
    recent: 40,
    x: 520,
    y: 450
  },

  // Phones / SIMs
  {
    id: 'ent_phone1',
    name: '+91 98811 55421',
    local: 'Burner SIM (Jio 5G)',
    type: 'Phone',
    category: 'phone',
    role: 'Primary Suspect Burner Phone',
    risk: 'high',
    city: 'Shivajinagar Tower Sector',
    phone: '+91 98811 55421',
    identifiers: { imei: '864291048821902', carrier: 'Reliance Jio 5G', activeLocation: 'FC Road Commercial Sector' },
    events: 142,
    recent: 98,
    x: 270,
    y: 190
  },
  {
    id: 'ent_phone2',
    name: '+91 98220 11984',
    local: 'Complainant Contact',
    type: 'Phone',
    category: 'phone',
    role: 'Victim Registered Mobile',
    risk: 'low',
    city: 'Kothrud Sector',
    phone: '+91 98220 11984',
    identifiers: { carrier: 'Airtel Postpaid' },
    events: 12,
    recent: 30,
    x: 430,
    y: 470
  },

  // Vehicles
  {
    id: 'ent_veh1',
    name: 'MH-12-PQ-9081',
    local: 'White Swift',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Suspect Mobility / Logistics Asset',
    risk: 'medium',
    city: 'Pune City',
    identifiers: { make: 'Maruti Suzuki Swift', color: 'Pearl White', chasis: 'MA3EW2S00G128914', anprHits: '6 ATM cash-out clusters' },
    events: 6,
    recent: 88,
    x: 390,
    y: 380
  },
  {
    id: 'ent_veh2',
    name: 'MH-14-AB-3390',
    local: 'Black Pulsar 150',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Cash Courier Motorbike',
    risk: 'medium',
    city: 'Swargate / Camp',
    identifiers: { make: 'Bajaj Pulsar', color: 'Black', regDistrict: 'Pimpri-Chinchwad' },
    events: 3,
    recent: 60,
    x: 140,
    y: 440
  },

  // Bank & Mule Accounts
  {
    id: 'ent_bank1',
    name: 'HDFC-50100492817291',
    local: 'Primary Mule Account',
    type: 'Bank',
    category: 'bank',
    role: 'Layering Mule Account (INR 14.50L)',
    risk: 'high',
    city: 'Shivajinagar Branch',
    identifiers: { bankName: 'HDFC Bank', ifsc: 'HDFC0000052', status: 'Freeze Recommended under PMLA' },
    events: 6,
    recent: 95,
    x: 440,
    y: 280
  },
  {
    id: 'ent_bank2',
    name: 'ICICI-0021948102',
    local: 'Split Mule Account',
    type: 'Bank',
    category: 'bank',
    role: 'Split Layering Account (INR 6.50L)',
    risk: 'high',
    city: 'Deccan Gymkhana Branch',
    identifiers: { bankName: 'ICICI Bank', ifsc: 'ICIC0000021', status: 'Flagged for Intercept' },
    events: 4,
    recent: 85,
    x: 560,
    y: 280
  },
  {
    id: 'ent_bank3',
    name: 'Account •• 9130',
    local: 'Mule Aggregator',
    type: 'Bank',
    category: 'bank',
    role: 'Hawala Mule Pool (INR 22.40L)',
    risk: 'high',
    city: 'Swargate Branch',
    identifiers: { turnover: '> 40 UPI transactions/day', handler: 'Arjun Pawar' },
    events: 48,
    recent: 78,
    x: 190,
    y: 270
  },

  // FIR Cases
  {
    id: 'ent_fir1',
    name: 'FIR-MH-2026-4821',
    local: 'Cyber Crime PS Case',
    type: 'FIR Case',
    category: 'fir',
    role: 'Registered FIR Dossier',
    risk: 'high',
    city: 'Cyber Crime PS, Shivajinagar',
    identifiers: { sections: 'IPC 420, 468, 471, IT Act 66D', date: '2026-08-14', defraudedAmount: 'INR 14,50,000' },
    events: 8,
    recent: 96,
    x: 340,
    y: 110
  },
  {
    id: 'ent_fir2',
    name: 'FIR-MH-2026-1940',
    local: 'Kothrud Case',
    type: 'FIR Case',
    category: 'fir',
    role: 'Linked Cross-Case Dossier',
    risk: 'medium',
    city: 'Kothrud Police Station',
    identifiers: { sections: 'IPC 420, 120B', date: '2026-07-22' },
    events: 4,
    recent: 70,
    x: 580,
    y: 380
  },

  // Location / Cell Towers
  {
    id: 'ent_tower1',
    name: 'Cell Tower PN-CY-482',
    local: 'FC Road Sector',
    type: 'Location',
    category: 'location',
    role: 'Triangulated Telecom Cell Tower',
    risk: 'low',
    city: 'FC Road Commercial Complex, Pune',
    identifiers: { cellId: 'PN-CY-482', latLong: '18.5283° N, 73.8428° E', callersIdentified: 142 },
    events: 142,
    recent: 90,
    x: 240,
    y: 100
  }
];

export const DEFAULT_EDGES = [
  ['ent_sameer', 'ent_phone1', 'Primary SIM User'],
  ['ent_sameer', 'ent_veh1', 'Registered Driver / User'],
  ['ent_sameer', 'ent_bank1', 'Controls Mule Transfers'],
  ['ent_sameer', 'ent_fir1', 'Named Primary Accused'],
  ['ent_sameer', 'ent_vikram', 'Co-Conspirator (Technical)'],
  ['ent_sameer', 'ent_ajay', 'Cash Withdrawal Handler'],
  ['ent_vikram', 'ent_fir1', 'Co-Accused in Case'],
  ['ent_ajay', 'ent_veh1', 'ATM Cash-Out Courier'],
  ['ent_ajay', 'ent_bank2', 'Withdrew INR 3.8L via ATM'],
  ['ent_phone1', 'ent_tower1', 'Triangulated Tower Link'],
  ['ent_rajesh', 'ent_fir1', 'Complainant / Informant'],
  ['ent_rajesh', 'ent_phone2', 'Complainant Mobile'],
  ['ent_rajesh', 'ent_bank1', 'Transferred INR 14.5L'],
  ['ent_bank1', 'ent_bank2', 'Split Layering Transfer (INR 6.5L)'],
  ['ent_sameer', 'ent_fir2', 'Linked Accused in Cross-Case'],
  ['ent_arjun', 'ent_bank3', 'Mule Recruiter & Handler'],
  ['ent_arjun', 'ent_veh2', 'Courier Motorbike'],
  ['ent_suresh', 'ent_bank3', 'Hawala Settlement Channel']
];

export let entities = [...DEFAULT_ENTITIES];
export function setEntities(val) {
  entities = val;
}

export let edges = [...DEFAULT_EDGES];
export function setEdges(val) {
  edges = val;
}

export let firCases = [];
export function setFirCases(val) {
  firCases = val;
}

export const riskColor = { high: '#DC2626', medium: '#F59E0B', low: '#16A34A' };

export const state = {
  authChecking: true,
  locale: localStorage.getItem('locale') || 'en',
  loggedIn: false,
  view: 'overview',
  query: '',
  sort: 'risk',
  type: 'all',
  selected: null,
  file: null,
  fileHash: '',
  filePath: '',
  graphFullscreen: false,
  sidebarCollapsed: false,
  fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
  firMode: 'upload',
  manualEvidence: [],
  officers: loadSavedOfficers(),
  editingOfficerId: null,
  officerFormRole: 'case-officer',
  auditLogs: loadSavedAuditLogs(),
  auditLevelFilter: 'all',
  auditSearchQuery: '',
  auditActorFilter: 'all',
  auditActionFilter: 'all',
  loginError: '',
  loginEmail: '',
  previewModalFile: null,
  profileEntityId: null,
  profileHistory: [],
  previousViewBeforeProfile: 'network',
  graphSideTab: 'dossier',
  directorySearchQuery: '',
  directoryCategoryFilter: 'all',
  graphExploration: {
    active: false, // false shows the full launchpad selection menu
    mode: 'focused', // 'focused' or 'all'
    seedId: null,
    previousSeedId: null,
    previousMode: 'focused',
    expandedNodeIds: []
  }
};

export function openEntityProfile(entityId) {
  if (state.view !== 'entity_profile') {
    state.previousViewBeforeProfile = state.view || 'network';
    state.profileHistory = [];
  } else if (state.profileEntityId && state.profileEntityId !== entityId) {
    state.profileHistory.push(state.profileEntityId);
  }
  state.profileEntityId = entityId;
  state.selected = entityId;
  state.view = 'entity_profile';
  notifyStateChange();
}

export function backEntityProfile() {
  if (state.profileHistory.length > 0) {
    const previousId = state.profileHistory.pop();
    state.profileEntityId = previousId;
    state.selected = previousId;
    notifyStateChange();
  } else {
    state.view = state.previousViewBeforeProfile || 'network';
    state.profileEntityId = null;
    notifyStateChange();
  }
}

export function getVisibleGraphNodeIds() {
  if (!state.graphExploration.active) {
    return new Set();
  }
  if (state.graphExploration.mode === 'all') {
    return new Set(entities.map(e => e.id));
  }
  const visible = new Set(state.graphExploration.expandedNodeIds || []);
  if (state.graphExploration.seedId) {
    visible.add(state.graphExploration.seedId);
  }
  // Include direct 1-hop neighbors of any expanded node
  (state.graphExploration.expandedNodeIds || []).forEach(nodeId => {
    edges.forEach(edge => {
      if (edge[0] === nodeId) visible.add(edge[1]);
      if (edge[1] === nodeId) visible.add(edge[0]);
    });
  });
  return visible;
}

export function startGraphInvestigation(seedId) {
  state.graphExploration.active = true;
  state.graphExploration.mode = 'focused';
  state.graphExploration.seedId = seedId;
  state.graphExploration.expandedNodeIds = [seedId];
  state.selected = seedId;
  notifyStateChange();
}

export function returnToGraphLaunchpad() {
  state.graphExploration.active = false;
  state.graphExploration.seedId = null;
  state.graphExploration.expandedNodeIds = [];
  state.selected = null;
  notifyStateChange();
}

export function expandGraphNode(nodeId) {
  if (!state.graphExploration.expandedNodeIds.includes(nodeId)) {
    state.graphExploration.expandedNodeIds.push(nodeId);
    state.graphExploration.active = true;
    state.graphExploration.mode = 'focused';
    notifyStateChange();
  }
}

export function collapseGraphNode(nodeId) {
  state.graphExploration.expandedNodeIds = state.graphExploration.expandedNodeIds.filter(id => id !== nodeId);
  if (state.graphExploration.expandedNodeIds.length === 0) {
    state.graphExploration.expandedNodeIds = [state.graphExploration.seedId].filter(Boolean);
  }
  notifyStateChange();
}

export function setGraphSeed(seedId) {
  if (state.graphExploration.seedId !== seedId) {
    state.graphExploration.previousSeedId = state.graphExploration.seedId;
    state.graphExploration.previousMode = state.graphExploration.mode;
  }
  startGraphInvestigation(seedId);
}

export function toggleGraphSeed(seedId) {
  // If this entity is already the active focal seed, toggle it OFF!
  const isCurrentlySeed = state.graphExploration.active &&
    state.graphExploration.seedId === seedId &&
    state.graphExploration.mode === 'focused';

  if (isCurrentlySeed) {
    const prevSeed = state.graphExploration.previousSeedId;
    const prevMode = state.graphExploration.previousMode;

    if (prevSeed && prevSeed !== seedId) {
      state.graphExploration.previousSeedId = null;
      startGraphInvestigation(prevSeed);
    } else if (prevMode === 'all') {
      showFullGraphUniverse();
    } else {
      showFullGraphUniverse();
    }
  } else {
    // Turning it ON: remember current state before setting
    state.graphExploration.previousSeedId = state.graphExploration.seedId;
    state.graphExploration.previousMode = state.graphExploration.mode;
    startGraphInvestigation(seedId);
  }
}

export function resetGraphExploration() {
  const seed = state.graphExploration.seedId;
  state.customNodePositions = {};
  if (seed) {
    state.graphExploration.active = true;
    state.graphExploration.expandedNodeIds = [seed];
    state.graphExploration.mode = 'focused';
    state.selected = seed;
  } else {
    state.graphExploration.active = false;
  }
  notifyStateChange();
}

export function showFullGraphUniverse() {
  state.graphExploration.active = true;
  state.graphExploration.mode = 'all';
  if (!state.selected && entities.length > 0) {
    state.selected = entities[0].id;
  }
  notifyStateChange();
}

export function getActiveOfficer() {
  const you = state.officers.find(o => o.isYou);
  if (you) {
    const initials = (you.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'OF';
    return {
      id: you.id,
      name: you.name,
      initials,
      role: `${you.rank || 'Officer'} · ${you.district || 'Command'}`,
      rawRole: you.role || 'case-officer',
      isAdmin: you.role === 'admin'
    };
  }
  return {
    id: null,
    name: 'Investigator',
    initials: 'IN',
    role: 'Case Officer',
    rawRole: 'case-officer',
    isAdmin: false
  };
}

export function saveOfficers() {
  try {
    localStorage.setItem('netrakshak_officers', JSON.stringify(state.officers));
  } catch (e) {}
}

export async function recordAudit(action, summary, level = 'info', actionType = 'system', customActor = null) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const selfOfficer = state.officers.find(o => o.isYou);
  const actorName = customActor || selfOfficer?.name || 'Officer';
  const actorInitials = selfOfficer ? selfOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OF';
  const entry = {
    id: 'log_' + Date.now(),
    time: timeStr,
    actor: actorName,
    actorInitials: actorInitials,
    level,
    action,
    actionType,
    summary
  };
  state.auditLogs.unshift(entry);
  try {
    localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
  } catch (e) {}

  if (supabaseConfigured) {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const payload = JSON.stringify({ action, summary, level, at: now.toISOString() });
          const hash = await hashText(payload);
          await supabase.from('audit_events').insert({
            actor_id: user.id,
            action,
            resource_type: actionType,
            change_summary: { summary, level },
            event_hash: hash
          });
        }
      } catch (err) {
        console.warn('Supabase audit insert:', err);
      }
    })();
  }
}

export async function loadSupabaseData() {
  if (!supabaseConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return;

    // Load all data concurrently in parallel
    const [
      { data: events },
      { data: dbProfiles },
      { data: dbEntities },
      { data: dbRels },
      { data: dbCases }
    ] = await Promise.all([
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('entities').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('fir_cases').select('*').order('created_at', { ascending: false })
    ]);

    if (events && events.length > 0) {
      state.auditLogs = events.map(e => {
        const d = new Date(e.created_at);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const isSelf = e.actor_id === user.id;
        const actorName = isSelf ? (user.user_metadata?.display_name || user.email?.split('@')[0] || 'Officer') : 'Officer';
        const actorInitials = isSelf ? (actorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) : 'OF';
        return {
          id: e.id,
          time: timeStr,
          actor: actorName,
          actorInitials: actorInitials,
          level: e.change_summary?.level || 'info',
          action: e.action || 'Audit event',
          actionType: e.resource_type || 'system',
          summary: e.change_summary?.summary || e.action || 'Event recorded'
        };
      });
      try {
        localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
      } catch (e) {}
    }

    if (dbProfiles && dbProfiles.length > 0) {
      state.officers = dbProfiles.map(p => ({
        id: p.id,
        name: p.display_name || p.email?.split('@')[0] || 'Officer',
        rank: p.rank || 'Inspector',
        badge: p.badge_no || '',
        district: p.district || '',
        state: p.state || 'Maharashtra',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role_name || 'case-officer',
        isYou: user.id === p.id || user.email === p.email
      }));
      saveOfficers();
    }

    if (dbEntities && dbEntities.length > 0) {
      const fetchedEntities = dbEntities.map((e, idx) => ({
        id: e.id,
        name: e.display_name,
        local: e.aliases?.[0] || e.display_name,
        type: e.entity_type ? e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1) : 'Entity',
        category: (e.entity_type || 'person').toLowerCase(),
        risk: e.risk_level || 'low',
        city: e.identifiers?.city || e.identifiers?.address || e.identifiers?.location || '',
        phone: e.identifiers?.phone || '',
        identifiers: e.identifiers || {},
        events: 1,
        recent: 80,
        x: 350 + Math.cos(idx) * 160,
        y: 250 + Math.sin(idx) * 160
      }));

      // Deduplicate by name and type against DEFAULT_ENTITIES
      const entityMap = new Map();
      DEFAULT_ENTITIES.forEach(ent => {
        const key = `${ent.name.trim().toLowerCase()}::${ent.type.toLowerCase()}`;
        entityMap.set(key, ent);
      });
      fetchedEntities.forEach(ent => {
        const key = `${ent.name.trim().toLowerCase()}::${ent.type.toLowerCase()}`;
        if (entityMap.has(key)) {
          // Merge identifiers
          const existing = entityMap.get(key);
          entityMap.set(key, { ...existing, id: ent.id, identifiers: { ...existing.identifiers, ...ent.identifiers } });
        } else {
          entityMap.set(key, ent);
        }
      });
      entities = Array.from(entityMap.values());
    } else {
      entities = [...DEFAULT_ENTITIES];
    }

    if (dbRels && dbRels.length > 0) {
      const fetchedEdges = dbRels.map(r => [r.source_entity_id, r.target_entity_id, r.relationship_type || 'Link']);
      const edgeSet = new Set(DEFAULT_EDGES.map(e => `${e[0]}=>${e[1]}`));
      const combinedEdges = [...DEFAULT_EDGES];
      fetchedEdges.forEach(e => {
        const key = `${e[0]}=>${e[1]}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          combinedEdges.push(e);
        }
      });
      edges = combinedEdges;
    } else {
      edges = [...DEFAULT_EDGES];
    }

    if (dbCases && dbCases.length > 0) {
      firCases = dbCases;
    }

    notifyStateChange();
  } catch (err) {
    console.warn('Supabase load error:', err);
  }
}

export async function verifyOfficerAuthorization(user) {
  if (!user) return { authorized: false, reason: 'Authentication required' };
  try {
    let profile = null;
    const { data: byId, error: errId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (byId) {
      profile = byId;
    } else {
      const { data: byEmail, error: errEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email || '')
        .maybeSingle();

      if (byEmail) {
        profile = byEmail;
      } else if (errId || errEmail) {
        const errMsg = errId?.message || errEmail?.message || 'Unknown database error';
        console.warn('Profile authorization error:', errId || errEmail);
        return { authorized: false, reason: `Database error: ${errMsg}` };
      }
    }

    if (!profile) {
      return { authorized: false, reason: `Account "${user.email}" is not registered in the Law Enforcement Officer Directory.` };
    }
    if (profile.is_active === false) {
      return { authorized: false, reason: 'Officer credentials have been deactivated by system administrator.' };
    }
    return { authorized: true, profile };
  } catch (err) {
    return { authorized: false, reason: err.message || 'Authorization check failed.' };
  }
}

export let isAuthActionInProgress = false;

export function setLoginInlineError(message) {
  state.loginError = message;
  const form = document.querySelector('.login-form');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passInput = form.querySelector('input[type="password"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (emailInput) emailInput.classList.add('input-error');
  if (passInput) passInput.classList.add('input-error');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }

  let errorEl = form.querySelector('.login-inline-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'login-inline-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.innerHTML = `<span class="error-icon">⚠</span><span class="error-text">${message}</span>`;
    const passLabel = passInput ? passInput.closest('label') : null;
    if (passLabel && passLabel.nextSibling) {
      form.insertBefore(errorEl, passLabel.nextSibling);
    } else if (submitBtn) {
      form.insertBefore(errorEl, submitBtn);
    } else {
      form.appendChild(errorEl);
    }
  } else {
    const textSpan = errorEl.querySelector('.error-text') || errorEl.querySelector('span:last-child');
    if (textSpan) textSpan.textContent = message;
    errorEl.style.display = 'flex';
  }
}

export function clearLoginInlineError() {
  state.loginError = '';
  const form = document.querySelector('.login-form');
  if (!form) return;
  const errorEl = form.querySelector('.login-inline-error');
  if (errorEl) errorEl.remove();
  const inputs = form.querySelectorAll('input');
  inputs.forEach(inp => inp.classList.remove('input-error'));
}

export async function signInOfficer(form) {
  if (isAuthActionInProgress) return;
  isAuthActionInProgress = true;

  const email = form.querySelector('input[type="email"]')?.value?.trim() || '';
  const password = form.querySelector('input[type="password"]')?.value || '';
  state.loginEmail = email;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Verifying…</span>`;
  }

  try {
    if (supabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData?.user) {
        setLoginInlineError('Invalid email address or password. Please verify your credentials.');
        return;
      }

      const check = await verifyOfficerAuthorization(authData.user);
      if (!check.authorized) {
        supabase.auth.signOut().catch(() => {});
        state.loggedIn = false;
        setLoginInlineError(`Access Denied: ${check.reason}`);
        return;
      }

      state.loggedIn = true;
      state.loginError = '';
      notifyStateChange();
      recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
      loadSupabaseData();
      return;
    }

    localStorage.setItem('demoSession', 'true');
    state.loggedIn = true;
    state.loginError = '';
    notifyStateChange();
    recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
  } catch (err) {
    setLoginInlineError('An error occurred during authentication. Please try again.');
  } finally {
    isAuthActionInProgress = false;
    if (submitBtn && !state.loggedIn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Sign in <span>→</span>`;
    }
  }
}

export async function signOutOfficer() {
  recordAudit('Logoff event', 'Signed out of session.', 'info', 'logoff').catch(() => {});
  localStorage.removeItem('demoSession');
  state.loggedIn = false;
  state.loginError = '';
  notifyStateChange();
  if (supabaseConfigured) {
    supabase.auth.signOut().catch(() => {});
  }
}

export async function bootstrapAuth() {
  try {
    if (supabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const check = await verifyOfficerAuthorization(data.session.user);
        if (check.authorized) {
          state.loggedIn = true;
          await loadSupabaseData();
        } else {
          await supabase.auth.signOut().catch(() => {});
          state.loggedIn = false;
          if (check.reason) state.loginError = check.reason;
        }
      } else {
        state.loggedIn = false;
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (isAuthActionInProgress) return;

        if (session?.user) {
          const check = await verifyOfficerAuthorization(session.user);
          if (!check.authorized) {
            await supabase.auth.signOut().catch(() => {});
            if (state.loggedIn) {
              state.loggedIn = false;
              setLoginInlineError(`Access Denied: ${check.reason}`);
            }
            return;
          }
          if (!state.loggedIn) {
            state.loggedIn = true;
            state.loginError = '';
            await loadSupabaseData();
            notifyStateChange();
          }
        } else {
          if (state.loggedIn) {
            state.loggedIn = false;
            notifyStateChange();
          }
        }
      });
    } else if (localStorage.getItem('demoSession') === 'true') {
      state.loggedIn = true;
    } else {
      state.loggedIn = false;
    }
  } catch (err) {
    console.warn('Auth bootstrap error:', err);
    state.loggedIn = false;
  } finally {
    state.authChecking = false;
    notifyStateChange();
  }
}
