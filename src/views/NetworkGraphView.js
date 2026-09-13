import Graph from 'graphology';
import Sigma from 'sigma';
import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, riskColor, notifyStateChange } from '../state.js';
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

export function graphContainer(sorted) {
  if (sorted.length === 0) {
    return el('div', { class: 'sigma-container empty-graph-shell' }, [
      el('div', { class: 'empty-shell-content' }, [
        el('span', { class: 'empty-shell-icon' }, [icon('network')]),
        el('strong', {}, ['No Entities in Network']),
        el('p', { class: 'muted' }, ['Add FIR cases or objects in the database to view live network linkages.'])
      ])
    ]);
  }
  return el('div', { class: 'sigma-container', 'data-graph-count': String(sorted.length) });
}

export function mountSigma(sorted) {
  const container = document.querySelector('.sigma-container');
  if (!container || container.classList.contains('empty-graph-shell')) return;
  sigmaInstance?.kill();
  const graph = new Graph();

  sorted.forEach((entity, index) => {
    const angle = (index / Math.max(sorted.length, 1)) * Math.PI * 2;
    const radius = 0.28 + (index % 3) * 0.14;
    const nodeColor = objectTypeColors[entity.type] || riskColor[entity.risk] || '#1E293B';
    const isSelected = state.selected === entity.id;

    graph.addNode(entity.id, {
      label: `[${entity.type}] ${entity.name}`,
      x: entity.x / 700 - 0.5 || Math.cos(angle) * radius,
      y: entity.y / 520 - 0.5 || Math.sin(angle) * radius,
      size: isSelected ? 12 + (entity.degree || 0) : 7 + (entity.degree || 0) * 0.8,
      color: nodeColor,
      risk: entity.risk,
      entityId: entity.id,
      entityType: entity.type
    });
  });

  edges.forEach((edge) => {
    const source = edge[0];
    const target = edge[1];
    const label = edge[2] || '';
    if (graph.hasNode(source) && graph.hasNode(target) && !graph.hasEdge(source, target)) {
      const isConnectedToSelected = state.selected && (source === state.selected || target === state.selected);
      graph.addEdge(source, target, {
        color: isConnectedToSelected ? '#2563EB' : '#CBD5E1',
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

  sigmaInstance.on('clickNode', ({ node }) => {
    state.selected = node;
    notifyStateChange();
  });

  requestAnimationFrame(() => {
    sigmaInstance?.refresh();
  });
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

export function renderIndividualProfile(entity, allEntities) {
  if (!entity) {
    return el('div', { class: 'individual-profile-panel empty-profile' }, [
      el('div', { class: 'empty-profile-icon' }, [icon('network')]),
      el('h3', {}, ['Select an Object to View Profile']),
      el('p', { class: 'muted' }, ['Click any node in the network graph or select from the directory to inspect its individual dossier and connection chain.'])
    ]);
  }

  const connectedLinks = getConnectedLinks(entity.id);
  const typeColor = objectTypeColors[entity.type] || '#1E293B';
  const typeIcon = objectTypeIcons[entity.type] || 'shield';

  // Header
  const header = el('div', { class: 'profile-dossier-header' }, [
    el('div', { class: 'dossier-top-badges' }, [
      el('span', { class: 'obj-type-pill', style: `background:${typeColor}15;color:${typeColor};border-color:${typeColor}40` }, [
        icon(typeIcon),
        ` ${entity.type.toUpperCase()}`
      ]),
      el('span', { class: `risk-badge ${entity.risk || 'low'}` }, [`${(entity.risk || 'LOW').toUpperCase()} RISK`])
    ]),
    el('h2', { class: 'profile-title' }, [entity.name]),
    el('p', { class: 'profile-role' }, [entity.role || entity.local || `${entity.type} Record`]),
    el('div', { class: 'profile-meta-row' }, [
      el('span', { class: 'meta-item' }, [icon('shield'), ` ${entity.city || 'Jurisdiction Logged'}`]),
      el('span', { class: 'meta-item' }, [icon('pulse'), ` ${entity.events || connectedLinks.length} Events`])
    ])
  ]);

  // Core Identifier Attributes
  const idEntries = [];
  if (entity.identifiers) {
    Object.entries(entity.identifiers).forEach(([k, v]) => {
      if (v) idEntries.push([k, String(v)]);
    });
  }
  if (entity.phone) idEntries.push(['Phone / Contact', entity.phone]);
  if (entity.city) idEntries.push(['Station / Sector', entity.city]);

  const attributesGrid = idEntries.length > 0 ? el('div', { class: 'profile-section-card' }, [
    el('h4', { class: 'section-card-title' }, ['Object Identifiers & Evidence Records']),
    el('div', { class: 'profile-attrs-grid' }, idEntries.map(([k, v]) => el('div', { class: 'attr-row' }, [
      el('span', { class: 'attr-label' }, [k.replace(/([A-Z])/g, ' $1').toUpperCase()]),
      el('strong', { class: 'attr-value' }, [v])
    ])))
  ]) : null;

  // Interactive Traversible Connections List
  const connectionsList = el('div', { class: 'profile-section-card' }, [
    el('div', { class: 'section-card-head' }, [
      el('h4', { class: 'section-card-title' }, [`Connected Objects & Linkages (${connectedLinks.length})`]),
      el('span', { class: 'card-sub-hint' }, ['Click any item to inspect profile'])
    ]),
    connectedLinks.length > 0 ? el('div', { class: 'connected-items-list' }, connectedLinks.map(link => {
      const p = link.partner;
      const pColor = objectTypeColors[p.type] || '#1E293B';
      const pIcon = objectTypeIcons[p.type] || 'shield';

      const itemBtn = el('button', {
        class: 'connected-item-row',
        title: `Click to view profile of ${p.name}`,
        onclick: () => {
          state.selected = p.id;
          notifyStateChange();
          showToast(`Focused on ${p.name} (${p.type})`);
        }
      }, [
        el('div', { class: 'p-icon-box', style: `background:${pColor}15;color:${pColor}` }, [icon(pIcon)]),
        el('div', { class: 'p-info' }, [
          el('div', { class: 'p-name-row' }, [
            el('strong', { class: 'p-name' }, [p.name]),
            el('span', { class: `p-risk-dot ${p.risk || 'low'}` })
          ]),
          el('span', { class: 'p-rel-badge' }, [link.relation])
        ]),
        el('span', { class: 'p-jump-arrow' }, ['→'])
      ]);
      return itemBtn;
    })) : el('div', { class: 'no-links-box' }, ['No direct edges recorded for this object yet.'])
  ]);

  // Action Bar
  const actionsBar = el('div', { class: 'profile-actions-bar' }, [
    el('button', {
      class: 'primary-btn small',
      onclick: () => {
        const query = entity.phone || entity.identifiers?.registration || entity.identifiers?.account || entity.name;
        state.aiAnalysis.query = query;
        state.aiAnalysis.streamType = 'all';
        performAIAnalysis(query, 'all');
        state.view = 'ai_analysis';
        notifyStateChange();
        showToast(`Running AI Linkage scan for ${entity.name}…`);
      }
    }, [icon('sparkle'), ' Analyze in AI Hub']),
    el('button', {
      class: 'outline-btn small',
      onclick: () => {
        if (sigmaInstance && entity) {
          const camera = sigmaInstance.getCamera();
          const nodeData = sigmaInstance.getGraph().getNodeAttributes(entity.id);
          if (nodeData) {
            camera.animate({ x: nodeData.x, y: nodeData.y, ratio: 0.5 }, { duration: 400 });
            showToast(`Centered on ${entity.name}`);
          }
        }
      }
    }, [icon('expand'), ' Focus Node'])
  ]);

  return el('div', { class: 'individual-profile-panel' }, [
    header,
    attributesGrid,
    connectionsList,
    actionsBar
  ]);
}

export function entityListItem(e) {
  const typeColor = objectTypeColors[e.type] || '#1E293B';
  const typeIcon = objectTypeIcons[e.type] || 'shield';

  const b = el('button', { class: `entity-row ${state.selected === e.id ? 'selected' : ''}` }, [
    el('span', { class: 'entity-avatar', style: `background:${typeColor}15;color:${typeColor}` }, [icon(typeIcon)]),
    el('span', { class: 'entity-row-name' }, [
      el('strong', {}, [e.name]),
      el('small', {}, [`${e.type} · ${e.role || e.city || ''}`])
    ]),
    el('span', { class: 'row-degree' }, [String(e.degree || 0)]),
    el('span', { class: `risk-dot ${e.risk || 'low'}` })
  ]);
  b.onclick = () => {
    state.selected = e.id;
    notifyStateChange();
  };
  return b;
}

export function renderNetwork(c) {
  c.innerHTML = '';
  const analyticalEntities = graphMetrics(entities, edges);

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

  const selectedEntity = analyticalEntities.find(x => x.id === state.selected) || (sorted.length > 0 ? sorted[0] : null);
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

  const sortOptions = [['risk', 'Sort by Risk'], ['connections', 'Sort by Connections'], ['name', 'Sort by Name'], ['recent', 'Sort by Recent Activity']];
  const sortSelect = el('select', { class: 'filter-select' }, sortOptions.map(([v, l]) => {
    const o = el('option', { value: v }, [l]);
    o.selected = v === state.sort;
    return o;
  }));
  sortSelect.onchange = e => { state.sort = e.target.value; notifyStateChange(); };

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

  const fullscreen = el('button', { class: 'outline-btn', onclick: toggleFullscreen }, [
    icon('expand'),
    state.graphFullscreen ? t('exitFullscreen') : t('fullscreen')
  ]);

  const firButton = el('button', {
    class: 'primary-btn small',
    onclick: () => { state.view = 'fir'; notifyStateChange(); }
  }, [icon('file'), 'New FIR Intake']);

  const heading = el('div', { class: 'page-heading compact' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['INTELLIGENCE NETWORK TOPOLOGY']),
      el('h1', {}, ['Criminal Network & Multi-Object Graph']),
      el('p', { class: 'muted' }, ['Click any node or linked connection to inspect full individual profile dossier across persons, vehicles, bank accounts, phones, and FIR cases.'])
    ]),
    el('div', { class: 'heading-actions' }, [fullscreen, firButton])
  ]);

  const toolbar = el('div', { class: 'network-toolbar' }, [
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, ['Filter:']), typeSelect]),
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, ['Sort:']), sortSelect]),
    el('span', { class: 'result-count' }, [`${sorted.length} objects active in network`])
  ]);

  const graph = el('section', { class: 'graph-panel' }, [
    graphContainer(sorted),
    sorted.length > 0 ? el('div', { class: 'graph-legend' }, [
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Person}` }), 'Person']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Phone}` }), 'Phone']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Vehicle}` }), 'Vehicle']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Bank}` }), 'Bank Account']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors['FIR Case']}` }), 'FIR Case']),
      el('span', {}, [el('i', { style: `background:${objectTypeColors.Location}` }), 'Cell Tower'])
    ]) : null,
    sorted.length > 0 ? el('div', { class: 'graph-controls' }, [
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedZoom() }, ['＋']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedUnzoom() }, ['−']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedReset({ duration: 300 }) }, ['⌖'])
    ]) : null
  ].filter(Boolean));

  const entityAside = el('aside', { class: 'entity-panel' }, [
    renderIndividualProfile(selectedEntity, analyticalEntities),
    el('div', { class: 'entity-list-head' }, [
      el('h3', {}, ['Network Objects Directory']),
      el('span', { class: 'muted' }, [`${sorted.length} records`])
    ]),
    el('div', { class: 'entity-list' }, sorted.length > 0 ? sorted.map(e => entityListItem(e)) : [
      el('div', { style: 'padding: 24px 12px; text-align: center; color: var(--muted); font-size: 12px;' }, ['No matching objects found.'])
    ])
  ]);

  n.append(heading, toolbar, el('div', { class: 'network-grid' }, [graph, entityAside]));
  c.append(n);

  if (sorted.length > 0) {
    requestAnimationFrame(() => mountSigma(sorted));
  }
}
