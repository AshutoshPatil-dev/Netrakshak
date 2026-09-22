import { supabase, supabaseConfigured } from './lib/supabase.js';
import { hashText } from './lib/crypto.js';
import { getAccusedPhoto } from './lib/avatars.js';

let renderCallback = null;

export const VALID_VIEWS = [
  'overview',
  'entities',
  'network',
  'patterns',
  'entity_profile',
  'fir',
  'cdr_analysis',
  'ai_analysis',
  'officers',
  'audit_logs',
  'sources'
];

export function getInitialView() {
  try {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashView = window.location.hash.replace(/^#\/?/, '').trim();
      if (VALID_VIEWS.includes(hashView)) {
        return hashView;
      }
    }
    const saved = localStorage.getItem('netrakshak_active_view');
    if (saved && VALID_VIEWS.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'overview';
}

export function loadSavedGraphExploration() {
  try {
    const raw = localStorage.getItem('netrakshak_graph_exploration');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          active: Boolean(parsed.active),
          mode: parsed.mode === 'all' ? 'all' : 'focused',
          seedId: parsed.seedId || null,
          previousSeedId: parsed.previousSeedId || null,
          previousMode: parsed.previousMode || 'focused',
          expandedNodeIds: Array.isArray(parsed.expandedNodeIds) ? parsed.expandedNodeIds : [],
          hiddenNodeIds: Array.isArray(parsed.hiddenNodeIds) ? parsed.hiddenNodeIds : []
        };
      }
    }
  } catch (e) {}
  return {
    active: false,
    mode: 'focused',
    seedId: null,
    previousSeedId: null,
    previousMode: 'focused',
    expandedNodeIds: [],
    hiddenNodeIds: []
  };
}

export function registerRender(cb) {
  renderCallback = cb;
}

export function notifyStateChange() {
  try {
    if (typeof state !== 'undefined') {
      if (state.view && VALID_VIEWS.includes(state.view)) {
        localStorage.setItem('netrakshak_active_view', state.view);
        if (typeof window !== 'undefined' && window.location) {
          const targetHash = `#/${state.view}`;
          if (window.location.hash !== targetHash && window.location.hash !== `#${state.view}`) {
            window.history.replaceState(null, '', targetHash);
          }
        }
      }
      if (state.graphExploration) {
        localStorage.setItem('netrakshak_graph_exploration', JSON.stringify(state.graphExploration));
      }
      if (state.profileEntityId) {
        localStorage.setItem('netrakshak_profile_entity_id', state.profileEntityId);
      }
      if (state.selected) {
        localStorage.setItem('netrakshak_selected_entity', state.selected);
      }
      if (state.firMode) {
        localStorage.setItem('netrakshak_fir_mode', state.firMode);
      }
    }
  } catch (e) {}

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

export let entities = [];
export function setEntities(val) {
  entities = val;
}

export let edges = [];
export function setEdges(val) {
  edges = val;
}

export let firCases = [];
export function setFirCases(val) {
  firCases = val;
}

export function loadSavedMapConfig() {
  try {
    const raw = localStorage.getItem('netrakshak_graph_map_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (parsed.pinsLocked === undefined) parsed.pinsLocked = false;
        if (parsed.pinsLockedAll === undefined) parsed.pinsLockedAll = false;
        if (!parsed.lockedPinIds) parsed.lockedPinIds = {};
        if (!parsed.nodeGeoPositions) parsed.nodeGeoPositions = {};
        return parsed;
      }
    }
  } catch (e) {}
  return {
    enabled: false,
    lat: 18.5204,
    lng: 73.8567,
    zoom: 14,
    locationName: 'Pune City (Shivajinagar Sector)',
    locked: false,
    pinsLocked: false,
    pinsLockedAll: false,
    lockedPinIds: {},
    layerType: 'satellite',
    nodeGeoPositions: {}
  };
}

export function saveMapConfig(cfg) {
  try {
    localStorage.setItem('netrakshak_graph_map_config', JSON.stringify(cfg));
  } catch (e) {}
}

export const riskColor = { high: '#DC2626', medium: '#F59E0B', low: '#16A34A' };

const savedOfficerEmail = localStorage.getItem('activeOfficerEmail');
const hasCachedSession = Boolean(savedOfficerEmail);

