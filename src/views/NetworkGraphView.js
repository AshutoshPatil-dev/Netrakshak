import Graph from 'graphology';
import Sigma from 'sigma';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import {
  state,
  entities,
  edges,
  firCases,
  riskColor,
  notifyStateChange,
  getVisibleGraphNodeIds,
  startGraphInvestigation,
  returnToGraphLaunchpad,
  expandGraphNode,
  collapseGraphNode,
  setGraphSeed,
  toggleGraphSeed,
  resetGraphExploration,
  toggleGraphSatelliteMode,
  setGraphMapLocation,
  toggleGraphMapLock,
  isPinLocked,
  togglePinLock,
  toggleLockAllPins,
  setNodeGeoPosition,
  setGraphMapLayerType,
  setMapGroupingMode,
  togglePinSelectionForGrouping,
  createMarkerGroup,
  removeMarkerGroup,
  saveMapConfig,
  openEntityProfile
} from '../state.js';
import { graphMetrics } from '../lib/analysis.js';
import { showToast } from '../components/Toast.js';
import { performAIAnalysis } from './AIAnalysisView.js';

let sigmaInstance = null;
let currentGraph = null;
let lastRenderedGraphSignature = '';
let leafletMapInstance = null;
let currentTileLayer = null;
let currentLabelLayer = null;
let leafletMarkersGroup = null;
let leafletEdgesGroup = null;

// Ensure Leaflet map and Sigma canvas adapt smoothly to browser zoom and window resize
window.addEventListener('resize', () => {
  if (leafletMapInstance) {
    try { leafletMapInstance.invalidateSize(); } catch (e) {}
  }
  if (sigmaInstance) {
    try { sigmaInstance.refresh(); } catch (e) {}
  }
}, { passive: true });

export const GEO_PRESETS = [
  { name: 'Pune: Shivajinagar & FC Road', lat: 18.5284, lng: 73.8415, zoom: 15 },
  { name: 'Pune: Swargate Timber Market', lat: 18.5018, lng: 73.8580, zoom: 15 },
  { name: 'Pune: Kothrud Paud Road', lat: 18.5074, lng: 73.8077, zoom: 15 },
  { name: 'Pune: Deccan Gymkhana', lat: 18.5167, lng: 73.8410, zoom: 15 },
  { name: 'Mumbai: Bandra Kurla Complex (BKC)', lat: 19.0674, lng: 72.8687, zoom: 15 },
  { name: 'Mumbai: Nariman Point & Fort', lat: 18.9256, lng: 72.8242, zoom: 15 },
  { name: 'Mumbai: Cyber Station (Bandra)', lat: 19.0596, lng: 72.8295, zoom: 15 },
  { name: 'Thane: Cyber Sector', lat: 19.2183, lng: 72.9781, zoom: 14 },
  { name: 'New Delhi: Connaught Place', lat: 28.6315, lng: 77.2167, zoom: 14 },
  { name: 'Bengaluru: Tech Corridor', lat: 12.9716, lng: 77.5946, zoom: 14 }
];

export function openGeoSearchModal() {
  const existing = document.querySelector('.geo-search-modal-overlay');
  if (existing) existing.remove();

  const overlay = el('div', { class: 'geo-search-modal-overlay' });
  const closeBtn = el('button', {
    class: 'geo-search-modal-close',
    title: 'Close Search',
    onclick: () => overlay.remove()
  }, ['✕']);

  const header = el('div', { class: 'geo-search-modal-header' }, [
    el('div', { class: 'geo-search-modal-title-group' }, [
      el('h3', { class: 'geo-search-modal-title' }, ['🌍 Search World Location']),
      el('p', { class: 'geo-search-modal-sub' }, [
        'Center satellite view on any global city, sector, address, or Latitude, Longitude coordinates.'
      ])
    ]),
    closeBtn
  ]);

  const searchInput = el('input', {
    type: 'text',
    class: 'geo-search-input',
    placeholder: 'Search places worldwide (e.g. London, Times Square, 28.6139, 77.2090)...',
    autofocus: true
  });

  const searchBtn = el('button', {
    class: 'geo-search-submit-btn',
    onclick: () => executeSearch()
  }, ['🔍 Search Location']);

  const searchBar = el('div', { class: 'geo-search-bar-row' }, [
    searchInput,
    searchBtn
  ]);

  const quickCities = [
    'Pune', 'Mumbai', 'New Delhi', 'Bengaluru', 'Hyderabad',
    'London', 'Dubai', 'Singapore', 'New York', 'Tokyo'
  ];

  const suggestionsRow = el('div', { class: 'geo-search-suggestions-row' }, [
    el('span', { class: 'geo-search-suggestions-label' }, ['Quick Presets:']),
    ...quickCities.map(city => el('button', {
      class: 'geo-search-chip',
      onclick: () => {
        searchInput.value = city;
        executeSearch();
      }
    }, [city]))
  ]);

  const resultsContainer = el('div', { class: 'geo-search-results-container' }, [
    el('div', { class: 'geo-search-empty-hint' }, [
      'Type any location name or paste coordinates to navigate the satellite map.'
    ])
  ]);

  const selectLocation = (lat, lng, name) => {
    setGraphMapLocation(lat, lng, 15, name);
    if (leafletMapInstance) {
      leafletMapInstance.flyTo([lat, lng], 15, { duration: 1.2 });
    }
    overlay.remove();
    showToast(`📍 Satellite centered to: ${name}`);
  };

  const executeSearch = async () => {
    const q = (searchInput.value || '').trim();
    if (!q) return;

    // Check for direct lat/lng coordinates (e.g., "18.5204, 73.8567" or "18.5204 73.8567")
    const coordMatch = q.match(/^([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        resultsContainer.innerHTML = '';
        const card = el('div', {
          class: 'geo-search-result-item coordinate-match',
          onclick: () => selectLocation(lat, lng, `Coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`)
        }, [
          el('div', { class: 'geo-result-icon' }, ['📍']),
          el('div', { class: 'geo-result-info' }, [
            el('div', { class: 'geo-result-name' }, [`Direct Coordinates: ${lat.toFixed(5)}°, ${lng.toFixed(5)}°`]),
            el('div', { class: 'geo-result-address' }, ['Click to fly satellite camera to these exact global coordinates'])
          ]),
          el('div', { class: 'geo-result-badge' }, ['GO ➔'])
        ]);
        resultsContainer.append(card);
        return;
      }
    }

    resultsContainer.innerHTML = '';
    const loadingEl = el('div', { class: 'geo-search-loading' }, [
      el('span', { class: 'geo-spinner' }, []),
      el('span', {}, ['Searching global OpenStreetMap registry...'])
    ]);
    resultsContainer.append(loadingEl);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Search network error');
      const data = await res.json();
      resultsContainer.innerHTML = '';

      if (!data || data.length === 0) {
        resultsContainer.append(el('div', { class: 'geo-search-empty-hint' }, [
          `No places found matching "${q}". Try a broader city, district, or landmark name.`
        ]));
        return;
      }

      data.forEach(item => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const parts = (item.display_name || '').split(',').map(s => s.trim());
        const primaryName = parts[0] || item.name || 'Location';
        const address = parts.slice(1).join(', ') || 'Global Region';

        const itemCard = el('div', {
          class: 'geo-search-result-item',
          onclick: () => selectLocation(lat, lng, primaryName)
        }, [
          el('div', { class: 'geo-result-icon' }, ['🌐']),
          el('div', { class: 'geo-result-info' }, [
            el('div', { class: 'geo-result-name' }, [primaryName]),
            el('div', { class: 'geo-result-address' }, [address]),
            el('div', { class: 'geo-result-coords' }, [`Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°`])
          ]),
          el('div', { class: 'geo-result-badge' }, ['Fly To ➔'])
        ]);
        resultsContainer.append(itemCard);
      });
    } catch (err) {
      resultsContainer.innerHTML = '';
      resultsContainer.append(el('div', { class: 'geo-search-error-hint' }, [
        'Could not reach global geocoder. You can also paste exact coordinates (e.g. 18.5204, 73.8567) to jump immediately.'
      ]));
    }
  };

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const dialog = el('div', { class: 'geo-search-modal-card' }, [
    header,
    searchBar,
    suggestionsRow,
    resultsContainer
  ]);

  overlay.append(dialog);
  document.body.append(overlay);

  setTimeout(() => searchInput.focus(), 50);
}

export function updateLeafletTileLayer(layerType) {
  if (!leafletMapInstance) return;

  if (currentTileLayer) {
    leafletMapInstance.removeLayer(currentTileLayer);
    currentTileLayer = null;
  }
  if (currentLabelLayer) {
    leafletMapInstance.removeLayer(currentLabelLayer);
    currentLabelLayer = null;
  }

  if (layerType === 'streets') {
    currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(leafletMapInstance);
  } else if (layerType === 'hybrid') {
    currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }).addTo(leafletMapInstance);
    currentLabelLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(leafletMapInstance);
  } else {
    // default: satellite
    currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }).addTo(leafletMapInstance);
  }
}

export function applyMapLockState() {
  if (!leafletMapInstance) return;
  const isLocked = !!state.graphMapConfig?.locked;
  if (isLocked) {
    leafletMapInstance.dragging?.disable();
    leafletMapInstance.scrollWheelZoom?.disable();
    leafletMapInstance.touchZoom?.disable();
  } else {
    leafletMapInstance.dragging?.enable();
    leafletMapInstance.scrollWheelZoom?.enable();
    leafletMapInstance.touchZoom?.enable();
  }
}

