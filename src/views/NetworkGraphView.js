import Graph from 'graphology';
import Sigma from 'sigma';
import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import {
  state,
  entities,
  edges,
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
  showFullGraphUniverse,
  openEntityProfile
} from '../state.js';
import { graphMetrics } from '../lib/analysis.js';
import { showToast } from '../components/Toast.js';
import { performAIAnalysis } from './AIAnalysisView.js';

let sigmaInstance = null;

export const objectTypeColors = {
  Person: '#1E293B',
  Phone: '#0D9488',
  Vehicle: '#D97706',
  Bank: '#2563EB',
  'FIR Case': '#DC2626',
  Location: '#7C3AED',
  Entity: '#475569'
};

export const objectTypeIcons = {
  Person: 'user',
  Phone: 'pulse',
  Vehicle: 'grid',
  Bank: 'database',
  'FIR Case': 'file',
  Location: 'network',
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
  if (visibleNodes.length === 0) {
    return el('div', { class: 'sigma-container empty-graph-shell' }, [
      el('div', { class: 'empty-shell-content' }, [
        el('span', { class: 'empty-shell-icon' }, [icon('network')]),
        el('strong', {}, ['No Entities in Active Exploration']),
        el('p', { class: 'muted' }, ['Select a focal seed entity above to begin progressive graph investigation.'])
      ])
    ]);
  }
  return el('div', { class: 'sigma-container', 'data-graph-count': String(visibleNodes.length) }, [
    el('div', { class: 'graph-node-tooltip', id: 'graphNodeTooltip' })
  ]);
}