export const state = {
  authChecking: !hasCachedSession,
  locale: localStorage.getItem('locale') || 'en',
  loggedIn: hasCachedSession,
  view: getInitialView(),
  query: '',
  sort: 'risk',
  type: 'all',
  selected: localStorage.getItem('netrakshak_selected_entity') || null,
  file: null,
  fileHash: '',
  filePath: '',
  graphFullscreen: false,
  graphSatelliteMode: false,
  graphMapConfig: loadSavedMapConfig(),
  sidebarCollapsed: false,
  fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
  firMode: localStorage.getItem('netrakshak_fir_mode') || 'upload',
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
  profileEntityId: localStorage.getItem('netrakshak_profile_entity_id') || null,
  profileHistory: [],
  previousViewBeforeProfile: 'network',
  graphSideTab: 'dossier',
  directorySearchQuery: '',
  directoryCategoryFilter: 'all',
  ocrEngine: 'auto', // 'auto', 'handwritten', 'printed'
  ocrScriptDetected: '',
  ocrConfidence: 0,
  graphExploration: loadSavedGraphExploration(),
  evidenceItems: [],
  cdrRecords: [],
  financialTransactions: [],
  integrityAuditResult: null,
  isIntegrityAuditing: false,
  cdrActiveDataset: 'pune_cyber', // 'pune_cyber', 'swargate_extortion', 'custom'
  cdrActiveTab: 'histogram', // 'histogram', 'imei_matrix', 'top_contacts', 'tower_preservation'
  cdrFilterTarget: null,
  mobileSidebarOpen: false
};

export function injectCDRIntoGraph(cdrList = [], focalNumber = null) {
  if (!cdrList || cdrList.length === 0) return;

  const newEntities = [...entities];
  const newEdges = [...edges];
  let primaryFocalId = null;

  // Process unique numbers from CDR
  const numberMap = new Map();
  cdrList.forEach(r => {
    if (r.callingNumber && !numberMap.has(r.callingNumber)) {
      numberMap.set(r.callingNumber, {
        name: r.callingName || r.callingNumber,
        phone: r.callingNumber,
        category: 'phone',
        risk: r.isNocturnal ? 'high' : 'medium'
      });
    }
    if (r.calledNumber && !numberMap.has(r.calledNumber)) {
      numberMap.set(r.calledNumber, {
        name: r.calledName || r.calledNumber,
        phone: r.calledNumber,
        category: 'phone',
        risk: r.isNocturnal ? 'high' : 'medium'
      });
    }
  });

  numberMap.forEach((info, phone) => {
    let existing = newEntities.find(e => 
      e.id === phone || 
      (e.phone && e.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')) || 
      (e.name && info.name && e.name.toLowerCase() === info.name.toLowerCase())
    );

    if (!existing) {
      const newId = `cdr_ent_${phone.replace(/[^0-9a-zA-Z]/g, '')}`;
      existing = {
        id: newId,
        name: info.name,
        local: info.name,
        type: 'Phone / SIM',
        category: 'phone',
        risk: info.risk,
        city: 'Pune (Telecom Circle)',
        phone: phone,
        imageUrl: getAccusedPhoto(info.name),
        identifiers: {
          phone: phone,
          imageUrl: getAccusedPhoto(info.name)
        },
        events: 1,
        recent: 90,
        x: 350 + Math.random() * 200 - 100,
        y: 250 + Math.random() * 200 - 100
      };
      newEntities.push(existing);
    }

    if (focalNumber && (phone === focalNumber || (info.name && info.name.toLowerCase().includes(focalNumber.toLowerCase())))) {
      primaryFocalId = existing.id;
    }
  });

  // Inject CDR call edges
  cdrList.forEach(r => {
    if (!r.callingNumber || !r.calledNumber) return;
    const sourceEnt = newEntities.find(e => 
      e.id === r.callingNumber || 
      (e.phone && e.phone.replace(/\s+/g, '') === r.callingNumber.replace(/\s+/g, '')) ||
      (e.name && r.callingName && e.name.toLowerCase() === r.callingName.toLowerCase())
    );
    const targetEnt = newEntities.find(e => 
      e.id === r.calledNumber || 
      (e.phone && e.phone.replace(/\s+/g, '') === r.calledNumber.replace(/\s+/g, '')) ||
      (e.name && r.calledName && e.name.toLowerCase() === r.calledName.toLowerCase())
    );

    if (sourceEnt && targetEnt && sourceEnt.id !== targetEnt.id) {
      const edgeExists = newEdges.some(edge => 
        (edge[0] === sourceEnt.id && edge[1] === targetEnt.id) ||
        (edge[0] === targetEnt.id && edge[1] === sourceEnt.id)
      );
      if (!edgeExists) {
        newEdges.push([sourceEnt.id, targetEnt.id, `Telecom CDR (${r.durationSec}s)`]);
      }
    }
  });

  setEntities(newEntities);
  setEdges(newEdges);

  state.view = 'network';
  state.graphExploration.active = true;
  state.graphExploration.mode = 'focused';
  if (primaryFocalId) {
    state.graphExploration.seedId = primaryFocalId;
    state.selected = primaryFocalId;
  } else if (newEntities.length > 0) {
    state.graphExploration.seedId = newEntities[0].id;
    state.selected = newEntities[0].id;
  }
  notifyStateChange();
}

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
  const hidden = new Set(state.graphExploration.hiddenNodeIds || []);
  let visible;
  if (state.graphExploration.mode === 'all') {
    visible = new Set(entities.map(e => e.id));
  } else {
    visible = new Set(state.graphExploration.expandedNodeIds || []);
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
  }
  // Exclude explicitly hidden nodes
  hidden.forEach(id => visible.delete(id));
  return visible;
}