export function renderSatelliteMapPins(visibleNodes) {
  if (!leafletMapInstance || !visibleNodes || visibleNodes.length === 0) return;

  if (leafletMarkersGroup) {
    leafletMarkersGroup.clearLayers();
  } else {
    leafletMarkersGroup = L.layerGroup().addTo(leafletMapInstance);
  }

  if (leafletEdgesGroup) {
    leafletEdgesGroup.clearLayers();
  } else {
    leafletEdgesGroup = L.layerGroup().addTo(leafletMapInstance);
  }

  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const mapCenter = leafletMapInstance.getCenter();
  const baseLat = mapCenter.lat || state.graphMapConfig.lat || 18.5204;
  const baseLng = mapCenter.lng || state.graphMapConfig.lng || 73.8567;

  if (!state.graphMapConfig.nodeGeoPositions) {
    state.graphMapConfig.nodeGeoPositions = {};
  }

  // 1. Ensure all visible nodes have valid geo positions first
  visibleNodes.forEach((entity) => {
    let geo = state.graphMapConfig.nodeGeoPositions[entity.id];
    if (!geo || typeof geo.lat !== 'number' || typeof geo.lng !== 'number') {
      if (entity.identifiers?.lat && entity.identifiers?.lng) {
        geo = { lat: entity.identifiers.lat, lng: entity.identifiers.lng };
      } else {
        const seedId = state.graphExploration?.seedId;
        const isSeed = entity.id === seedId;
        if (isSeed) {
          geo = { lat: baseLat, lng: baseLng };
        } else {
          const others = visibleNodes.filter(n => n.id !== seedId);
          const posIdx = Math.max(0, others.findIndex(n => n.id === entity.id));
          const total = Math.max(others.length, 1);
          const angle = (posIdx / total) * Math.PI * 2;
          const radius = 0.005 + (posIdx % 2) * 0.0035;
          geo = {
            lat: baseLat + Math.sin(angle) * radius,
            lng: baseLng + Math.cos(angle) * radius * 1.15
          };
        }
      }
      state.graphMapConfig.nodeGeoPositions[entity.id] = geo;
    }
  });

  const markersMap = new Map();
  const nodePolylinesMap = new Map();
  const isGroupingMode = !!state.graphMapConfig?.groupingMode;
  const selectedForGroup = new Set(state.graphMapConfig?.selectedForGrouping || []);
  const rawGroups = state.graphMapConfig?.markerGroups || [];
  const activeGroups = [];
  const groupedNodeIdSet = new Set();

  rawGroups.forEach(grp => {
    const members = (grp.nodeIds || []).map(id => visibleNodes.find(n => n.id === id)).filter(Boolean);
    if (members.length >= 2) {
      activeGroups.push({ group: grp, members });
      members.forEach(m => groupedNodeIdSet.add(m.id));
    }
  });

  const ungroupedNodes = visibleNodes.filter(n => !groupedNodeIdSet.has(n.id));

  // Helper to live-update all connected lines for a list of node IDs
  const updateConnectedPolylines = (nodeIds) => {
    const seen = new Set();
    nodeIds.forEach(id => {
      const items = nodePolylinesMap.get(id);
      if (items) {
        items.forEach(item => {
          if (seen.has(item)) return;
          seen.add(item);
          const p1 = state.graphMapConfig.nodeGeoPositions[item.source];
          const p2 = state.graphMapConfig.nodeGeoPositions[item.target];
          if (p1 && p2 && item.polyline) {
            item.polyline.setLatLngs([[p1.lat, p1.lng], [p2.lat, p2.lng]]);
          }
        });
      }
    });
  };

  // 2. Render Active Groups (Stepped Overlapping Heads & Combined Info Pill)
  activeGroups.forEach(({ group, members }) => {
    let gLat = group.lat;
    let gLng = group.lng;
    if (typeof gLat !== 'number' || typeof gLng !== 'number') {
      const firstGeo = state.graphMapConfig.nodeGeoPositions[members[0].id];
      gLat = firstGeo?.lat || baseLat;
      gLng = firstGeo?.lng || baseLng;
      group.lat = gLat;
      group.lng = gLng;
    }

    // Synchronize all member entity coordinates to group anchor
    members.forEach(m => {
      state.graphMapConfig.nodeGeoPositions[m.id] = { lat: gLat, lng: gLng };
    });

    const isAnyMemberSelected = members.some(m => m.id === state.selected);
    const isGroupLocked = members.every(m => isPinLocked(m.id)) || !!state.graphMapConfig?.pinsLockedAll;
    const headsWidth = (members.length - 1) * 18 + 28;
    const iconWidth = Math.max(headsWidth + 16, 150);
    const iconHeight = 44 + members.length * 20;
    const anchorX = iconWidth / 2;
    const anchorY = 32;

    const groupHtml = `
      <div class="map-tactical-pin-group ${isAnyMemberSelected ? 'selected' : ''} ${isGroupLocked ? 'locked' : 'draggable'}">
        <div class="pin-group-heads-container" style="width: ${headsWidth}px;">
          ${members.map((m, idx) => {
            const mColor = objectTypeColors[m.type] || '#1E293B';
            const mIcon = objectTypeIcons[m.type] || 'shield';
            const isSel = state.selected === m.id;
            return `
              <div class="pin-group-head-item ${isSel ? 'selected' : ''}" style="left: ${idx * 18}px; z-index: ${idx + 1}; background: ${mColor};" data-node-id="${m.id}" title="${m.type}: ${m.name} (Click to inspect / Drag to move group)">
                <span class="pin-icon">${icon(mIcon)}</span>
                <span class="pin-risk-dot ${m.risk || 'low'}"></span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="pin-needle group-needle"></div>
        <div class="pin-shadow group-shadow"></div>
        <div class="pin-group-combined-pill">
          <div class="pin-group-pill-header">
            <span class="pin-group-count-badge">👥 ${members.length} Grouped</span>
            <button class="pin-ungroup-btn" data-group-id="${group.id}" title="Ungroup these pins">✕ Ungroup</button>
          </div>
          <div class="pin-group-members-list">
            ${members.map(m => {
              const mColor = objectTypeColors[m.type] || '#38BDF8';
              const isSel = state.selected === m.id;
              const mLocked = isPinLocked(m.id);
              return `
                <div class="pin-group-member-row ${isSel ? 'active-selected' : ''}" data-node-id="${m.id}" title="Click to inspect ${m.name}">
                  <span class="pin-member-type-tag" style="color: ${mColor};">${m.type}</span>
                  <span class="pin-member-name-text">${m.name}</span>
                  <button class="pin-lock-badge-btn" data-node-id="${m.id}" title="${mLocked ? 'Pin locked' : 'Pin draggable'}">${mLocked ? '🔒' : '🔓'}</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    const groupIcon = L.divIcon({
      className: 'map-pin-group-div-icon',
      html: groupHtml,
      iconSize: [iconWidth, iconHeight],
      iconAnchor: [anchorX, anchorY],
      popupAnchor: [0, -36]
    });

    let isDraggingGroup = false;
    const marker = L.marker([gLat, gLng], {
      icon: groupIcon,
      draggable: !isGroupLocked,
      zIndexOffset: isAnyMemberSelected ? 1200 : 300
    });

    marker.on('dragstart', () => {
      isDraggingGroup = true;
    });

    marker.on('drag', () => {
      const curPos = marker.getLatLng();
      group.lat = curPos.lat;
      group.lng = curPos.lng;
      members.forEach(m => {
        state.graphMapConfig.nodeGeoPositions[m.id] = { lat: curPos.lat, lng: curPos.lng };
      });
      updateConnectedPolylines(members.map(m => m.id));
    });

    marker.on('dragend', () => {
      const curPos = marker.getLatLng();
      group.lat = curPos.lat;
      group.lng = curPos.lng;
      members.forEach(m => {
        setNodeGeoPosition(m.id, curPos.lat, curPos.lng);
      });
      saveMapConfig(state.graphMapConfig);
      showToast(`📍 Moved group (${members.length} pins)`);
      setTimeout(() => { isDraggingGroup = false; }, 80);
    });

    marker.addTo(leafletMarkersGroup);

    // Event delegation for internal buttons & member clicks
    requestAnimationFrame(() => {
      const mEl = marker.getElement();
      if (mEl) {
        // Ungroup button
        const ungroupBtn = mEl.querySelector('.pin-ungroup-btn');
        if (ungroupBtn) {
          ungroupBtn.onclick = (e) => {
            e.stopPropagation();
            removeMarkerGroup(group.id);
            showToast('Ungrouped pins');
          };
        }

        // Lock buttons
        const lockBtns = mEl.querySelectorAll('.pin-lock-badge-btn');
        lockBtns.forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const nid = btn.getAttribute('data-node-id');
            if (nid) {
              togglePinLock(nid);
              showToast(isPinLocked(nid) ? '🔒 Locked pin' : '🔓 Unlocked pin');
            }
          };
        });

        // Member head & row clicks (only fires if not actively dragging)
        const clickableItems = mEl.querySelectorAll('[data-node-id]');
        clickableItems.forEach(item => {
          item.onclick = (e) => {
            if (isDraggingGroup) return;
            if (e.target.closest('.pin-lock-badge-btn') || e.target.closest('.pin-ungroup-btn')) return;
            e.stopPropagation();
            const nid = item.getAttribute('data-node-id');
            if (nid) {
              state.selected = nid;
              notifyStateChange();
              const ent = members.find(m => m.id === nid);
              if (ent) showToast(`Selected ${ent.name}`);
            }
          };
          item.ondblclick = (e) => {
            if (isDraggingGroup) return;
            e.stopPropagation();
            const nid = item.getAttribute('data-node-id');
            if (nid) openEntityProfile(nid);
          };
        });
      }
    });
  });

  // 3. Render Ungrouped Individual Pins
  ungroupedNodes.forEach((entity) => {
    const geo = state.graphMapConfig.nodeGeoPositions[entity.id];
    const nodeLocked = isPinLocked(entity.id);
    const typeColor = objectTypeColors[entity.type] || '#1E293B';
    const typeIcon = objectTypeIcons[entity.type] || 'shield';
    const isSelected = state.selected === entity.id;
    const isSeed = state.graphExploration?.seedId === entity.id;
    const isCheckedForGroup = selectedForGroup.has(entity.id);
    const allLinks = getConnectedLinks(entity.id);
    const unexploredCount = allLinks.filter(l => !visibleIds.has(l.partner.id)).length;

    // Pin HTML
    const pinHtml = `
      <div class="map-tactical-pin ${isSelected ? 'selected' : ''} ${isSeed ? 'seed' : ''} ${nodeLocked ? 'locked' : 'draggable'} ${isGroupingMode ? 'grouping-selectable' : ''} ${isCheckedForGroup ? 'selected-for-group' : ''}">
        ${isGroupingMode ? `<div class="pin-group-select-badge ${isCheckedForGroup ? 'checked' : ''}">${isCheckedForGroup ? '✓' : '+'}</div>` : ''}
        <div class="pin-circle" style="background: ${typeColor};">
          <span class="pin-icon">${icon(typeIcon)}</span>
          ${unexploredCount > 0 ? `<span class="pin-badge">+${unexploredCount}</span>` : ''}
          <span class="pin-risk-dot ${entity.risk || 'low'}"></span>
        </div>
        <div class="pin-needle" style="border-top-color: ${typeColor};"></div>
        <div class="pin-shadow"></div>
        <div class="pin-label-pill">
          <span class="pin-label-type">${entity.type}</span>
          <span class="pin-label-name">${entity.name}</span>
          ${!isGroupingMode ? `
            <button class="pin-lock-badge-btn" data-node-id="${entity.id}" title="${nodeLocked ? 'Pin locked in place. Click to unlock & drag' : 'Pin draggable. Click to lock in place'}">
              ${nodeLocked ? '🔒' : '🔓'}
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'map-pin-div-icon',
      html: pinHtml,
      iconSize: [32, 42],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34]
    });

    let isDraggingPin = false;
    const marker = L.marker([geo.lat, geo.lng], {
      icon: customIcon,
      draggable: !nodeLocked && !isGroupingMode,
      zIndexOffset: isSelected ? 1000 : (isSeed ? 500 : 100)
    });

    marker.on('dragstart', () => {
      isDraggingPin = true;
    });

    marker.on('drag', () => {
      const curPos = marker.getLatLng();
      state.graphMapConfig.nodeGeoPositions[entity.id] = { lat: curPos.lat, lng: curPos.lng };
      updateConnectedPolylines([entity.id]);
    });

    marker.on('dragend', () => {
      const curPos = marker.getLatLng();
      setNodeGeoPosition(entity.id, curPos.lat, curPos.lng);
      showToast(`📍 Pinned ${entity.name}`);
      setTimeout(() => { isDraggingPin = false; }, 80);
    });

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (isDraggingPin) return;
      if (isGroupingMode) {
        togglePinSelectionForGrouping(entity.id);
        const count = (state.graphMapConfig.selectedForGrouping || []).length;
        showToast(`${isCheckedForGroup ? 'Deselected' : 'Selected'} ${entity.name} (${count} selected)`);
        return;
      }
      state.selected = entity.id;
      notifyStateChange();
      showToast(`Selected ${entity.name}`);
    });

    marker.on('dblclick', (e) => {
      L.DomEvent.stopPropagation(e);
      if (!isGroupingMode && !isDraggingPin) {
        openEntityProfile(entity.id);
      }
    });

    // Tooltip integration
    marker.on('mouseover', () => {
      if (isGroupingMode || isDraggingPin) return;
      let tooltipEl = document.getElementById('graphNodeTooltip');
      if (!tooltipEl) return;

      const summary = getEntityHoverSummary(entity);
      const links = getConnectedLinks(entity.id);

      tooltipEl.innerHTML = `
        <div class="tooltip-header">
          <span class="tooltip-type-pill" style="background:${typeColor}15;color:${typeColor};border-color:${typeColor}40">
            ${icon(typeIcon)} ${entity.type}
          </span>
          <span class="tooltip-risk-badge ${entity.risk || 'low'}">${(entity.risk || 'LOW').toUpperCase()} RISK</span>
        </div>
        <h4 class="tooltip-title">${entity.name}</h4>
        <p class="tooltip-summary">${summary}</p>
        <div class="tooltip-footer">
          <span class="tooltip-links-count">${icon('pulse')} ${links.length} Connected Links</span>
          <span class="tooltip-action-hint">${nodeLocked ? '🔒 Location locked · Click to inspect' : '📍 Drag pin to place · Click to inspect'}</span>
        </div>
      `;

      const pt = leafletMapInstance.latLngToContainerPoint(marker.getLatLng());
      const tipWidth = 280;
      let posX = pt.x + 24;
      let posY = pt.y - 60;
      if (posX + tipWidth > window.innerWidth - 380) posX = pt.x - tipWidth - 24;
      if (posY < 10) posY = 10;
      tooltipEl.style.transform = `translate(${posX}px, ${posY}px)`;
      tooltipEl.classList.add('visible');
    });

    marker.on('mouseout', () => {
      const tooltipEl = document.getElementById('graphNodeTooltip');
      if (tooltipEl) tooltipEl.classList.remove('visible');
    });

    marker.addTo(leafletMarkersGroup);
    markersMap.set(entity.id, marker);

    // Attach click event for per-pin lock toggle button
    requestAnimationFrame(() => {
      const mEl = marker.getElement();
      if (mEl) {
        const lockBtn = mEl.querySelector('.pin-lock-badge-btn');
        if (lockBtn) {
          lockBtn.onclick = (e) => {
            e.stopPropagation();
            togglePinLock(entity.id);
            showToast(isPinLocked(entity.id) ? `🔒 ${entity.name} locked on map` : `🔓 ${entity.name} unlocked (draggable)`);
          };
        }
      }
    });
  });

  // 4. Render Polylines for edges between visible nodes
  edges.forEach(edge => {
    const source = edge[0];
    const target = edge[1];
    const label = edge[2] || '';
    if (visibleIds.has(source) && visibleIds.has(target)) {
      const p1 = state.graphMapConfig.nodeGeoPositions[source];
      const p2 = state.graphMapConfig.nodeGeoPositions[target];
      if (p1 && p2) {
        // Skip self-loop or zero-distance intra-group lines
        if (p1.lat === p2.lat && p1.lng === p2.lng) {
          return;
        }

        const isConnectedToSelected = state.selected && (source === state.selected || target === state.selected);
        const polyline = L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
          color: isConnectedToSelected ? '#38BDF8' : '#94A3B8',
          weight: isConnectedToSelected ? 3.5 : 2,
          opacity: isConnectedToSelected ? 1 : 0.75,
          dashArray: isConnectedToSelected ? null : '6, 6'
        });

        if (label) {
          polyline.bindTooltip(label, {
            permanent: false,
            direction: 'center',
            className: 'tactical-edge-tooltip'
          });
        }

        polyline.addTo(leafletEdgesGroup);

        const edgeEntry = { polyline, source, target };
        if (!nodePolylinesMap.has(source)) nodePolylinesMap.set(source, new Set());
        if (!nodePolylinesMap.has(target)) nodePolylinesMap.set(target, new Set());
        nodePolylinesMap.get(source).add(edgeEntry);
        nodePolylinesMap.get(target).add(edgeEntry);
      }
    }
  });
}

export function mountLeafletMap(visibleNodes) {
  const mapContainer = document.getElementById('graph-leaflet-map');
  if (!mapContainer) return;

  try {
    if (leafletMapInstance) {
      if (leafletMarkersGroup) {
        try { leafletMapInstance.removeLayer(leafletMarkersGroup); } catch (e) {}
        leafletMarkersGroup = null;
      }
      if (leafletEdgesGroup) {
        try { leafletMapInstance.removeLayer(leafletEdgesGroup); } catch (e) {}
        leafletEdgesGroup = null;
      }
      try { leafletMapInstance.remove(); } catch (e) {}
      leafletMapInstance = null;
    }
    if (mapContainer._leaflet_id) {
      delete mapContainer._leaflet_id;
    }

    const { lat, lng, zoom, layerType } = state.graphMapConfig || {};

    leafletMapInstance = L.map(mapContainer, {
      center: [lat || 18.5204, lng || 73.8567],
      zoom: zoom || 14,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: true,
      touchZoom: true,
      wheelDebounceTime: 30,
      wheelPxPerZoomLevel: 50
    });

    applyMapLockState();

    updateLeafletTileLayer(layerType || 'satellite');

    if (visibleNodes && visibleNodes.length > 0) {
      renderSatelliteMapPins(visibleNodes);
    }

    // Prevent container scrolling or upward jump on focus
    mapContainer.addEventListener('mousedown', () => {
      const mainArea = document.querySelector('.main-area');
      if (mainArea && mainArea.scrollTop !== 0) {
        mainArea.scrollTop = 0;
      }
    }, { capture: true, passive: true });

    mapContainer.addEventListener('touchstart', () => {
      const mainArea = document.querySelector('.main-area');
      if (mainArea && mainArea.scrollTop !== 0) {
        mainArea.scrollTop = 0;
      }
    }, { capture: true, passive: true });

    leafletMapInstance.on('moveend', () => {
      if (!leafletMapInstance) return;
      const center = leafletMapInstance.getCenter();
      const curZoom = leafletMapInstance.getZoom();
      state.graphMapConfig.lat = center.lat;
      state.graphMapConfig.lng = center.lng;
      state.graphMapConfig.zoom = curZoom;
      saveMapConfig(state.graphMapConfig);
    });

    setTimeout(() => {
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
      const mainArea = document.querySelector('.main-area');
      if (mainArea && mainArea.scrollTop !== 0) mainArea.scrollTop = 0;
    }, 50);
  } catch (err) {
    console.warn('Leaflet map initialization notice:', err);
  }
}

export const objectTypeColors = {
  Person: '#1E293B',
  Phone: '#0D9488',
  Vehicle: '#D97706',
  Bank: '#2563EB',
  'FIR Case': '#DC2626',
  Location: '#7C3AED',
  Organization: '#059669',
  Entity: '#475569'
};

export const objectTypeIcons = {
  Person: 'user',
  Phone: 'pulse',
  Vehicle: 'grid',
  Bank: 'database',
  'FIR Case': 'file',
  Location: 'network',
  Organization: 'shield',
  Entity: 'shield'
};

export function getEntityHoverSummary(entity) {
  if (!entity) return '';

  const role = entity.role || entity.local || '';
  const city = entity.city ? `(${entity.city})` : '';

  if (entity.type === 'Vehicle') {
    const make = entity.identifiers?.make || entity.local || 'Vehicle';
    const color = entity.identifiers?.color ? `${entity.identifiers.color} ` : '';
    const anpr = entity.identifiers?.anprHits ? ` · Flagged: ${entity.identifiers.anprHits}` : '';
    return `${role ? role + ': ' : ''}${color}${make}${anpr || (entity.city ? ` in ${entity.city}` : '')}.`;
  }

  if (entity.type === 'Phone') {
    const carrier = entity.identifiers?.carrier ? ` (${entity.identifiers.carrier})` : '';
    const loc = entity.identifiers?.activeLocation || entity.city || '';
    return `${role || 'Suspect Burner Mobile'}${carrier}${loc ? ` active in ${loc}` : ''}. Used in syndicate extortion & hawala coordination.`;
  }

  if (entity.type === 'Bank') {
    const bankName = entity.identifiers?.bankName || '';
    const status = entity.identifiers?.status ? ` · ${entity.identifiers.status}` : '';
    return `${role || 'Layering Mule Account'}${bankName ? ` at ${bankName}` : ''}${status}.`;
  }

  if (entity.type === 'FIR Case') {
    const sec = entity.identifiers?.sections ? ` (Sections: ${entity.identifiers.sections})` : '';
    const amt = entity.identifiers?.defraudedAmount ? ` · Amount: ${entity.identifiers.defraudedAmount}` : '';
    return `${role || 'Police FIR Dossier'}${sec}${amt} registered at ${entity.city || 'Command'}.`;
  }

  if (entity.type === 'Location') {
    const latLong = entity.identifiers?.latLong ? ` [${entity.identifiers.latLong}]` : '';
    const callers = entity.identifiers?.callersIdentified ? ` · ${entity.identifiers.callersIdentified} logged CDR intersections` : '';
    return `${role || 'Cell Tower Sector'}${latLong}${callers} in ${entity.city || 'target sector'}.`;
  }

  if (entity.type === 'Organization') {
    const cin = entity.identifiers?.cin ? ` [CIN: ${entity.identifiers.cin}]` : '';
    const dir = entity.identifiers?.directors ? ` · Directors: ${entity.identifiers.directors}` : '';
    return `${role || 'Corporate Front'}${cin}${dir} in ${entity.city || 'Commercial Zone'}.`;
  }

  // Person
  const alias = entity.identifiers?.alias || entity.local;
  const aliasText = (alias && alias !== entity.name && alias !== 'Complainant') ? ` (Alias: ${alias})` : '';
  const status = entity.identifiers?.status ? ` · ${entity.identifiers.status}` : '';
  return `${role || 'Syndicate Operative'}${aliasText}${city ? ` ${city}` : ''}${status}.`;
}

export function getConnectedLinks(entityId) {
  const links = [];
  edges.forEach(edge => {
    const source = edge[0];
    const target = edge[1];
    const relLabel = edge[2] || 'Connected Link';
    if (source === entityId) {
      const targetEntity = entities.find(x => x.id === target);
      if (targetEntity) {
        links.push({ partner: targetEntity, relation: relLabel, direction: 'outgoing' });
      }
    } else if (target === entityId) {
      const sourceEntity = entities.find(x => x.id === source);
      if (sourceEntity) {
        links.push({ partner: sourceEntity, relation: relLabel, direction: 'incoming' });
      }
    }
  });
  return links;
}


export function graphContainer(visibleNodes) {
  const isSat = !!state.graphSatelliteMode;
  const isLocked = !!state.graphMapConfig?.locked;

  if (visibleNodes.length === 0) {
    return el('div', { class: `sigma-container empty-graph-shell ${isSat ? 'satellite-active' : ''}` }, [
      el('div', { class: 'empty-shell-content' }, [
        el('span', { class: 'empty-shell-icon' }, [icon('network')]),
        el('strong', {}, ['No Entities in Active Exploration']),
        el('p', { class: 'muted' }, ['Select a focal seed entity above to begin progressive graph investigation.'])
      ])
    ]);
  }
  return el('div', {
    class: `sigma-container ${isSat ? 'satellite-active' : ''} ${isSat && !isLocked ? 'map-nav-mode' : ''}`,
    'data-graph-count': String(visibleNodes.length)
  }, [
    el('div', { class: 'graph-node-tooltip', id: 'graphNodeTooltip' })
  ]);
}

export function mountSigma(visibleNodes) {
  const container = document.querySelector('.sigma-container');
  if (!container || container.classList.contains('empty-graph-shell')) {
    if (sigmaInstance) {
      sigmaInstance.kill();
      sigmaInstance = null;
      currentGraph = null;
    }
    if (leafletMapInstance) {
      if (leafletMarkersGroup) {
        try { leafletMapInstance.removeLayer(leafletMarkersGroup); } catch (e) {}
        leafletMarkersGroup = null;
      }
      if (leafletEdgesGroup) {
        try { leafletMapInstance.removeLayer(leafletEdgesGroup); } catch (e) {}
        leafletEdgesGroup = null;
      }
      try { leafletMapInstance.remove(); } catch (e) {}
      leafletMapInstance = null;
    }
    return;
  }

  const isSat = !!state.graphSatelliteMode;
  if (isSat) {
    mountLeafletMap(visibleNodes);
    return;
  } else if (leafletMapInstance) {
    if (leafletMarkersGroup) {
      try { leafletMapInstance.removeLayer(leafletMarkersGroup); } catch (e) {}
      leafletMarkersGroup = null;
    }
    if (leafletEdgesGroup) {
      try { leafletMapInstance.removeLayer(leafletEdgesGroup); } catch (e) {}
      leafletEdgesGroup = null;
    }
    try { leafletMapInstance.remove(); } catch (e) {}
    leafletMapInstance = null;
  }

  const seedId = state.graphExploration?.seedId;
  const isFocused = state.graphExploration?.mode === 'focused';
  const visibleIds = new Set(visibleNodes.map(n => n.id));

  // If Sigma is already mounted and running in this container, update graph in-place without canvas teardown!
  if (sigmaInstance && currentGraph && container.querySelector('.sigma-stage')) {
    // 1. Drop nodes no longer visible
    currentGraph.nodes().forEach(nodeId => {
      if (!visibleIds.has(nodeId)) {
        currentGraph.dropNode(nodeId);
      }
    });

    // 2. Add new nodes or update existing node attributes
    visibleNodes.forEach((entity, index) => {
      const isSeed = entity.id === seedId;
      const isSelected = state.selected === entity.id;
      const nodeColor = objectTypeColors[entity.type] || riskColor[entity.risk] || (isSat ? '#38BDF8' : '#1E293B');
      const allLinks = getConnectedLinks(entity.id);
      const unexploredCount = allLinks.filter(l => !visibleIds.has(l.partner.id)).length;

      let nodeLabel = `[${entity.type}] ${entity.name}`;
      if (unexploredCount > 0) {
        nodeLabel += ` (+${unexploredCount})`;
      }

      let nodeSize = 8 + (entity.degree || 0) * 0.8;
      if (isSeed) nodeSize = 15;
      else if (isSelected) nodeSize = 12;

      if (currentGraph.hasNode(entity.id)) {
        currentGraph.mergeNodeAttributes(entity.id, {
          label: nodeLabel,
          size: nodeSize,
          color: isSelected ? (isSat ? '#38BDF8' : '#2563EB') : nodeColor,
          isSeed,
          isSelected,
          unexploredCount
        });
      } else {
        let x = 0;
        let y = 0;
        if (state.customNodePositions && state.customNodePositions[entity.id]) {
          x = state.customNodePositions[entity.id].x;
          y = state.customNodePositions[entity.id].y;
        } else if (isFocused && isSeed) {
          x = 0;
          y = 0;
        } else if (isFocused) {
          const otherNodes = visibleNodes.filter(n => n.id !== seedId);
          const posIndex = otherNodes.findIndex(n => n.id === entity.id);
          const totalOthers = Math.max(otherNodes.length, 1);
          const angle = (posIndex / totalOthers) * Math.PI * 2;
          const radius = 0.35 + (posIndex % 2) * 0.12;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
        } else {
          const angle = (index / Math.max(visibleNodes.length, 1)) * Math.PI * 2;
          const radius = 0.28 + (index % 3) * 0.14;
          x = entity.x ? entity.x / 700 - 0.5 : Math.cos(angle) * radius;
          y = entity.y ? entity.y / 520 - 0.5 : Math.sin(angle) * radius;
        }

        currentGraph.addNode(entity.id, {
          label: nodeLabel,
          x,
          y,
          size: nodeSize,
          color: isSelected ? (isSat ? '#38BDF8' : '#2563EB') : nodeColor,
          risk: entity.risk,
          entityId: entity.id,
          entityType: entity.type,
          isSeed,
          isSelected,
          unexploredCount
        });
      }
    });

    // 3. Update / add edges
    edges.forEach((edge) => {
      const source = edge[0];
      const target = edge[1];
      const label = edge[2] || '';
      if (visibleIds.has(source) && visibleIds.has(target)) {
        const isConnectedToSelected = state.selected && (source === state.selected || target === state.selected);
        const activeEdgeColor = isSat ? '#38BDF8' : '#2563EB';
        const defaultEdgeColor = isSat ? '#94A3B8' : '#CBD5E1';
        if (!currentGraph.hasEdge(source, target)) {
          currentGraph.addEdge(source, target, {
            color: isConnectedToSelected ? activeEdgeColor : defaultEdgeColor,
            size: isConnectedToSelected ? 2.5 : 1.2,
            type: 'line',
            label
          });
        } else {
          currentGraph.mergeEdgeAttributes(source, target, {
            color: isConnectedToSelected ? activeEdgeColor : defaultEdgeColor,
            size: isConnectedToSelected ? 2.5 : 1.2
          });
        }
      }
    });

    sigmaInstance.refresh();
    return;
  }

  // Initial setup when canvas is newly rendered
  sigmaInstance?.kill();
  const graph = new Graph();
  currentGraph = graph;

  visibleNodes.forEach((entity, index) => {
    const isSeed = entity.id === seedId;
    const isSelected = state.selected === entity.id;
    const nodeColor = objectTypeColors[entity.type] || riskColor[entity.risk] || (isSat ? '#38BDF8' : '#1E293B');

    let x = 0;
    let y = 0;

    if (state.customNodePositions && state.customNodePositions[entity.id]) {
      x = state.customNodePositions[entity.id].x;
      y = state.customNodePositions[entity.id].y;
    } else if (isFocused && isSeed) {
      x = 0;
      y = 0;
    } else if (isFocused) {
      const otherNodes = visibleNodes.filter(n => n.id !== seedId);
      const posIndex = otherNodes.findIndex(n => n.id === entity.id);
      const totalOthers = Math.max(otherNodes.length, 1);
      const angle = (posIndex / totalOthers) * Math.PI * 2;
      const radius = 0.35 + (posIndex % 2) * 0.12;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    } else {
      const angle = (index / Math.max(visibleNodes.length, 1)) * Math.PI * 2;
      const radius = 0.28 + (index % 3) * 0.14;
      x = entity.x ? entity.x / 700 - 0.5 : Math.cos(angle) * radius;
      y = entity.y ? entity.y / 520 - 0.5 : Math.sin(angle) * radius;
    }

    const allLinks = getConnectedLinks(entity.id);
    const unexploredCount = allLinks.filter(l => !visibleIds.has(l.partner.id)).length;

    let nodeLabel = `[${entity.type}] ${entity.name}`;
    if (unexploredCount > 0) {
      nodeLabel += ` (+${unexploredCount})`;
    }

    let nodeSize = 8 + (entity.degree || 0) * 0.8;
    if (isSeed) nodeSize = 15;
    else if (isSelected) nodeSize = 12;

    graph.addNode(entity.id, {
      label: nodeLabel,
      x,
      y,
      size: nodeSize,
      color: isSelected ? (isSat ? '#38BDF8' : '#2563EB') : nodeColor,
      risk: entity.risk,
      entityId: entity.id,
      entityType: entity.type,
      isSeed,
      isSelected,
      unexploredCount
    });
  });

  edges.forEach((edge) => {
    const source = edge[0];
    const target = edge[1];
    const label = edge[2] || '';
    if (visibleIds.has(source) && visibleIds.has(target) && !graph.hasEdge(source, target)) {
      const isConnectedToSelected = state.selected && (source === state.selected || target === state.selected);
      const activeEdgeColor = isSat ? '#38BDF8' : '#2563EB';
      const defaultEdgeColor = isSat ? '#94A3B8' : '#CBD5E1';
      graph.addEdge(source, target, {
        color: isConnectedToSelected ? activeEdgeColor : defaultEdgeColor,
        size: isConnectedToSelected ? 2.5 : 1.2,
        type: 'line',
        label
      });
    }
  });

  sigmaInstance = new Sigma(graph, container, {
    renderLabels: true,
    labelFont: 'Inter, system-ui, sans-serif',
    labelSize: 11,
    labelColor: { color: isSat ? '#FFFFFF' : '#0F172A' },
    defaultNodeColor: isSat ? '#38BDF8' : '#1E293B',
    defaultEdgeColor: isSat ? '#94A3B8' : '#CBD5E1',
    minCameraRatio: 0.15,
    maxCameraRatio: 5,
    allowInvalidContainer: true
  });

  // Interactive Hover Tooltip Logic
  let tooltipEl = document.getElementById('graphNodeTooltip');
  if (!tooltipEl && container) {
    tooltipEl = el('div', { class: 'graph-node-tooltip', id: 'graphNodeTooltip' });
    container.appendChild(tooltipEl);
  }

  let mousePos = { x: 0, y: 0 };
  const graphPanel = container.closest('.graph-panel') || container;

  const updateTooltipPos = (x, y) => {
    if (!tooltipEl) return;
    const rect = graphPanel.getBoundingClientRect();
    const tipWidth = 280;
    const tipHeight = 120;
    let posX = x + 16;
    let posY = y + 16;

    if (posX + tipWidth > rect.width - 12) {
      posX = x - tipWidth - 16;
    }
    if (posY + tipHeight > rect.height - 12) {
      posY = y - tipHeight - 16;
    }
    if (posX < 8) posX = 8;
    if (posY < 8) posY = 8;

    tooltipEl.style.transform = `translate(${posX}px, ${posY}px)`;
  };

  graphPanel.onmousemove = (e) => {
    const rect = graphPanel.getBoundingClientRect();
    mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    if (tooltipEl && tooltipEl.classList.contains('visible')) {
      updateTooltipPos(mousePos.x, mousePos.y);
    }
  };

  // Node Drag & Drop Logic (Controlled speed with smooth precision damping)
  let draggedNode = null;
  let isDragging = false;
  let lastMouseGraphPos = null;

  sigmaInstance.on('downNode', (e) => {
    isDragging = true;
    draggedNode = e.node;
    lastMouseGraphPos = sigmaInstance.viewportToGraph(e.event);
    container.style.cursor = 'grabbing';
    if (tooltipEl) tooltipEl.classList.remove('visible');
    e.preventSigmaDefault?.();
    sigmaInstance.getCamera().disable();
  });

  const mouseCaptor = sigmaInstance.getMouseCaptor();

  mouseCaptor.on('mousemovebody', (e) => {
    if (!isDragging || !draggedNode || !lastMouseGraphPos) return;

    // Convert mouse coordinates in viewport to graph coordinates
    const currentMouseGraphPos = sigmaInstance.viewportToGraph(e);

    // Apply speed damping multiplier to slow down movement for controlled placement
    const dragSpeedMultiplier = 0.55;
    const dx = (currentMouseGraphPos.x - lastMouseGraphPos.x) * dragSpeedMultiplier;
    const dy = (currentMouseGraphPos.y - lastMouseGraphPos.y) * dragSpeedMultiplier;

    const currentX = graph.getNodeAttribute(draggedNode, 'x') || 0;
    const currentY = graph.getNodeAttribute(draggedNode, 'y') || 0;

    const nextX = currentX + dx;
    const nextY = currentY + dy;

    graph.setNodeAttribute(draggedNode, 'x', nextX);
    graph.setNodeAttribute(draggedNode, 'y', nextY);

    lastMouseGraphPos = currentMouseGraphPos;

    // Persist custom node position
    if (!state.customNodePositions) state.customNodePositions = {};
    state.customNodePositions[draggedNode] = { x: nextX, y: nextY };

    const ent = entities.find(x => x.id === draggedNode);
    if (ent) {
      ent.x = (nextX + 0.5) * 700;
      ent.y = (nextY + 0.5) * 520;
    }
  });

  const stopDragging = () => {
    if (isDragging) {
      isDragging = false;
      draggedNode = null;
      lastMouseGraphPos = null;
      container.style.cursor = 'default';
      sigmaInstance?.getCamera().enable();
    }
  };

  mouseCaptor.on('mouseup', stopDragging);
  window.addEventListener('mouseup', stopDragging);

  sigmaInstance.on('enterNode', ({ node }) => {
    if (!isDragging) {
      container.style.cursor = 'grab';
    }

    const entity = entities.find(e => e.id === node);
    if (!entity || !tooltipEl || isDragging) return;

    const typeColor = objectTypeColors[entity.type] || '#1E293B';
    const typeIcon = objectTypeIcons[entity.type] || 'shield';
    const summary = getEntityHoverSummary(entity);
    const links = getConnectedLinks(entity.id);

    tooltipEl.innerHTML = '';
    tooltipEl.append(
      el('div', { class: 'tooltip-header' }, [
        el('span', { class: 'tooltip-type-pill', style: `background:${typeColor}15;color:${typeColor};border-color:${typeColor}40` }, [
          icon(typeIcon),
          ` ${entity.type}`
        ]),
        el('span', { class: `tooltip-risk-badge ${entity.risk || 'low'}` }, [`${(entity.risk || 'LOW').toUpperCase()} RISK`])
      ]),
      el('h4', { class: 'tooltip-title' }, [entity.name]),
      el('p', { class: 'tooltip-summary' }, [summary]),
      el('div', { class: 'tooltip-footer' }, [
        el('span', { class: 'tooltip-links-count' }, [icon('pulse'), ` ${links.length} Connected Links`]),
        el('span', { class: 'tooltip-action-hint' }, ['Drag to move · Click to inspect'])
      ])
    );

    tooltipEl.classList.add('visible');
    updateTooltipPos(mousePos.x, mousePos.y);
  });

  sigmaInstance.on('leaveNode', () => {
    if (!isDragging) {
      container.style.cursor = 'default';
    }
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
    }
  });

  sigmaInstance.on('clickNode', ({ node }) => {
    state.selected = node;
    notifyStateChange();
  });

  sigmaInstance.on('doubleClickNode', (e) => {
    e.preventSigmaDefault?.();
    if (e.node) {
      openEntityProfile(e.node);
    }
  });

  requestAnimationFrame(() => {
    sigmaInstance?.refresh();
  });
}

export function renderGraphInspector(entity, allEntities, visibleIds) {
  const currentTab = state.graphSideTab || 'dossier';

  const setTab = (tab) => {
    state.graphSideTab = tab;
    notifyStateChange();
  };

  const connectedLinks = entity ? getConnectedLinks(entity.id) : [];

  // Segmented Header
  const tabsHeader = el('div', { class: 'inspector-header' }, [
    el('div', { class: 'inspector-title-row' }, [
      el('div', { class: 'inspector-title-wrap' }, [
        icon('shield'),
        el('span', { class: 'inspector-title' }, [t('intelligenceInspector')])
      ]),
      entity ? el('span', { class: 'inspector-live-dot', title: 'Target locked' }, ['● ACTIVE']) : null
    ].filter(Boolean)),
    el('div', { class: 'inspector-tabs' }, [
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'dossier' ? 'active' : ''}`,
        onclick: () => setTab('dossier')
      }, [icon('user'), ` ${t('dossier')}`]),
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'links' ? 'active' : ''}`,
        onclick: () => setTab('links')
      }, [icon('network'), ` ${t('links')} (${connectedLinks.length})`]),
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'directory' ? 'active' : ''}`,
        onclick: () => setTab('directory')
      }, [icon('grid'), ` ${t('directory')} (${allEntities.length})`])
    ])
  ]);

  let tabBody = null;

  if (currentTab === 'dossier') {
    if (!entity) {
      tabBody = el('div', { class: 'inspector-empty-state' }, [
        el('div', { class: 'inspector-empty-icon' }, [icon('network')]),
        el('h4', {}, [t('noResults')]),
        el('p', { class: 'muted' }, [t('clickEntityToGenerate')])
      ]);
    } else {
      const typeColor = objectTypeColors[entity.type] || '#1E293B';
      const typeIcon = objectTypeIcons[entity.type] || 'shield';
      const isSeed = state.graphExploration?.seedId === entity.id;
      const isExpanded = (state.graphExploration?.expandedNodeIds || []).includes(entity.id);
      const summaryText = getEntityHoverSummary(entity);

      // Hero Card
      const heroCard = el('div', { class: 'inspector-hero-card' }, [
        el('div', { class: 'inspector-hero-top' }, [
          el('div', { class: 'inspector-avatar', style: `background:${typeColor}15;color:${typeColor}` }, [icon(typeIcon)]),
          el('div', { class: 'inspector-hero-main' }, [
            el('div', { class: 'inspector-pill-row' }, [
              el('span', { class: 'inspector-type-pill', style: `background:${typeColor}15;color:${typeColor}` }, [entity.type]),
              el('span', { class: `risk-badge ${entity.risk || 'low'}` }, [`${(entity.risk || 'LOW').toUpperCase()} ${t('risk').toUpperCase()}`])
            ].filter(Boolean)),
            el('h3', { class: 'inspector-entity-name' }, [entity.name]),
            el('p', { class: 'inspector-entity-sub' }, [entity.role || entity.local || `${entity.type} Record`])
          ])
        ]),

        // Situational Summary Card
        el('div', { class: 'inspector-sitrep-box' }, [
          el('div', { class: 'sitrep-header' }, [
            icon('sparkle'),
            el('strong', {}, [t('situationalSummary')])
          ]),
          el('p', { class: 'sitrep-text' }, [summaryText])
        ]),

        // Quick Stats
        el('div', { class: 'inspector-stats-row' }, [
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, [t('directLinks')]),
            el('strong', { class: 'stat-val' }, [String(connectedLinks.length)])
          ]),
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, [t('activityRank')]),
            el('strong', { class: 'stat-val' }, [`${entity.recent || 50}%`])
          ]),
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, [t('riskLevel')]),
            el('strong', { class: `stat-val risk-${entity.risk || 'low'}` }, [(entity.risk || 'LOW').toUpperCase()])
          ])
        ]),

        // Actions Row
        el('div', { class: 'inspector-actions-row' }, [
          el('button', {
            class: 'inspector-action-btn primary',
            title: 'Open full investigative profile & timeline',
            onclick: () => {
              openEntityProfile(entity.id);
              showToast(`Opening profile for ${entity.name}`);
            }
          }, [icon('user'), ` ${t('fullProfile')} →`]),
          el('button', {
            class: 'inspector-action-btn',
            title: 'Scan AI linkages and syndicate patterns',
            onclick: () => {
              const query = entity.phone || entity.identifiers?.registration || entity.identifiers?.account || entity.name;
              state.aiAnalysis.query = query;
              state.aiAnalysis.streamType = 'all';
              performAIAnalysis(query, 'all');
              state.view = 'ai_analysis';
              notifyStateChange();
              showToast(`Scanning linkages for ${entity.name}...`);
            }
          }, [icon('sparkle'), ' AI Scan']),
          state.graphSatelliteMode ? el('button', {
            class: `inspector-action-btn ${isPinLocked(entity.id) ? 'btn-pin-locked' : 'btn-pin-unlocked'}`,
            title: isPinLocked(entity.id) ? 'Pin is locked in place. Click to allow dragging.' : 'Pin can be dragged to any location. Click to lock in place.',
            onclick: () => {
              togglePinLock(entity.id);
              showToast(isPinLocked(entity.id) ? `🔒 ${entity.name} locked on map` : `🔓 ${entity.name} unlocked (draggable)`);
            }
          }, [isPinLocked(entity.id) ? '🔒 Pin: Locked' : '🔓 Pin: Moveable']) : null,
          state.graphSatelliteMode ? el('button', {
            class: 'inspector-action-btn',
            title: 'Center satellite map view on this pinned entity',
            onclick: () => {
              const geo = state.graphMapConfig?.nodeGeoPositions?.[entity.id];
              if (geo && leafletMapInstance) {
                leafletMapInstance.flyTo([geo.lat, geo.lng], 16, { duration: 0.8 });
                showToast(`Centered map on ${entity.name}`);
              }
            }
          }, [icon('network'), ' 📍 Focus Pin']) : null,
          isExpanded ? el('button', {
            class: 'inspector-action-btn',
            title: 'Collapse 1-hop branch',
            onclick: () => {
              collapseGraphNode(entity.id);
              showToast(`Collapsed ${entity.name}`);
            }
          }, [icon('close'), ' Collapse']) : el('button', {
            class: 'inspector-action-btn highlight',
            title: 'Expand 1-hop connections onto canvas',
            onclick: () => {
              expandGraphNode(entity.id);
              showToast(`Expanded ${entity.name}`);
            }
          }, [icon('plus'), ' Expand'])
        ])
      ]);

      // Evidence & Identifiers
      const idEntries = [];
      const ignoredKeys = new Set(['imageurl', 'image_url', 'photo', 'avatar', 'accusedimage', 'accused_image', 'lat', 'lng']);
      const addedKeys = new Set();

      if (entity.identifiers) {
        Object.entries(entity.identifiers).forEach(([k, v]) => {
          const lowerK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (ignoredKeys.has(lowerK)) return;
          if (typeof v === 'string' && (v.startsWith('data:image') || v.startsWith('http') && v.match(/\.(png|jpg|jpeg|svg|webp)/i))) return;
          if (v && !addedKeys.has(lowerK)) {
            addedKeys.add(lowerK);
            idEntries.push([k, String(v)]);
          }
        });
      }
      if (entity.phone && !addedKeys.has('phone') && !addedKeys.has('contactphone')) {
        addedKeys.add('phone');
        idEntries.push(['Contact / Phone', entity.phone]);
      }
      if (entity.city && !addedKeys.has('city') && !addedKeys.has('policejurisdiction')) {
        addedKeys.add('city');
        idEntries.push(['Police Jurisdiction', entity.city]);
      }

      const attrsCard = idEntries.length > 0 ? el('div', { class: 'inspector-card' }, [
        el('h4', { class: 'inspector-card-title' }, ['Evidence & Core Identifiers']),
        el('div', { class: 'inspector-attrs-table' }, idEntries.map(([k, v]) => el('div', { class: 'inspector-attr-row' }, [
          el('span', { class: 'attr-k' }, [k.replace(/([A-Z])/g, ' $1').toUpperCase()]),
          el('strong', { class: 'attr-v' }, [v])
        ])))
      ]) : null;

      tabBody = el('div', { class: 'inspector-scroll-body' }, [heroCard, attrsCard].filter(Boolean));
    }
  } else if (currentTab === 'links') {
    if (!entity || connectedLinks.length === 0) {
      tabBody = el('div', { class: 'inspector-empty-state' }, [
        el('div', { class: 'inspector-empty-icon' }, [icon('network')]),
        el('h4', {}, ['No Direct Links Recorded']),
        el('p', { class: 'muted' }, ['No direct relationship edges connected to this object in the intelligence database.'])
      ]);
    } else {
      const linksList = el('div', { class: 'inspector-links-list' }, connectedLinks.map(link => {
        const p = link.partner;
        const pColor = objectTypeColors[p.type] || '#1E293B';
        const pIcon = objectTypeIcons[p.type] || 'shield';
        const isVisible = visibleIds.has(p.id);

        return el('div', { class: 'inspector-link-card' }, [
          el('div', {
            class: 'link-card-click-area',
            onclick: () => {
              state.selected = p.id;
              notifyStateChange();
              showToast(`Inspecting ${p.name}`);
            }
          }, [
            el('div', { class: 'link-avatar', style: `background:${pColor}15;color:${pColor}` }, [icon(pIcon)]),
            el('div', { class: 'link-details' }, [
              el('div', { class: 'link-name-row' }, [
                el('strong', { class: 'link-name' }, [p.name]),
                el('span', { class: `p-risk-dot ${p.risk || 'low'}` })
              ]),
              el('span', { class: 'link-relation-tag' }, [link.relation]),
              el('span', { class: `link-canvas-tag ${isVisible ? 'on-canvas' : 'hidden'}` }, [
                isVisible ? '● On Canvas' : '○ Hidden from Canvas'
              ])
            ])
          ]),
          el('div', { class: 'link-card-actions' }, [
            isVisible ? el('button', {
              class: 'link-toggle-btn collapse',
              title: 'Collapse from canvas',
              onclick: (e) => {
                e.stopPropagation();
                collapseGraphNode(p.id);
                showToast(`Collapsed ${p.name}`);
              }
            }, [icon('close'), ' Hide']) : el('button', {
              class: 'link-toggle-btn expand',
              title: 'Add to canvas',
              onclick: (e) => {
                e.stopPropagation();
                expandGraphNode(p.id);
                showToast(`Expanded ${p.name}`);
              }
            }, [icon('plus'), ' Add'])
          ])
        ]);
      }));
      tabBody = el('div', { class: 'inspector-scroll-body' }, [linksList]);
    }
  } else if (currentTab === 'directory') {
    const q = (state.directorySearchQuery || '').toLowerCase().trim();
    const cat = state.directoryCategoryFilter || 'all';

    const categories = [
      { id: 'all', label: 'All' },
      { id: 'Person', label: 'Persons' },
      { id: 'Phone', label: 'Phones' },
      { id: 'Vehicle', label: 'Vehicles' },
      { id: 'Bank', label: 'Banks' },
      { id: 'Location', label: 'Cell Towers' },
      { id: 'Organization', label: 'Shell Co.' }
    ];

    const filtered = allEntities.filter(e => {
      if (cat !== 'all' && e.type !== cat) return false;
      if (!q) return true;
      const matchName = e.name.toLowerCase().includes(q);
      const matchRole = (e.role || '').toLowerCase().includes(q);
      const matchPhone = (e.phone || '').includes(q);
      const matchCity = (e.city || '').toLowerCase().includes(q);
      return matchName || matchRole || matchPhone || matchCity;
    });

    const searchInput = el('input', {
      type: 'text',
      class: 'directory-search-input',
      placeholder: 'Filter directory objects...',
      value: state.directorySearchQuery || ''
    });

    const clearBtn = el('button', {
      class: 'search-clear-btn',
      style: state.directorySearchQuery ? '' : 'display: none;',
      onclick: () => {
        state.directorySearchQuery = '';
        searchInput.value = '';
        updateDirFilter('');
      }
    }, ['✕']);

    const searchRow = el('div', { class: 'directory-search-row' }, [
      searchInput,
      clearBtn
    ]);

    const updateDirFilter = (q) => {
      state.directorySearchQuery = q;
      const cleanQ = (q || '').toLowerCase().trim();
      clearBtn.style.display = cleanQ ? 'inline-flex' : 'none';
      const rows = dirList.querySelectorAll('.dir-item-row');
      let visCount = 0;
      rows.forEach(row => {
        const text = (row.getAttribute('data-search-text') || row.textContent || '').toLowerCase();
        const matches = !cleanQ || text.includes(cleanQ);
        row.style.display = matches ? 'flex' : 'none';
        if (matches) visCount++;
      });
      const emptyBox = dirList.querySelector('.inspector-empty-state');
      if (emptyBox) {
        emptyBox.style.display = visCount === 0 ? 'flex' : 'none';
      }
    };

    searchInput.oninput = (e) => {
      updateDirFilter(e.target.value);
    };

    const categoryChips = el('div', { class: 'directory-cat-pills' }, categories.map(cItem => {
      const isAct = cat === cItem.id;
      return el('button', {
        class: `cat-pill ${isAct ? 'active' : ''}`,
        onclick: () => {
          state.directoryCategoryFilter = cItem.id;
          notifyStateChange();
        }
      }, [cItem.label]);
    }));

    const dirList = el('div', { class: 'directory-list' }, filtered.length > 0 ? filtered.map(item => {
      const isSel = entity && entity.id === item.id;
      const isVis = visibleIds.has(item.id);
      const tColor = objectTypeColors[item.type] || '#1E293B';
      const tIcon = objectTypeIcons[item.type] || 'shield';

      return el('button', {
        class: `dir-item-row ${isSel ? 'selected' : ''}`,
        'data-search-text': `${item.name} ${item.type} ${item.role || ''} ${item.city || ''} ${item.phone || ''}`.toLowerCase(),
        onclick: () => {
          state.selected = item.id;
          notifyStateChange();
          showToast(`Inspecting ${item.name}`);
        }
      }, [
        el('span', { class: 'dir-avatar', style: `background:${tColor}15;color:${tColor}` }, [icon(tIcon)]),
        el('div', { class: 'dir-info' }, [
          el('div', { class: 'dir-name-line' }, [
            el('strong', { class: 'dir-name' }, [item.name]),
            el('span', { class: `p-risk-dot ${item.risk || 'low'}` })
          ]),
          el('small', { class: 'dir-sub' }, [`${item.type} · ${item.role || item.city || ''}`])
        ]),
        el('div', { class: 'dir-badge-col' }, [
          isVis ? el('span', { class: 'dir-canvas-dot active', title: 'On Canvas' }, ['●']) : el('span', { class: 'dir-canvas-dot dim', title: 'Hidden' }, ['○']),
          el('span', { class: 'dir-degree' }, [String(getConnectedLinks(item.id).length)])
        ])
      ]);
    }) : [
      el('div', { class: 'inspector-empty-state small' }, [
        el('p', { class: 'muted' }, ['No matching objects found.'])
      ])
    ]);

    tabBody = el('div', { class: 'inspector-scroll-body' }, [searchRow, categoryChips, dirList]);
  }

  return el('aside', { class: 'entity-panel graph-inspector' }, [tabsHeader, tabBody]);
}

