import Graph from 'graphology';
import Sigma from 'sigma';
import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, riskColor, notifyStateChange } from '../state.js';
import { graphMetrics } from '../lib/analysis.js';
import { showToast } from '../components/Toast.js';

let sigmaInstance = null;

export function graphContainer(sorted) {
  if (sorted.length === 0) {
    return el('div', { class: 'sigma-container empty-graph-shell' }, [
      el('div', { class: 'empty-shell-content' }, [
        el('span', { class: 'empty-shell-icon' }, [icon('network')]),
        el('strong', {}, ['No Entities in Network']),
        el('p', { class: 'muted' }, ['Add FIR cases or entities in the database to view live network linkages.'])
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
    const radius = 0.25 + (index % 3) * 0.12;
    graph.addNode(entity.id, {
      label: entity.name,
      x: entity.x / 700 - 0.5 || Math.cos(angle) * radius,
      y: entity.y / 520 - 0.5 || Math.sin(angle) * radius,
      size: 7 + entity.degree * 0.75,
      color: riskColor[entity.risk] || '#0B3D91',
      risk: entity.risk,
      entityId: entity.id
    });
  });
  edges.forEach(([source, target]) => {
    if (graph.hasNode(source) && graph.hasNode(target) && !graph.hasEdge(source, target)) {
      graph.addEdge(source, target, { color: '#CBD5E1', size: 1.5, type: 'line' });
    }
  });
  sigmaInstance = new Sigma(graph, container, {
    renderLabels: true,
    labelFont: 'Inter, system-ui, sans-serif',
    labelSize: 12,
    labelColor: { color: '#162B47' },
    defaultNodeColor: '#0B3D91',
    defaultEdgeColor: '#CBD5E1',
    minCameraRatio: 0.2,
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

export function selectedCard() {
  const e = entities.find(x => x.id === state.selected);
  if (!e) {
    return el('div', { class: 'selected-card' }, [
      el('div', { class: 'selected-top' }, [
        el('span', { class: 'entity-type' }, ['Entity']),
        el('span', { class: 'risk-badge low' }, ['None'])
      ]),
      el('h2', {}, ['No Entity Selected']),
      el('p', { class: 'muted' }, ['Select an entity from the list or network graph to inspect details.']),
      el('div', { class: 'selected-stats' }, [
        [t('connectionsSort'), 0],
        [t('linkedEvents'), 0],
        [t('influence'), '0%']
      ].map(([a, b]) => el('div', {}, [el('strong', {}, [b]), el('span', {}, [a])])))
    ]);
  }
  return el('div', { class: 'selected-card' }, [
    el('div', { class: 'selected-top' }, [
      el('span', { class: 'entity-type' }, [e.type]),
      el('span', { class: `risk-badge ${e.risk}` }, [t(e.risk)])
    ]),
    el('h2', {}, [e.name]),
    el('p', { class: 'muted' }, [e.city || 'India']),
    el('div', { class: 'selected-stats' }, [
      [t('connectionsSort'), e.degree || 0],
      [t('linkedEvents'), e.events || 0],
      [t('influence'), (e.influence || 0) + '%']
    ].map(([a, b]) => el('div', {}, [el('strong', {}, [b]), el('span', {}, [a])]))),
    el('div', { class: 'detail-row' }, [el('span', {}, [t('source')]), el('strong', {}, ['National Crime Database'])]),
    el('div', { class: 'detail-row' }, [el('span', {}, [t('confidence')]), el('strong', {}, ['100%'])]),
    el('button', { class: 'outline-btn full', onclick: () => showToast(`${e.name} record inspected`) }, [t('evidenceTrail'), icon('arrow')])
  ]);
}

export function entityListItem(e) {
  const b = el('button', { class: `entity-row ${state.selected === e.id ? 'selected' : ''}` }, [
    el('span', { class: 'entity-avatar', style: `background:${riskColor[e.risk]}18;color:${riskColor[e.risk]}` }, [e.name.slice(0, 1)]),
    el('span', { class: 'entity-row-name' }, [
      el('strong', {}, [e.name]),
      el('small', {}, [e.type])
    ]),
    el('span', { class: 'row-degree' }, [e.degree || 0]),
    el('span', { class: `risk-dot ${e.risk}` })
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
  const filtered = analyticalEntities.filter(e => (state.type === 'all' || e.type === state.type) && (e.name.toLowerCase().includes(state.query.toLowerCase()) || (e.local && e.local.includes(state.query))));
  const rank = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name) : state.sort === 'connections' ? b.degree - a.degree : state.sort === 'recent' ? b.recent - a.recent : state.sort === 'influence' ? b.influence - a.influence : rank[a.risk] - rank[b.risk]);
  const n = el('div', { class: `network-workspace ${state.graphFullscreen ? 'fullscreen' : ''}` });
  const typeOptions = [['all', t('allTypes')], ...Array.from(new Set(entities.map(e => e.type))).map(x => [x, x])];
  const sortOptions = [['risk', t('risk')], ['connections', t('connectionsSort')], ['name', t('name')], ['recent', t('recent')], ['influence', t('influence')]];
  const typeSelect = el('select', { class: 'filter-select' }, typeOptions.map(([v, l]) => { const o = el('option', { value: v }, [l]); o.selected = v === state.type; return o; }));
  typeSelect.onchange = e => { state.type = e.target.value; notifyStateChange(); };
  const sortSelect = el('select', { class: 'filter-select' }, sortOptions.map(([v, l]) => { const o = el('option', { value: v }, [l]); o.selected = v === state.sort; return o; }));
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
  const fullscreen = el('button', { class: 'outline-btn', onclick: toggleFullscreen }, [icon('expand'), state.graphFullscreen ? t('exitFullscreen') : t('fullscreen')]);
  const firButton = el('button', { class: 'primary-btn small', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('file'), t('reviewFIR')]);
  const heading = el('div', { class: 'page-heading compact' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['LINKAGE ANALYSIS']),
      el('h1', {}, [t('network')]),
      el('p', { class: 'muted' }, [t('graphHint')])
    ]),
    el('div', { class: 'heading-actions' }, [fullscreen, firButton])
  ]);
  const toolbar = el('div', { class: 'network-toolbar' }, [
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, [t('filter')]), typeSelect]),
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, ['Sort by']), sortSelect]),
    el('span', { class: 'result-count' }, [sorted.length + ' entities'])
  ]);
  const graph = el('section', { class: 'graph-panel' }, [
    graphContainer(sorted),
    sorted.length > 0 ? el('div', { class: 'graph-legend' }, [['high', t('high')], ['medium', t('medium')], ['low', t('low')]].map(([r, l]) => el('span', {}, [el('i', { style: `background:${riskColor[r]}` }), l]))) : null,
    sorted.length > 0 ? el('div', { class: 'graph-controls' }, [
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedZoom() }, ['＋']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedUnzoom() }, ['−']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedReset({ duration: 300 }) }, ['⌖'])
    ]) : null
  ].filter(Boolean));
  const entityAside = el('aside', { class: 'entity-panel' }, [
    selectedCard(),
    el('div', { class: 'entity-list-head' }, [el('h3', {}, [t('entities')]), el('span', { class: 'muted' }, [sorted.length + ' total'])]),
    el('div', { class: 'entity-list' }, sorted.length > 0 ? sorted.map(e => entityListItem(e)) : [el('div', { style: 'padding: 24px 12px; text-align: center; color: var(--muted); font-size: 12px;' }, ['No entities recorded yet.'])])
  ]);
  n.append(heading, toolbar, el('div', { class: 'network-grid' }, [graph, entityAside]));
  c.append(n);
  if (sorted.length > 0) {
    requestAnimationFrame(() => mountSigma(sorted));
  }
}