export function startGraphInvestigation(seedId) {
  state.view = 'network';
  state.graphExploration.active = true;
  state.graphExploration.mode = 'focused';
  state.graphExploration.seedId = seedId;
  state.graphExploration.expandedNodeIds = [seedId];
  state.graphExploration.hiddenNodeIds = [];
  state.selected = seedId;
  notifyStateChange();
}

export function returnToGraphLaunchpad() {
  state.view = 'network';
  state.graphExploration.active = false;
  state.graphExploration.seedId = null;
  state.graphExploration.expandedNodeIds = [];
  state.graphExploration.hiddenNodeIds = [];
  state.selected = null;
  notifyStateChange();
}

export function expandGraphNode(nodeId) {
  if (!state.graphExploration.expandedNodeIds) {
    state.graphExploration.expandedNodeIds = [];
  }
  if (state.graphExploration.hiddenNodeIds) {
    state.graphExploration.hiddenNodeIds = state.graphExploration.hiddenNodeIds.filter(id => id !== nodeId);
  }
  if (!state.graphExploration.expandedNodeIds.includes(nodeId)) {
    state.graphExploration.expandedNodeIds.push(nodeId);
  } else {
    // Expand all connected neighbors of this node to reveal next layer of network relationships
    const neighborIds = [];
    edges.forEach(edge => {
      if (edge[0] === nodeId) neighborIds.push(edge[1]);
      if (edge[1] === nodeId) neighborIds.push(edge[0]);
    });
    neighborIds.forEach(nId => {
      if (!state.graphExploration.expandedNodeIds.includes(nId)) {
        state.graphExploration.expandedNodeIds.push(nId);
      }
      if (state.graphExploration.hiddenNodeIds) {
        state.graphExploration.hiddenNodeIds = state.graphExploration.hiddenNodeIds.filter(id => id !== nId);
      }
    });
  }
  state.graphExploration.active = true;
  notifyStateChange();
}

export function collapseGraphNode(nodeId) {
  if (!state.graphExploration.hiddenNodeIds) {
    state.graphExploration.hiddenNodeIds = [];
  }
  if (!state.graphExploration.hiddenNodeIds.includes(nodeId)) {
    state.graphExploration.hiddenNodeIds.push(nodeId);
  }
  state.graphExploration.expandedNodeIds = (state.graphExploration.expandedNodeIds || []).filter(id => id !== nodeId);
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
  state.graphExploration.hiddenNodeIds = [];
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
  state.view = 'network';
  state.graphExploration.active = true;
  state.graphExploration.mode = 'all';
  state.graphExploration.hiddenNodeIds = [];
  if (!state.selected && entities.length > 0) {
    state.selected = entities[0].id;
  }
  notifyStateChange();
}