// --------------------------------------------------------------------------
// INVESTIGATION LAUNCHPAD MENU VIEW (Before graph generation)
// --------------------------------------------------------------------------
export function renderInvestigationLaunchpad(c) {
  const analyticalEntities = graphMetrics(entities, edges);

  const firEntities = firCases.map(fc => {
    const mainSubject = entities.find(e => e.name.toLowerCase() === (fc.subject_name || fc.subjectName || '').toLowerCase());
    return {
      id: fc.id,
      targetEntityId: mainSubject ? mainSubject.id : (entities.length > 0 ? entities[0].id : null),
      name: fc.fir_number || fc.firNumber,
      type: 'FIR Case',
      role: `Registered FIR · ${fc.police_station || fc.policeStation || 'Cyber Crime PS'}`,
      local: `Subject: ${fc.subject_name || fc.subjectName || 'Dossier'}`,
      phone: fc.phone || '',
      city: fc.district || 'Maharashtra',
      risk: 'high',
      recent: 96,
      identifiers: {
        sections: fc.sections,
        station: fc.police_station || fc.policeStation,
        date: fc.incident_date || fc.incidentDate,
        accused: fc.subject_name || fc.subjectName
      },
      isFIR: true,
      firData: fc
    };
  });

  const totalCases = firCases.length;
  const totalPersons = entities.filter(e => e.type === 'Person').length;
  const totalVehicles = entities.filter(e => e.type === 'Vehicle').length;
  const totalPhones = entities.filter(e => e.type === 'Phone').length;
  const totalBanks = entities.filter(e => e.type === 'Bank').length;
  const totalTowers = entities.filter(e => e.type === 'Location').length;
  const totalOrgs = entities.filter(e => e.type === 'Organization').length;

  const allLaunchpadItems = [...analyticalEntities, ...firEntities];

  const filtered = allLaunchpadItems.filter(e => {
    const matchType = state.type === 'all' || e.type.toLowerCase() === state.type.toLowerCase();
    const q = (state.query || '').toLowerCase().trim();
    if (!q) return matchType;

    const matchName = e.name.toLowerCase().includes(q);
    const matchRole = (e.role || '').toLowerCase().includes(q);
    const matchLocal = (e.local || '').toLowerCase().includes(q);
    const matchPhone = (e.phone || '').includes(q);
    const matchCity = (e.city || '').toLowerCase().includes(q);
    const matchIdentifiers = e.identifiers
      ? Object.values(e.identifiers).some(v => String(v).toLowerCase().includes(q))
      : false;

    return matchType && (matchName || matchRole || matchLocal || matchPhone || matchCity || matchIdentifiers);
  });

  const rank = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'connections') return (b.degree || 0) - (a.degree || 0);
    if (state.sort === 'recent') return (b.recent || 0) - (a.recent || 0);
    return (rank[a.risk] || 2) - (rank[b.risk] || 2);
  });

  const launchpad = el('div', { class: 'investigation-launchpad-container' });

  // Top Page Heading
  const heading = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, [t('intelligenceInvestigationCommand')]),
      el('h1', {}, [t('investigationLaunchpad')]),
      el('p', { class: 'muted' }, [
        t('investigationLaunchpadDesc')
      ])
    ]),
    el('div', { class: 'heading-actions' }, [
      el('button', {
        class: 'outline-btn',
        onclick: () => { state.view = 'fir'; notifyStateChange(); }
      }, [icon('file'), ` ${t('newFIRIntake')}`])
    ])
  ]);

  // Fast Category Statistics Pills
  const categoryStats = el('div', { class: 'launchpad-stats-row' }, [
    { type: 'all', label: t('allRecords'), count: allLaunchpadItems.length, iconName: 'shield', color: '#0F172A' },
    { type: 'fir case', label: t('firCases'), count: totalCases, iconName: 'file', color: objectTypeColors['FIR Case'] },
    { type: 'person', label: t('suspectsPersons'), count: totalPersons, iconName: 'user', color: objectTypeColors.Person },
    { type: 'vehicle', label: t('vehicles'), count: totalVehicles, iconName: 'grid', color: objectTypeColors.Vehicle },
    { type: 'phone', label: t('phonesSims'), count: totalPhones, iconName: 'pulse', color: objectTypeColors.Phone },
    { type: 'bank', label: t('muleAccounts'), count: totalBanks, iconName: 'database', color: objectTypeColors.Bank },
    { type: 'location', label: t('cellTowers'), count: totalTowers, iconName: 'network', color: objectTypeColors.Location },
    { type: 'organization', label: t('shellCompanies'), count: totalOrgs, iconName: 'shield', color: objectTypeColors.Organization }
  ].map(cat => {
    const isSelected = state.type.toLowerCase() === cat.type.toLowerCase();
    const card = el('button', {
      class: `launchpad-stat-card ${isSelected ? 'active' : ''}`,
      onclick: () => {
        state.type = cat.type;
        notifyStateChange();
      }
    }, [
      el('div', { class: 'stat-card-icon', style: `background:${cat.color}15;color:${cat.color}` }, [icon(cat.iconName)]),
      el('div', { class: 'stat-card-text' }, [
        el('strong', { class: 'stat-card-count' }, [String(cat.count)]),
        el('span', { class: 'stat-card-label' }, [cat.label])
      ])
    ]);
    return card;
  }));

  // Universal Search & Filter Box
  const searchInput = el('input', {
    type: 'text',
    class: 'launchpad-search-input',
    placeholder: t('searchLaunchpadPlaceholder'),
    value: state.query || ''
  });

  const clearBtn = el('button', {
    class: 'search-clear-btn',
    style: state.query ? '' : 'display: none;',
    onclick: () => {
      state.query = '';
      searchInput.value = '';
      updateLaunchpadFilter('');
    }
  }, ['✕']);

  const sortOptions = [
    ['connections', t('sortByConnections')],
    ['risk', t('sortByRisk')],
    ['name', t('sortByName')],
    ['recent', t('sortByRecent')]
  ];
  const sortSelect = el('select', { class: 'filter-select' }, sortOptions.map(([v, l]) => {
    const o = el('option', { value: v }, [l]);
    o.selected = v === state.sort;
    return o;
  }));
  sortSelect.onchange = (e) => {
    state.sort = e.target.value;
    notifyStateChange();
  };

  const searchToolbar = el('div', { class: 'launchpad-search-toolbar' }, [
    el('div', { class: 'launchpad-search-wrapper' }, [
      el('span', { class: 'search-lens-icon' }, [icon('search')]),
      searchInput,
      clearBtn
    ]),
    el('div', { class: 'launchpad-sort-group' }, [
      el('span', { class: 'toolbar-label' }, [`${t('filter')}:`]),
      sortSelect
    ])
  ]);

  // Results Grid
  const countPill = el('span', { class: 'results-count-pill' }, [`${sorted.length} ${t('matchingRecords')}`]);
  const resultsHeader = el('div', { class: 'launchpad-results-header' }, [
    el('div', { class: 'results-count-title' }, [
      el('h3', {}, [t('selectInvestigationFocalPoint')]),
      countPill
    ]),
    el('span', { class: 'results-hint' }, [t('clickEntityToGenerate')])
  ]);

  const emptyStateBox = el('div', {
    class: 'launchpad-empty-state',
    style: sorted.length === 0 ? '' : 'display: none;'
  }, [
    el('div', { class: 'empty-icon' }, [icon('search')]),
    el('h3', {}, [t('noRecordsFound')]),
    el('p', { class: 'muted empty-search-msg' }, [t('noRecordsMatching')]),
    el('button', {
      class: 'outline-btn small',
      onclick: () => {
        state.query = '';
        searchInput.value = '';
        updateLaunchpadFilter('');
      }
    }, [t('clearSearchFilter')])
  ]);

  const cardsGrid = el('div', { class: 'launchpad-cards-grid' }, [emptyStateBox]);

  sorted.forEach(item => {
    const itemColor = objectTypeColors[item.type] || '#1E293B';
    const itemIcon = objectTypeIcons[item.type] || 'shield';
    const links = item.isFIR ? (item.targetEntityId ? getConnectedLinks(item.targetEntityId) : []) : getConnectedLinks(item.id);

    // Extract key attributes snippet
    const snippets = [];
    if (item.identifiers) {
      if (item.identifiers.sections) snippets.push(`Sections: ${item.identifiers.sections}`);
      if (item.identifiers.carrier) snippets.push(`Carrier: ${item.identifiers.carrier}`);
      if (item.identifiers.make) snippets.push(`Make: ${item.identifiers.make}`);
      if (item.identifiers.bankName) snippets.push(`Bank: ${item.identifiers.bankName}`);
      if (item.identifiers.status) snippets.push(`Status: ${item.identifiers.status}`);
      if (item.identifiers.station) snippets.push(`PS: ${item.identifiers.station}`);
    }
    if (item.phone && item.type !== 'Phone') snippets.push(`Contact: ${item.phone}`);
    if (item.city) snippets.push(`Sector: ${item.city}`);

    const card = el('div', {
      class: 'launchpad-entity-card',
      'data-search-text': `${item.name} ${item.type} ${item.role || ''} ${item.local || ''} ${item.phone || ''} ${item.city || ''} ${JSON.stringify(item.identifiers || {})}`.toLowerCase(),
      onclick: () => {
        const graphTargetId = item.isFIR ? (item.targetEntityId || entities[0].id) : item.id;
        startGraphInvestigation(graphTargetId);
        showToast(`Generated network around ${item.name}`);
      }
    }, [
      el('div', { class: 'card-header-row' }, [
        el('div', { class: 'card-type-box', style: `background:${itemColor}15;color:${itemColor};border-color:${itemColor}30` }, [
          icon(itemIcon),
          ` ${item.type.toUpperCase()}`
        ]),
        el('span', { class: `risk-badge ${item.risk || 'low'}` }, [`${(item.risk || 'LOW').toUpperCase()} RISK`])
      ]),
      el('h4', { class: 'card-entity-title' }, [item.name]),
      el('p', { class: 'card-entity-role' }, [item.role || item.local || `${item.type} Record`]),
      snippets.length > 0 ? el('div', { class: 'card-snippets-row' }, snippets.slice(0, 2).map(s => el('span', { class: 'snippet-tag' }, [s]))) : null,
      el('div', { class: 'card-footer-row' }, [
        el('span', { class: 'links-count-badge' }, [
          icon('network'),
          ` ${links.length} Connected Links`
        ]),
        el('div', { class: 'card-btn-group' }, [
          el('button', {
            class: 'primary-btn small launch-btn',
            title: 'Open network relationship graph for this entity',
            onclick: (e) => {
              e.stopPropagation();
              const graphTargetId = item.isFIR ? (item.targetEntityId || entities[0].id) : item.id;
              startGraphInvestigation(graphTargetId);
              showToast(`Generated network around ${item.name}`);
            }
          }, [icon('network'), ' Launch Graph →']),
          el('button', {
            class: 'outline-btn small launch-btn-graph',
            title: 'Inspect detailed entity profile record',
            onclick: (e) => {
              e.stopPropagation();
              if (item.isFIR) {
                state.view = 'fir';
                notifyStateChange();
              } else {
                openEntityProfile(item.id);
              }
            }
          }, ['Profile'])
        ])
      ])
    ]);

    cardsGrid.append(card);
  });

  const updateLaunchpadFilter = (q) => {
    state.query = q;
    const cleanQ = (q || '').toLowerCase().trim();
    clearBtn.style.display = cleanQ ? 'inline-flex' : 'none';

    let visCount = 0;
    const cards = cardsGrid.querySelectorAll('.launchpad-entity-card');
    cards.forEach(c => {
      const txt = (c.getAttribute('data-search-text') || c.textContent || '').toLowerCase();
      const match = !cleanQ || txt.includes(cleanQ);
      c.style.display = match ? 'flex' : 'none';
      if (match) visCount++;
    });

    countPill.textContent = `${visCount} matching entities`;
    emptyStateBox.style.display = visCount === 0 ? 'flex' : 'none';
    const msg = emptyStateBox.querySelector('.empty-search-msg');
    if (msg && cleanQ) {
      msg.textContent = `No records matching "${cleanQ}" in active intelligence database.`;
    }
  };

  searchInput.oninput = (e) => {
    updateLaunchpadFilter(e.target.value);
  };

  launchpad.append(heading, categoryStats, searchToolbar, resultsHeader, cardsGrid);
  c.append(launchpad);
}