export function mountSigma(visibleNodes) {
  const container = document.querySelector('.sigma-container');
  if (!container || container.classList.contains('empty-graph-shell')) return;
  sigmaInstance?.kill();
  const graph = new Graph();

  const seedId = state.graphExploration?.seedId;
  const isFocused = state.graphExploration?.mode === 'focused';

  visibleNodes.forEach((entity, index) => {
    const isSeed = entity.id === seedId;
    const isSelected = state.selected === entity.id;
    const nodeColor = objectTypeColors[entity.type] || riskColor[entity.risk] || '#1E293B';

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
    const visibleIds = new Set(visibleNodes.map(n => n.id));
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
      color: nodeColor,
      risk: entity.risk,
      entityId: entity.id,
      entityType: entity.type,
      isSeed,
      unexploredCount
    });
  });

  const visibleIds = new Set(visibleNodes.map(n => n.id));
  edges.forEach((edge) => {
    const source = edge[0];
    const target = edge[1];
    const label = edge[2] || '';
    if (visibleIds.has(source) && visibleIds.has(target) && !graph.hasEdge(source, target)) {
      const isConnectedToSelected = state.selected && (source === state.selected || target === state.selected);
      graph.addEdge(source, target, {
        color: isConnectedToSelected ? '#2563EB' : '#94A3B8',
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
    labelColor: { color: '#0F172A' },
    defaultNodeColor: '#1E293B',
    defaultEdgeColor: '#CBD5E1',
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
        el('span', { class: 'inspector-title' }, ['Intelligence Inspector'])
      ]),
      entity ? el('span', { class: 'inspector-live-dot', title: 'Target locked' }, ['● ACTIVE']) : null
    ].filter(Boolean)),
    el('div', { class: 'inspector-tabs' }, [
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'dossier' ? 'active' : ''}`,
        onclick: () => setTab('dossier')
      }, [icon('user'), ' Dossier']),
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'links' ? 'active' : ''}`,
        onclick: () => setTab('links')
      }, [icon('network'), ` Links (${connectedLinks.length})`]),
      el('button', {
        class: `inspector-tab-btn ${currentTab === 'directory' ? 'active' : ''}`,
        onclick: () => setTab('directory')
      }, [icon('grid'), ` Directory (${allEntities.length})`])
    ])
  ]);

  let tabBody = null;

  if (currentTab === 'dossier') {
    if (!entity) {
      tabBody = el('div', { class: 'inspector-empty-state' }, [
        el('div', { class: 'inspector-empty-icon' }, [icon('network')]),
        el('h4', {}, ['No Entity Selected']),
        el('p', { class: 'muted' }, ['Click any node on the network graph or select from the directory to inspect situational intelligence.'])
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
              isSeed ? el('span', { class: 'inspector-seed-pill' }, [icon('target'), ' FOCAL SEED']) : null,
              el('span', { class: `risk-badge ${entity.risk || 'low'}` }, [`${(entity.risk || 'LOW').toUpperCase()} RISK`])
            ].filter(Boolean)),
            el('h3', { class: 'inspector-entity-name' }, [entity.name]),
            el('p', { class: 'inspector-entity-sub' }, [entity.role || entity.local || `${entity.type} Record`])
          ])
        ]),

        // Situational Summary Card
        el('div', { class: 'inspector-sitrep-box' }, [
          el('div', { class: 'sitrep-header' }, [
            icon('sparkle'),
            el('strong', {}, ['Situational Summary:'])
          ]),
          el('p', { class: 'sitrep-text' }, [summaryText])
        ]),

        // Quick Stats
        el('div', { class: 'inspector-stats-row' }, [
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, ['Direct Links']),
            el('strong', { class: 'stat-val' }, [String(connectedLinks.length)])
          ]),
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, ['Activity Rank']),
            el('strong', { class: 'stat-val' }, [`${entity.recent || 50}%`])
          ]),
          el('div', { class: 'inspector-stat-cell' }, [
            el('span', { class: 'stat-lbl' }, ['Risk Level']),
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
          }, [icon('user'), ' Full Profile →']),
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
          el('button', {
            class: `inspector-action-btn ${isSeed ? 'active-seed-btn' : ''}`,
            title: isSeed ? 'Click to turn off focal seed and return to previous view' : 'Set this object as focal exploration seed',
            onclick: () => {
              toggleGraphSeed(entity.id);
              if (isSeed) {
                showToast('Toggled focal seed OFF - returned to previous view');
              } else {
                showToast(`Set ${entity.name} as Investigation Focal Seed`);
              }
            }
          }, [icon('target'), isSeed ? ' Seed (ON)' : ' Focal Seed']),
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
      if (entity.identifiers) {
        Object.entries(entity.identifiers).forEach(([k, v]) => {
          if (v) idEntries.push([k, String(v)]);
        });
      }
      if (entity.phone) idEntries.push(['Contact / Phone', entity.phone]);
      if (entity.city) idEntries.push(['Police Jurisdiction', entity.city]);

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
      { id: 'FIR Case', label: 'FIRs' }
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

    const searchRow = el('div', { class: 'directory-search-row' }, [
      el('input', {
        type: 'text',
        class: 'directory-search-input',
        placeholder: 'Filter directory objects...',
        value: state.directorySearchQuery || '',
        oninput: (e) => {
          state.directorySearchQuery = e.target.value;
          notifyStateChange();
        }
      }),
      state.directorySearchQuery ? el('button', {
        class: 'search-clear-btn',
        onclick: () => {
          state.directorySearchQuery = '';
          notifyStateChange();
        }
      }, ['✕']) : null
    ].filter(Boolean));

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

  const totalCases = entities.filter(e => e.type === 'FIR Case').length;
  const totalPersons = entities.filter(e => e.type === 'Person').length;
  const totalVehicles = entities.filter(e => e.type === 'Vehicle').length;
  const totalPhones = entities.filter(e => e.type === 'Phone').length;
  const totalBanks = entities.filter(e => e.type === 'Bank').length;
  const totalTowers = entities.filter(e => e.type === 'Location').length;

  const filtered = analyticalEntities.filter(e => {
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
      el('div', { class: 'eyebrow blue' }, ['INTELLIGENCE INVESTIGATION COMMAND']),
      el('h1', {}, ['Network Graph Investigation']),
      el('p', { class: 'muted' }, [
        'Search or select any starting FIR case, person, vehicle, phone, bank account or cell tower to generate and progressively explore connected criminal relationships.'
      ])
    ]),
    el('div', { class: 'heading-actions' }, [
      el('button', {
        class: 'outline-btn',
        onclick: () => {
          showFullGraphUniverse();
          showToast('Loaded full database universe');
        }
      }, [icon('grid'), ' Explore Entire Database Universe']),
      el('button', {
        class: 'primary-btn',
        onclick: () => { state.view = 'fir'; notifyStateChange(); }
      }, [icon('file'), ' New FIR Intake'])
    ])
  ]);

  // Fast Category Statistics Pills
  const categoryStats = el('div', { class: 'launchpad-stats-row' }, [
    { type: 'all', label: 'All Records', count: entities.length, iconName: 'shield', color: '#0F172A' },
    { type: 'fir case', label: 'FIR Cases', count: totalCases, iconName: 'file', color: objectTypeColors['FIR Case'] },
    { type: 'person', label: 'Suspects & Persons', count: totalPersons, iconName: 'user', color: objectTypeColors.Person },
    { type: 'vehicle', label: 'Vehicles', count: totalVehicles, iconName: 'grid', color: objectTypeColors.Vehicle },
    { type: 'phone', label: 'Phones / SIMs', count: totalPhones, iconName: 'pulse', color: objectTypeColors.Phone },
    { type: 'bank', label: 'Mule Accounts', count: totalBanks, iconName: 'database', color: objectTypeColors.Bank },
    { type: 'location', label: 'Cell Towers', count: totalTowers, iconName: 'network', color: objectTypeColors.Location }
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
    placeholder: 'Search by Case ID, Accused name, Mobile (+91), Vehicle Reg, Mule Account, Tower ID or Section...',
    value: state.query || ''
  });
  searchInput.oninput = (e) => {
    state.query = e.target.value;
    notifyStateChange();
  };

  const sortOptions = [
    ['connections', 'Sort by Connection Links'],
    ['risk', 'Sort by Risk Level'],
    ['name', 'Sort by Name / Identifier'],
    ['recent', 'Sort by Recent Activity']
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
      state.query ? el('button', {
        class: 'search-clear-btn',
        onclick: () => { state.query = ''; notifyStateChange(); }
      }, ['✕']) : null
    ].filter(Boolean)),
    el('div', { class: 'launchpad-sort-group' }, [
      el('span', { class: 'toolbar-label' }, ['Sort by:']),
      sortSelect
    ])
  ]);

  // Results Grid
  const resultsHeader = el('div', { class: 'launchpad-results-header' }, [
    el('div', { class: 'results-count-title' }, [
      el('h3', {}, ['Select an Investigation Focal Point']),
      el('span', { class: 'results-count-pill' }, [`${sorted.length} matching entities`])
    ]),
    el('span', { class: 'results-hint' }, ['Click any entity to generate its network relationship graph'])
  ]);

  const cardsGrid = el('div', { class: 'launchpad-cards-grid' });

  if (sorted.length === 0) {
    cardsGrid.append(el('div', { class: 'launchpad-empty-state' }, [
      el('div', { class: 'empty-icon' }, [icon('search')]),
      el('h3', {}, ['No Records Found']),
      el('p', { class: 'muted' }, [`No records matching "${state.query}" in the active intelligence database.`]),
      el('button', {
        class: 'outline-btn small',
        onclick: () => { state.query = ''; state.type = 'all'; notifyStateChange(); }
      }, ['Clear All Filters'])
    ]));
  } else {
    sorted.forEach(item => {
      const itemColor = objectTypeColors[item.type] || '#1E293B';
      const itemIcon = objectTypeIcons[item.type] || 'shield';
      const links = getConnectedLinks(item.id);

      // Extract key attributes snippet
      const snippets = [];
      if (item.identifiers) {
        if (item.identifiers.sections) snippets.push(`Sections: ${item.identifiers.sections}`);
        if (item.identifiers.carrier) snippets.push(`Carrier: ${item.identifiers.carrier}`);
        if (item.identifiers.make) snippets.push(`Make: ${item.identifiers.make}`);
        if (item.identifiers.bankName) snippets.push(`Bank: ${item.identifiers.bankName}`);
        if (item.identifiers.status) snippets.push(`Status: ${item.identifiers.status}`);
      }
      if (item.phone && item.type !== 'Phone') snippets.push(`Contact: ${item.phone}`);
      if (item.city) snippets.push(`Sector: ${item.city}`);

      const card = el('div', {
        class: 'launchpad-entity-card',
        onclick: () => {
          openEntityProfile(item.id);
          showToast(`Opening profile for ${item.name}`);
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
              onclick: (e) => {
                e.stopPropagation();
                openEntityProfile(item.id);
              }
            }, ['Inspect Profile →']),
            el('button', {
              class: 'outline-btn small launch-btn-graph',
              title: 'Open directly in network graph canvas',
              onclick: (e) => {
                e.stopPropagation();
                startGraphInvestigation(item.id);
                showToast(`Generated network around ${item.name}`);
              }
            }, [icon('network'), ' Graph'])
          ])
        ])
      ]);

      cardsGrid.append(card);
    });
  }

  launchpad.append(heading, categoryStats, searchToolbar, resultsHeader, cardsGrid);
  c.append(launchpad);
}