export function toggleGraphSatelliteMode(forcedVal) {
  if (forcedVal !== undefined) {
    state.graphSatelliteMode = !!forcedVal;
  } else {
    state.graphSatelliteMode = !state.graphSatelliteMode;
  }
  state.graphMapConfig.enabled = state.graphSatelliteMode;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function setGraphMapLocation(lat, lng, zoom, name) {
  state.graphMapConfig.lat = lat;
  state.graphMapConfig.lng = lng;
  if (zoom !== undefined) state.graphMapConfig.zoom = zoom;
  if (name) state.graphMapConfig.locationName = name;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function toggleGraphMapLock(locked) {
  state.graphMapConfig.locked = (locked !== undefined) ? locked : !state.graphMapConfig.locked;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function isPinLocked(nodeId) {
  if (state.graphMapConfig?.pinsLockedAll) return true;
  return !!state.graphMapConfig?.lockedPinIds?.[nodeId];
}

export function togglePinLock(nodeId, locked) {
  if (!state.graphMapConfig.lockedPinIds) {
    state.graphMapConfig.lockedPinIds = {};
  }
  const current = isPinLocked(nodeId);
  state.graphMapConfig.lockedPinIds[nodeId] = (locked !== undefined) ? locked : !current;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function toggleLockAllPins(locked) {
  const nextVal = (locked !== undefined) ? locked : !state.graphMapConfig.pinsLockedAll;
  state.graphMapConfig.pinsLockedAll = nextVal;
  state.graphMapConfig.pinsLocked = nextVal;
  if (!state.graphMapConfig.lockedPinIds) {
    state.graphMapConfig.lockedPinIds = {};
  }
  // Synchronize all individual pin locks
  entities.forEach(e => {
    state.graphMapConfig.lockedPinIds[e.id] = nextVal;
  });
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function toggleGraphPinsLock(locked) {
  toggleLockAllPins(locked);
}

export function setNodeGeoPosition(nodeId, lat, lng) {
  if (!state.graphMapConfig.nodeGeoPositions) {
    state.graphMapConfig.nodeGeoPositions = {};
  }
  state.graphMapConfig.nodeGeoPositions[nodeId] = { lat, lng };
  saveMapConfig(state.graphMapConfig);
}

export function setGraphMapLayerType(type) {
  state.graphMapConfig.layerType = type;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function setMapGroupingMode(active) {
  if (!state.graphMapConfig) state.graphMapConfig = {};
  state.graphMapConfig.groupingMode = !!active;
  if (!active) {
    state.graphMapConfig.selectedForGrouping = [];
  } else {
    state.graphMapConfig.selectedForGrouping = state.graphMapConfig.selectedForGrouping || [];
  }
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function togglePinSelectionForGrouping(nodeId) {
  if (!state.graphMapConfig) state.graphMapConfig = {};
  if (!state.graphMapConfig.selectedForGrouping) state.graphMapConfig.selectedForGrouping = [];
  const idx = state.graphMapConfig.selectedForGrouping.indexOf(nodeId);
  if (idx >= 0) {
    state.graphMapConfig.selectedForGrouping.splice(idx, 1);
  } else {
    state.graphMapConfig.selectedForGrouping.push(nodeId);
  }
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
}

export function createMarkerGroup(nodeIds, name) {
  if (!nodeIds || nodeIds.length < 2) return null;
  if (!state.graphMapConfig) state.graphMapConfig = {};
  if (!state.graphMapConfig.markerGroups) state.graphMapConfig.markerGroups = [];

  // Remove any of these nodes from existing groups
  state.graphMapConfig.markerGroups = state.graphMapConfig.markerGroups.map(grp => {
    return {
      ...grp,
      nodeIds: grp.nodeIds.filter(id => !nodeIds.includes(id))
    };
  }).filter(grp => grp.nodeIds.length >= 2);

  // Compute common anchor position from the first selected node or average
  const positions = nodeIds.map(id => state.graphMapConfig.nodeGeoPositions?.[id]).filter(Boolean);
  let anchorLat = 18.5204;
  let anchorLng = 73.8567;
  if (positions.length > 0) {
    anchorLat = positions.reduce((acc, p) => acc + p.lat, 0) / positions.length;
    anchorLng = positions.reduce((acc, p) => acc + p.lng, 0) / positions.length;
  }
  if (!state.graphMapConfig.nodeGeoPositions) state.graphMapConfig.nodeGeoPositions = {};
  nodeIds.forEach(id => {
    state.graphMapConfig.nodeGeoPositions[id] = { lat: anchorLat, lng: anchorLng };
  });

  const newGroup = {
    id: `grp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: name || `Cluster (${nodeIds.length})`,
    nodeIds: [...nodeIds],
    lat: anchorLat,
    lng: anchorLng
  };

  state.graphMapConfig.markerGroups.push(newGroup);
  state.graphMapConfig.selectedForGrouping = [];
  state.graphMapConfig.groupingMode = false;
  saveMapConfig(state.graphMapConfig);
  notifyStateChange();
  return newGroup;
}

export function removeMarkerGroup(groupId) {
  if (!state.graphMapConfig?.markerGroups) return;
  const targetGroup = state.graphMapConfig.markerGroups.find(g => g.id === groupId);
  if (targetGroup) {
    // Slightly scatter member pins so they don't sit directly on top of each other
    const total = targetGroup.nodeIds.length;
    const baseLat = targetGroup.lat || 18.5204;
    const baseLng = targetGroup.lng || 73.8567;
    targetGroup.nodeIds.forEach((id, idx) => {
      const angle = (idx / total) * Math.PI * 2;
      const radius = 0.003;
      state.graphMapConfig.nodeGeoPositions[id] = {
        lat: baseLat + Math.sin(angle) * radius,
        lng: baseLng + Math.cos(angle) * radius * 1.15
      };
    });
  }
  state.graphMapConfig.markerGroups = state.graphMapConfig.markerGroups.filter(g => g.id !== groupId);
  saveMapConfig(state.graphMapConfig);
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
  const isSystem = actionType === 'integrity' || action === 'Integrity alert' || customActor === 'System (Vault Engine)';
  const selfOfficer = state.officers.find(o => o.isYou);
  const actorName = isSystem ? 'System (Vault Engine)' : (customActor || selfOfficer?.name || 'Officer');
  const actorInitials = isSystem ? 'SYS' : (selfOfficer ? selfOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OF');
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
    const user = data?.session?.user || null;
    const activeEmail = user?.email || localStorage.getItem('activeOfficerEmail') || '';

    // Load all data concurrently in parallel
    const [
      { data: events },
      { data: dbProfiles },
      { data: dbEntities },
      { data: dbRels },
      { data: dbCases },
      { data: dbCdrs },
      { data: dbFinances },
      { data: dbEvidence }
    ] = await Promise.all([
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('entities').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('fir_cases').select('*').order('created_at', { ascending: false }),
      supabase.from('cdr_records').select('*').order('call_timestamp', { ascending: false }),
      supabase.from('financial_transactions').select('*').order('transaction_timestamp', { ascending: false }),
      supabase.from('evidence_items').select('*')
    ]);

    if (events && events.length > 0) {
      state.auditLogs = events.map(e => {
        const d = new Date(e.created_at);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const isSystemEvent = e.resource_type === 'integrity' || e.action === 'Integrity alert';
        const isSelf = user ? e.actor_id === user.id : false;
        let actorName = isSelf ? (user.user_metadata?.display_name || user.email?.split('@')[0] || 'Officer') : 'Officer';
        let actorInitials = isSelf ? (actorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) : 'OF';
        if (isSystemEvent) {
          actorName = 'System (Vault Engine)';
          actorInitials = 'SYS';
        }
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
        badge_no: p.badge_no || '',
        district: p.district || '',
        state: p.state || 'Maharashtra',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role_name || 'case-officer',
        isYou: (user && (user.id === p.id || user.email === p.email)) || (activeEmail && (p.email || '').toLowerCase() === activeEmail.toLowerCase())
      }));
      saveOfficers();
    }
    if (dbEntities && dbEntities.length > 0) {
      entities = dbEntities.map((e, idx) => ({
        id: e.id,
        name: e.display_name,
        local: e.aliases?.[0] || e.display_name,
        type: e.entity_type ? (e.entity_type === 'bank_account' ? 'Bank' : e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1)) : 'Entity',
        category: (e.entity_type || 'person').toLowerCase() === 'bank_account' ? 'bank' : (e.entity_type || 'person').toLowerCase(),
        risk: e.risk_level || 'low',
        city: e.identifiers?.city || e.identifiers?.address || e.identifiers?.location || e.identifiers?.zone || '',
        phone: e.identifiers?.phone || (e.entity_type === 'phone' ? e.display_name : ''),
        imageUrl: e.identifiers?.imageUrl || getAccusedPhoto(e.display_name),
        identifiers: {
          ...(e.identifiers || {}),
          imageUrl: e.identifiers?.imageUrl || getAccusedPhoto(e.display_name)
        },
        events: Array.isArray(e.source_refs) ? e.source_refs.length : 1,
        recent: 85,
        x: 350 + Math.cos(idx) * 180,
        y: 250 + Math.sin(idx) * 180
      }));
    } else {
      entities = [];
    }

    if (dbRels && dbRels.length > 0) {
      edges = dbRels.map(r => [r.source_entity_id, r.target_entity_id, r.relationship_type || 'Link']);
    } else {
      edges = [];
    }

    if (dbEvidence && dbEvidence.length > 0) {
      state.evidenceItems = dbEvidence;
    } else {
      state.evidenceItems = [];
    }

    if (dbCdrs && dbCdrs.length > 0) {
      state.cdrRecords = dbCdrs;
    } else {
      state.cdrRecords = [];
    }

    if (dbFinances && dbFinances.length > 0) {
      state.financialTransactions = dbFinances;
    } else {
      state.financialTransactions = [];
    }

    if (dbCases && dbCases.length > 0) {
      firCases = dbCases.map(c => {
        const firNum = c.fir_number || c.firNumber || 'FIR';
        const sectionsStr = Array.isArray(c.sections) ? c.sections.join(', ') : (c.sections || '');

        let rawSummary = c.incident_summary || c.incidentSummary || '';
        let propSummary = c.property_summary || c.propertySummary || '';
        let compName = c.complainant_name || c.complainantName || '';
        let compPhone = c.complainant_phone || c.complainantPhone || '';
        let compAge = c.complainant_age || c.complainantAge || '';
        let compFather = c.complainant_father || c.complainantFather || '';
        let compAddress = c.complainant_address || c.complainantAddress || '';
        let loc = c.incident_location || c.incidentLocation || '';
        let time = c.incident_time || c.incidentTime || '';

        // If composite narrative was saved in database, parse fields out if missing
        if (rawSummary.includes('[Complainant]:') && !compName) {
          const compMatch = rawSummary.match(/\[Complainant\]:\s*([^(]+?)(?:\s*\(Age:\s*([^,]*),\s*S\/o:\s*([^,]*),\s*Ph:\s*([^,]*),\s*Addr:\s*([^)]*)\))?/i);
          if (compMatch) {
            compName = compMatch[1]?.trim() || compName;
            if (compMatch[2]) compAge = compMatch[2].trim();
            if (compMatch[3]) compFather = compMatch[3].trim();
            if (compMatch[4]) compPhone = compMatch[4].trim();
            if (compMatch[5]) compAddress = compMatch[5].trim();
          }
        }
        if (rawSummary.includes('[Property Stolen / Evidence Summary]:') && !propSummary) {
          const propMatch = rawSummary.match(/\[Property Stolen \/ Evidence Summary\]:\s*([^\n\r]+)/i);
          if (propMatch) propSummary = propMatch[1]?.trim() || propSummary;
        }
        if (rawSummary.includes('[Incident Location & Time]:') && !loc) {
          const locMatch = rawSummary.match(/\[Incident Location & Time\]:\s*([^a\n\r]+?)(?:\s+at\s+([^\n\r]+))?$/im);
          if (locMatch) {
            loc = locMatch[1]?.trim() || loc;
            if (locMatch[2]) time = locMatch[2].trim();
          }
        }

        let cleanSummary = rawSummary.split('[Property Stolen')[0].split('[Complainant]')[0].trim();
        if (!cleanSummary) cleanSummary = rawSummary;

        const subj = c.subject_name || c.subjectName || '';
        const alias = c.alias || '';
        const otherAcc = c.other_accused || c.otherAccused || '';
        const phone = c.phone || '';
        const vehicle = c.vehicle || '';
        const bank = c.bank || '';
        const accusedPhoto = c.accused_image || c.accusedImage || getAccusedPhoto(subj) || '';

        const caseEvidence = state.evidenceItems.filter(ev => ev.fir_id === c.id || ev.fir_number === firNum);

        return {
          ...c,
          id: c.id,
          firNumber: firNum,
          fir_number: firNum,
          policeStation: c.police_station || c.policeStation || 'Cyber Crime Police Station, Shivajinagar',
          police_station: c.police_station || c.policeStation || 'Cyber Crime Police Station, Shivajinagar',
          district: c.district || 'Pune City',
          state: c.state || 'Maharashtra',
          incidentDate: c.incident_date || c.incidentDate || '',
          incident_date: c.incident_date || c.incidentDate || '',
          incidentTime: time || '',
          incident_time: time || '',
          sections: sectionsStr,
          complainantName: compName,
          complainant_name: compName,
          complainantAge: compAge,
          complainant_age: compAge,
          complainantFather: compFather,
          complainant_father: compFather,
          complainantPhone: compPhone,
          complainant_phone: compPhone,
          complainantAddress: compAddress,
          complainant_address: compAddress,
          subjectName: subj,
          subject_name: subj,
          alias: alias,
          otherAccused: otherAcc,
          other_accused: otherAcc,
          incidentLocation: loc,
          incident_location: loc,
          phone: phone,
          vehicle: vehicle,
          bank: bank,
          incidentSummary: cleanSummary,
          incident_summary: cleanSummary,
          propertySummary: propSummary,
          property_summary: propSummary,
          accusedImage: accusedPhoto,
          accused_image: accusedPhoto,
          extractionStatus: c.extraction_status || c.extractionStatus || 'approved',
          extraction_status: c.extraction_status || c.extractionStatus || 'approved',
          syndicateGroup: c.syndicate_group || c.syndicateGroup || '',
          evidence_items: c.evidence_items || caseEvidence
        };
      });
    } else {
      firCases = [];
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
    if (!email || !password) {
      setLoginInlineError('Please enter both email and password.');
      return;
    }

    if (!supabaseConfigured) {
      setLoginInlineError('Database connection error: Supabase is not configured.');
      return;
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !authData?.user) {
      setLoginInlineError(error?.message || 'Invalid email address or password. Please verify your credentials.');
      return;
    }

    const check = await verifyOfficerAuthorization(authData.user);
    if (!check.authorized) {
      await supabase.auth.signOut().catch(() => {});
      state.loggedIn = false;
      setLoginInlineError(`Access Denied: ${check.reason}`);
      return;
    }

    localStorage.setItem('activeOfficerEmail', email);
    state.loggedIn = true;
    state.loginError = '';
    await loadSupabaseData().catch(() => {});
    state.officers.forEach(o => {
      o.isYou = ((o.email || '').toLowerCase() === email.toLowerCase() || o.id === authData.user.id);
    });
    saveOfficers();
    notifyStateChange();
    recordAudit('Login event', `Officer ${check.profile?.display_name || email} signed in.`, 'info', 'login').catch(() => {});
  } catch (err) {
    console.error('Authentication error:', err);
    setLoginInlineError(err.message || 'An error occurred during authentication. Please try again.');
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
  localStorage.removeItem('activeOfficerEmail');
  localStorage.removeItem('netrakshak_active_view');
  localStorage.removeItem('netrakshak_graph_exploration');
  localStorage.removeItem('netrakshak_profile_entity_id');
  localStorage.removeItem('netrakshak_selected_entity');
  state.view = 'overview';
  state.loggedIn = false;
  state.loginError = '';
  state.loginEmail = '';
  state.officers.forEach(o => {
    o.isYou = false;
  });
  if (supabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout warning:', e);
    }
  }
  notifyStateChange();
}

export async function bootstrapAuth() {
  try {
    if (supabaseConfigured) {
      await loadSupabaseData().catch(() => {});
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const check = await verifyOfficerAuthorization(data.session.user);
        if (check.authorized) {
          state.loggedIn = true;
          state.loginError = '';
          await loadSupabaseData().catch(() => {});
          state.officers.forEach(o => {
            o.isYou = ((o.email || '').toLowerCase() === (data.session.user.email || '').toLowerCase() || o.id === data.session.user.id);
          });
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
            await loadSupabaseData().catch(() => {});
            state.officers.forEach(o => {
              o.isYou = ((o.email || '').toLowerCase() === (session.user.email || '').toLowerCase() || o.id === session.user.id);
            });
            notifyStateChange();
          }
        } else {
          if (state.loggedIn) {
            state.loggedIn = false;
            notifyStateChange();
          }
        }
      });
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