// --------------------------------------------------------------------------
// ACTIVE NETWORK GRAPH INVESTIGATION VIEW (After entity selected)
// --------------------------------------------------------------------------
export function renderActiveNetworkWorkspace(c) {
  const isSat = !!state.graphSatelliteMode;
  const analyticalEntities = graphMetrics(entities, edges);
  const seedId = state.graphExploration?.seedId;

  // Filter visible nodes by active type filter (focal seed is kept for context)
  const visibleIds = getVisibleGraphNodeIds();
  const visibleNodes = analyticalEntities.filter(e => {
    if (!visibleIds.has(e.id)) return false;
    if (!state.type || state.type.toLowerCase() === 'all') return true;
    if (e.id === seedId) return true;
    return e.type.toLowerCase() === state.type.toLowerCase();
  });

  // Filter and sort for the directory / search list
  const filtered = analyticalEntities.filter(e => {
    const matchType = !state.type || state.type === 'all' || e.type.toLowerCase() === state.type.toLowerCase();
    const q = (state.query || '').toLowerCase();
    const matchQuery = !q ||
      e.name.toLowerCase().includes(q) ||
      (e.local && e.local.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q)) ||
      (e.role && e.role.toLowerCase().includes(q));
    return matchType && matchQuery;
  });

  const rank = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'connections') return (b.degree || 0) - (a.degree || 0);
    if (state.sort === 'recent') return (b.recent || 0) - (a.recent || 0);
    return (rank[a.risk] || 2) - (rank[b.risk] || 2);
  });

  const selectedEntity = analyticalEntities.find(x => x.id === state.selected) || (visibleNodes.length > 0 ? visibleNodes[0] : sorted[0]);
  if (selectedEntity && state.selected !== selectedEntity.id) {
    state.selected = selectedEntity.id;
  }

  const n = el('div', { class: `network-workspace ${state.graphFullscreen ? 'fullscreen' : ''}` });

  // Type filter options
  const uniqueTypes = Array.from(new Set(entities.map(e => e.type)));
  const typeOptions = [['all', 'All Object Types'], ...uniqueTypes.map(x => [x.toLowerCase(), x])];
  const typeSelect = el('select', { class: 'filter-select' }, typeOptions.map(([v, l]) => {
    const o = el('option', { value: v }, [l]);
    o.selected = v === (state.type || 'all').toLowerCase();
    return o;
  }));
  typeSelect.onchange = e => {
    state.type = e.target.value;
    notifyStateChange();
    showToast(`Filtered network to: ${e.target.options[e.target.selectedIndex].text}`);
  };

  const isFocusedMode = state.graphExploration?.mode === 'focused';

  const toggleFullscreen = () => {
    state.graphFullscreen = !state.graphFullscreen;
    document.body.classList.toggle('fullscreen-active', state.graphFullscreen);
    if (state.graphFullscreen) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    notifyStateChange();
  };

  const mapConfig = state.graphMapConfig || {};
  const isLocked = !!mapConfig.locked;
  const isMapLocked = isLocked;
  const isAllPinsLocked = !!mapConfig.pinsLockedAll;

  // Satellite-specific controls for the top strip
  let satControls = [];
  if (isSat) {
    const presetSelect = el('select', { class: 'strip-select map-preset-select', title: 'Center satellite map on predefined sector preset or search any worldwide location' }, [
      el('option', { value: '' }, ['📍 Preset Sector...']),
      el('option', { value: '__search_worldwide__' }, ['🔍 Search Any Place (World)...']),
      ...GEO_PRESETS.map(p => el('option', { value: JSON.stringify(p) }, [p.name]))
    ]);
    presetSelect.onchange = (e) => {
      const val = e.target.value;
      if (!val) return;
      if (val === '__search_worldwide__') {
        presetSelect.value = '';
        openGeoSearchModal();
        return;
      }
      try {
        const p = JSON.parse(val);
        setGraphMapLocation(p.lat, p.lng, p.zoom, p.name);
        if (leafletMapInstance) {
          leafletMapInstance.setView([p.lat, p.lng], p.zoom);
        }
        showToast(`Map centered to ${p.name}`);
      } catch (err) {}
    };

    const layerSelect = el('select', { class: 'strip-select map-layer-select', title: 'Switch satellite tile imagery layer' }, [
      el('option', { value: 'satellite' }, ['🛰 Satellite']),
      el('option', { value: 'hybrid' }, ['🗺 Hybrid']),
      el('option', { value: 'streets' }, ['🏙 Streets'])
    ]);
    layerSelect.value = mapConfig.layerType || 'satellite';
    layerSelect.onchange = (e) => {
      setGraphMapLayerType(e.target.value);
      updateLeafletTileLayer(e.target.value);
      showToast(`Map layer: ${e.target.value}`);
    };

    const pinLockBtn = el('button', {
      class: `strip-btn ${isAllPinsLocked ? 'strip-btn-locked' : 'strip-btn-unlocked'}`,
      title: isAllPinsLocked 
        ? 'All pins are locked in place at their geographic coordinates. Click to allow dragging.' 
        : 'Pins can be dragged freely. Click to lock all pins in place on the map.',
      onclick: () => {
        toggleLockAllPins();
        showToast(state.graphMapConfig.pinsLockedAll ? '🔒 All Pins Locked in Place' : '📍 Pins Draggable');
      }
    }, [isAllPinsLocked ? `🔒 ${t('pinsLocked')}` : `📍 ${t('pinsMoveable')}`]);

    const mapLockBtn = el('button', {
      class: `strip-btn ${isMapLocked ? 'strip-btn-locked' : 'strip-btn-unlocked'}`,
      title: isMapLocked 
        ? 'Map position is locked. Click to enable panning and zooming.' 
        : 'Map navigation is interactive. Click to lock position.',
      onclick: () => {
        toggleGraphMapLock();
        applyMapLockState();
        showToast(state.graphMapConfig.locked ? '🔒 Map Viewport Locked' : '🗺 Pan Map (Interactive)');
      }
    }, [isMapLocked ? `🔒 ${t('mapLockedText')}` : `🗺 ${t('panMapText')}`]);

    const isGroupingMode = !!mapConfig.groupingMode;
    const selectedGroupCount = (mapConfig.selectedForGrouping || []).length;

    let groupControlBtn;
    if (!isGroupingMode) {
      groupControlBtn = el('button', {
        class: 'strip-btn strip-group-btn',
        title: 'Group pins together into a stacked cluster on the map',
        onclick: () => {
          setMapGroupingMode(true);
          showToast('Click markers to select pins for grouping, then click Merge.');
        }
      }, [icon('grid'), ' 👥 Group']);
    } else {
      groupControlBtn = el('div', { style: 'display:flex;align-items:center;gap:4px;' }, [
        el('button', {
          class: 'strip-btn strip-group-active-btn',
          title: selectedGroupCount >= 2 ? 'Merge selected pins into stacked cluster' : 'Click at least 2 pins on map to select them',
          onclick: () => {
            if (selectedGroupCount >= 2) {
              const grp = createMarkerGroup(mapConfig.selectedForGrouping);
              showToast(`Grouped ${grp.nodeIds.length} pins into stacked cluster`);
            } else {
              showToast('Please click on at least 2 pins to select them for grouping');
            }
          }
        }, [icon('check'), selectedGroupCount >= 2 ? ` Merge (${selectedGroupCount})` : ` Select Pins (${selectedGroupCount})`]),
        el('button', {
          class: 'strip-btn strip-group-cancel-btn',
          title: 'Cancel grouping mode',
          onclick: () => {
            setMapGroupingMode(false);
            showToast('Grouping cancelled');
          }
        }, ['✕'])
      ]);
    }

    satControls = [
      el('div', { class: 'strip-divider' }),
      presetSelect,
      layerSelect,
      pinLockBtn,
      mapLockBtn,
      groupControlBtn
    ];
  }

  const topStrip = el('div', { class: 'network-top-strip' }, [
    el('div', { class: 'network-strip-left' }, [
      el('button', {
        class: 'strip-btn strip-back-btn',
        title: 'Return to search and select another starting entity',
        onclick: () => {
          returnToGraphLaunchpad();
          showToast('Returned to Investigation Launchpad');
        }
      }, [icon('undo'), ` ${t('launchpad')}`]),
      el('div', { class: 'strip-divider' }),
      el('div', { class: 'strip-select-wrap' }, [
        el('span', { class: 'strip-label' }, [`${t('filter')}:`]),
        typeSelect
      ]),
      ...satControls
    ]),
    el('div', { class: 'network-strip-right' }, [
      el('button', {
        class: 'strip-btn',
        title: 'Reset graph to starting investigation entity',
        onclick: () => { resetGraphExploration(); showToast('Reset exploration to start node'); }
      }, [icon('undo'), ` ${t('reset')}`]),
      selectedEntity ? el('button', {
        class: 'strip-btn strip-highlight-btn',
        title: `Expand network connections for ${selectedEntity.name}`,
        onclick: () => {
          expandGraphNode(selectedEntity.id);
          showToast(`Expanded network around ${selectedEntity.name}`);
        }
      }, [icon('plus'), ` ${t('expand')}`]) : null,
      el('div', { class: 'strip-divider' }),
      el('button', {
        class: `strip-btn strip-sat-btn ${isSat ? 'active' : ''}`,
        title: isSat ? 'Disable satellite map background and return to clean canvas' : 'Enable interactive satellite map background for geographic reference',
        onclick: () => {
          toggleGraphSatelliteMode();
          showToast(state.graphSatelliteMode ? '🛰 Satellite Map Background Enabled' : 'Standard Clean Graph Canvas Enabled');
        }
      }, [icon('network'), isSat ? ` 🛰 ${t('satelliteView')}: ON` : ` 🗺 ${t('satelliteView')}: OFF`]),
      el('span', { class: 'strip-count' }, [
        `${visibleNodes.length}/${entities.length} ${t('nodes')}`
      ]),
      el('button', {
        class: 'strip-btn strip-icon-btn',
        title: state.graphFullscreen ? t('exitFullscreen') : t('fullscreen'),
        onclick: toggleFullscreen
      }, [icon('expand')])
    ].filter(Boolean))
  ]);

  const isPinsLocked = !!mapConfig.pinsLocked;
  const lockedPinsKey = Object.entries(mapConfig.lockedPinIds || {}).filter(([_, v]) => v).map(([k]) => k).sort().join(',');
  const groupsKey = (mapConfig.markerGroups || []).map(g => `${g.id}:${(g.nodeIds || []).sort().join(',')}`).join(';');
  const groupSelectKey = (mapConfig.selectedForGrouping || []).sort().join(',');
  const graphSignature = `${visibleNodes.map(n => n.id).sort().join(',')}|${state.selected}|${seedId}|${state.type}|${isFocusedMode ? '1' : '0'}|${isSat ? 'sat' : 'std'}|${mapConfig.layerType}|${isLocked ? '1' : '0'}|${isPinsLocked ? '1' : '0'}|${mapConfig.pinsLockedAll ? '1' : '0'}|${lockedPinsKey}|${mapConfig.groupingMode ? '1' : '0'}|${groupSelectKey}|${groupsKey}|${mapConfig.lat}|${mapConfig.lng}|${mapConfig.zoom}`;

  const renderGraphPanel = () => {
    return el('section', { class: `graph-panel ${isSat ? 'satellite-view-active' : ''}` }, [
      isSat ? el('div', {
        id: 'graph-leaflet-map',
        class: `graph-leaflet-map ${isLocked ? 'map-locked' : 'map-interactive'}`
      }) : null,
      graphContainer(visibleNodes),
      visibleNodes.length > 0 ? el('div', { class: `graph-legend ${isSat ? 'sat-legend' : ''}` }, [
        el('span', {}, [el('i', { style: `background:${objectTypeColors.Person}` }), 'Person']),
        el('span', {}, [el('i', { style: `background:${objectTypeColors.Phone}` }), 'Phone']),
        el('span', {}, [el('i', { style: `background:${objectTypeColors.Vehicle}` }), 'Vehicle']),
        el('span', {}, [el('i', { style: `background:${objectTypeColors.Bank}` }), 'Bank Account']),
        el('span', {}, [el('i', { style: `background:${objectTypeColors['FIR Case']}` }), 'FIR Case']),
        el('span', {}, [el('i', { style: `background:${objectTypeColors.Location}` }), 'Cell Tower'])
      ]) : null,
      visibleNodes.length > 0 ? el('div', { class: `graph-controls ${isSat ? 'sat-controls' : ''}` }, [
        el('button', {
          class: 'icon-btn',
          title: 'Zoom in',
          onclick: () => isSat ? leafletMapInstance?.zoomIn() : sigmaInstance?.getCamera().animatedZoom()
        }, ['＋']),
        el('button', {
          class: 'icon-btn',
          title: 'Zoom out',
          onclick: () => isSat ? leafletMapInstance?.zoomOut() : sigmaInstance?.getCamera().animatedUnzoom()
        }, ['−']),
        el('button', {
          class: 'icon-btn',
          title: 'Reset view',
          onclick: () => isSat ? (leafletMapInstance?.setView([mapConfig.lat || 18.5204, mapConfig.lng || 73.8567], mapConfig.zoom || 14)) : sigmaInstance?.getCamera().animatedReset({ duration: 300 })
        }, ['⌖'])
      ]) : null
    ].filter(Boolean));
  };

  const existingWorkspace = c.querySelector('.network-workspace');
  if (existingWorkspace) {
    existingWorkspace.className = `network-workspace ${state.graphFullscreen ? 'fullscreen' : ''}`;
    
    const oldTopStrip = existingWorkspace.querySelector('.network-top-strip');
    if (oldTopStrip) oldTopStrip.replaceWith(topStrip);

    const oldInspector = existingWorkspace.querySelector('.graph-inspector');
    const newInspector = renderGraphInspector(selectedEntity, analyticalEntities, visibleIds);
    if (oldInspector) {
      oldInspector.replaceWith(newInspector);
    }

    const oldGraphPanel = existingWorkspace.querySelector('.graph-panel');
    const wasSat = oldGraphPanel ? oldGraphPanel.classList.contains('satellite-view-active') : false;
    if (oldGraphPanel && (wasSat !== isSat)) {
      const newGraphPanel = renderGraphPanel();
      oldGraphPanel.replaceWith(newGraphPanel);
      lastRenderedGraphSignature = graphSignature;
      mountSigma(visibleNodes);
    } else if (isSat && visibleNodes.length > 0 && graphSignature !== lastRenderedGraphSignature) {
      lastRenderedGraphSignature = graphSignature;
      renderSatelliteMapPins(visibleNodes);
    } else if (visibleNodes.length > 0 && graphSignature !== lastRenderedGraphSignature) {
      lastRenderedGraphSignature = graphSignature;
      mountSigma(visibleNodes);
    }
    return;
  }

  // Full first-time render
  c.innerHTML = '';
  const graph = renderGraphPanel();
  const entityAside = renderGraphInspector(selectedEntity, analyticalEntities, visibleIds);

  n.append(topStrip, el('div', { class: 'network-grid' }, [graph, entityAside]));
  c.append(n);

  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.scrollTop = 0;

  if (visibleNodes.length > 0) {
    lastRenderedGraphSignature = graphSignature;
    requestAnimationFrame(() => mountSigma(visibleNodes));
  }
}

// --------------------------------------------------------------------------
// MAIN ENTRY POINT
// --------------------------------------------------------------------------
export function renderNetwork(c) {
  if (state.graphExploration?.active) {
    renderActiveNetworkWorkspace(c);
  } else {
    c.innerHTML = '';
    if (sigmaInstance) {
      sigmaInstance.kill();
      sigmaInstance = null;
      currentGraph = null;
      lastRenderedGraphSignature = '';
    }
    renderInvestigationLaunchpad(c);
  }
}