// --------------------------------------------------------------------------
// ACTIVE NETWORK GRAPH INVESTIGATION VIEW (After entity selected)
// --------------------------------------------------------------------------
export function renderActiveNetworkWorkspace(c) {
  const analyticalEntities = graphMetrics(entities, edges);

  // Compute visibility set
  const visibleIds = getVisibleGraphNodeIds();
  const visibleNodes = analyticalEntities.filter(e => visibleIds.has(e.id));

  // Filter and sort for the directory / search list
  const filtered = analyticalEntities.filter(e => {
    const matchType = state.type === 'all' || e.type.toLowerCase() === state.type.toLowerCase();
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
    o.selected = v === state.type.toLowerCase();
    return o;
  }));
  typeSelect.onchange = e => { state.type = e.target.value; notifyStateChange(); };

  // Seed Selector Dropdown
  const seedOptions = [
    { label: '--- FIR Cases ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'FIR Case').map(x => ({ label: `[Case] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id })),
    { label: '--- Suspects & Persons ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'Person').map(x => ({ label: `[Person] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id })),
    { label: '--- Vehicles ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'Vehicle').map(x => ({ label: `[Vehicle] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id })),
    { label: '--- Phone Numbers ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'Phone').map(x => ({ label: `[Phone] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id })),
    { label: '--- Bank Accounts ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'Bank').map(x => ({ label: `[Bank] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id })),
    { label: '--- Cell Towers & Locations ---', disabled: true, value: '' },
    ...entities.filter(x => x.type === 'Location').map(x => ({ label: `[Tower] ${x.name} (${getConnectedLinks(x.id).length} links)`, value: x.id }))
  ];

  const seedSelect = el('select', { class: 'seed-select-input' }, seedOptions.map(opt => {
    const o = el('option', { value: opt.value }, [opt.label]);
    if (opt.disabled) o.disabled = true;
    if (opt.value === state.graphExploration?.seedId) o.selected = true;
    return o;
  }));
  seedSelect.onchange = (e) => {
    if (e.target.value) {
      setGraphSeed(e.target.value);
      showToast('Set new investigation focal point');
    }
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

  const topStrip = el('div', { class: 'network-top-strip' }, [
    el('div', { class: 'network-strip-left' }, [
      el('button', {
        class: 'strip-btn strip-back-btn',
        title: 'Return to search and select another starting entity',
        onclick: () => {
          returnToGraphLaunchpad();
          showToast('Returned to Investigation Launchpad');
        }
      }, [icon('undo'), ' Launchpad']),
      el('div', { class: 'strip-divider' }),
      el('div', { class: 'strip-select-wrap' }, [
        el('span', { class: 'strip-label' }, [icon('target'), ' Seed:']),
        seedSelect
      ]),
      el('div', { class: 'strip-select-wrap' }, [
        el('span', { class: 'strip-label' }, ['Type:']),
        typeSelect
      ])
    ]),
    el('div', { class: 'network-strip-right' }, [
      el('div', { class: 'strip-mode-group' }, [
        el('button', {
          class: `strip-mode-btn ${isFocusedMode ? 'active' : ''}`,
          title: 'Focus on progressive multi-hop discovery',
          onclick: () => { resetGraphExploration(); showToast('Switched to progressive exploration'); }
        }, [icon('network'), ' Progressive']),
        el('button', {
          class: `strip-mode-btn ${!isFocusedMode ? 'active' : ''}`,
          title: 'View all connected entities across database',
          onclick: () => { showFullGraphUniverse(); showToast('Showing entire criminal universe'); }
        }, [icon('grid'), ' Full Universe'])
      ]),
      isFocusedMode ? el('button', {
        class: 'strip-btn',
        title: 'Reset graph to focal seed node',
        onclick: () => { resetGraphExploration(); showToast('Reset exploration to seed'); }
      }, [icon('undo'), ' Reset']) : null,
      selectedEntity ? el('button', {
        class: 'strip-btn strip-highlight-btn',
        title: `Expand direct 1-hop connections for ${selectedEntity.name}`,
        onclick: () => {
          expandGraphNode(selectedEntity.id);
          showToast(`Expanded neighbors for ${selectedEntity.name}`);
        }
      }, [icon('plus'), ` Expand (${getConnectedLinks(selectedEntity.id).length})`]) : null,
      el('div', { class: 'strip-divider' }),
      el('span', { class: 'strip-count' }, [
        `${visibleNodes.length}/${entities.length} nodes`
      ]),
      el('button', {
        class: 'strip-btn strip-icon-btn',
        title: state.graphFullscreen ? t('exitFullscreen') : t('fullscreen'),
        onclick: toggleFullscreen
      }, [icon('expand')])
    ].filter(Boolean))
  ]);

  const graph = el('section', { class: 'graph-panel' }, [
    graphContainer(visibleNodes),
    visibleNodes.length > 0 ? el('div', { class: 'graph-legend' }, [
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Person}` }), 'Person']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Phone}` }), 'Phone']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Vehicle}` }), 'Vehicle']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Bank}` }), 'Bank Account']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors['FIR Case']}` }), 'FIR Case']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Location}` }), 'Cell Tower'])
    ]) : null,
    visibleNodes.length > 0 ? el('div', { class: 'graph-controls' }, [
      el('button', { class: 'icon-btn', title: 'Zoom in', onclick: () => sigmaInstance?.getCamera().animatedZoom() }, ['＋']),
      el('button', { class: 'icon-btn', title: 'Zoom out', onclick: () => sigmaInstance?.getCamera().animatedUnzoom() }, ['−']),
      el('button', { class: 'icon-btn', title: 'Reset view', onclick: () => sigmaInstance?.getCamera().animatedReset({ duration: 300 }) }, ['⌖'])
    ]) : null
  ].filter(Boolean));

  const entityAside = renderGraphInspector(selectedEntity, analyticalEntities, visibleIds);

  n.append(topStrip, el('div', { class: 'network-grid' }, [graph, entityAside]));
  c.append(n);

  if (visibleNodes.length > 0) {
    requestAnimationFrame(() => mountSigma(visibleNodes));
  }
}

// --------------------------------------------------------------------------
// MAIN ENTRY POINT
// --------------------------------------------------------------------------
export function renderNetwork(c) {
  c.innerHTML = '';
  if (state.graphExploration?.active) {
    renderActiveNetworkWorkspace(c);
  } else {
    renderInvestigationLaunchpad(c);
  }
}
