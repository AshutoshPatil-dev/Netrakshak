import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import {
  state,
  entities,
  edges,
  riskColor,
  notifyStateChange,
  openEntityProfile,
  startGraphInvestigation
} from '../state.js';
import { graphMetrics } from '../lib/analysis.js';
import { objectTypeColors, objectTypeIcons, getConnectedLinks } from './NetworkGraphView.js';
import { showToast } from '../components/Toast.js';

export function renderEntities(c) {
  c.innerHTML = '';

  if (!state.entitiesTab) {
    state.entitiesTab = {
      query: '',
      type: 'all',
      sort: 'recent'
    };
  }

  const analyticalEntities = graphMetrics(entities, edges);

  // Type filter categories
  const categories = [
    { id: 'all', label: t('allEntities'), count: analyticalEntities.length },
    { id: 'Person', label: t('suspectsPersons'), count: analyticalEntities.filter(e => e.type === 'Person').length },
    { id: 'Phone', label: t('phonesSims'), count: analyticalEntities.filter(e => e.type === 'Phone').length },
    { id: 'Vehicle', label: t('vehicles'), count: analyticalEntities.filter(e => e.type === 'Vehicle').length },
    { id: 'Bank', label: t('bankMuleAccounts'), count: analyticalEntities.filter(e => e.type === 'Bank').length },
    { id: 'Location', label: t('cellTowersPlaces'), count: analyticalEntities.filter(e => e.type === 'Location').length },
    { id: 'Organization', label: t('shellCompanies'), count: analyticalEntities.filter(e => e.type === 'Organization').length }
  ];

  // Filter entities
  let filtered = analyticalEntities.filter(e => {
    // Type filter
    if (state.entitiesTab.type !== 'all' && e.type !== state.entitiesTab.type) {
      return false;
    }
    // Search query
    const q = (state.entitiesTab.query || '').trim().toLowerCase();
    if (!q) return true;

    const matchName = (e.name || '').toLowerCase().includes(q);
    const matchRole = (e.role || '').toLowerCase().includes(q);
    const matchLocal = (e.local || '').toLowerCase().includes(q);
    const matchCity = (e.city || '').toLowerCase().includes(q);
    const matchPhone = (e.phone || '').toLowerCase().includes(q);
    const matchId = (e.id || '').toLowerCase().includes(q);

    let matchIdent = false;
    if (e.identifiers) {
      matchIdent = Object.values(e.identifiers).some(v => String(v).toLowerCase().includes(q));
    }

    return matchName || matchRole || matchLocal || matchCity || matchPhone || matchId || matchIdent;
  });

  // Sort entities (default: recent)
  filtered.sort((a, b) => {
    switch (state.entitiesTab.sort) {
      case 'recent': {
        const rA = a.recent ?? (a.events || 1) * 10;
        const rB = b.recent ?? (b.events || 1) * 10;
        return rB - rA;
      }
      case 'risk': {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
      }
      case 'connections': {
        const cA = getConnectedLinks(a.id).length;
        const cB = getConnectedLinks(b.id).length;
        return cB - cA;
      }
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  });

  // Header section
  const header = el('div', { class: 'entities-view-header' }, [
    el('div', { class: 'entities-header-text' }, [
      el('h1', { class: 'page-title' }, [t('entitiesTitle')]),
      el('p', { class: 'page-subtitle' }, [t('entitiesSubtitle')])
    ]),
    el('div', { class: 'entities-header-stats' }, [
      el('div', { class: 'header-stat-pill' }, [
        el('strong', {}, [String(analyticalEntities.length)]),
        el('span', {}, [t('totalEntities')])
      ]),
      el('div', { class: 'header-stat-pill' }, [
        el('strong', {}, [String(edges.length)]),
        el('span', {}, [t('verifiedLinks')])
      ])
    ])
  ]);

  // Controls bar: Search, Filter Tabs, Sort
  const searchInput = el('input', {
    type: 'text',
    class: 'entities-search-input',
    placeholder: t('searchEntitiesPlaceholder'),
    value: state.entitiesTab.query || '',
    oninput: (ev) => {
      state.entitiesTab.query = ev.target.value;
      renderEntities(c);
    }
  });

  const clearBtn = state.entitiesTab.query ? el('button', {
    class: 'search-clear-btn',
    title: 'Clear search',
    onclick: () => {
      state.entitiesTab.query = '';
      renderEntities(c);
    }
  }, [icon('close')]) : null;

  const searchBox = el('div', { class: 'entities-search-box' }, [
    icon('search'),
    searchInput,
    clearBtn
  ].filter(Boolean));

  // Sort dropdown
  const sortSelect = el('select', {
    class: 'entities-sort-select',
    onchange: (ev) => {
      state.entitiesTab.sort = ev.target.value;
      renderEntities(c);
    }
  }, [
    el('option', { value: 'recent', selected: state.entitiesTab.sort === 'recent' }, [t('sortLatest')]),
    el('option', { value: 'risk', selected: state.entitiesTab.sort === 'risk' }, [t('sortRisk')]),
    el('option', { value: 'connections', selected: state.entitiesTab.sort === 'connections' }, [t('sortConnections')]),
    el('option', { value: 'name_asc', selected: state.entitiesTab.sort === 'name_asc' }, [t('sortNameAsc')]),
    el('option', { value: 'name_desc', selected: state.entitiesTab.sort === 'name_desc' }, [t('sortNameDesc')])
  ]);

  const topControls = el('div', { class: 'entities-top-controls' }, [
    searchBox,
    sortSelect
  ]);

  // Filter Category Pills
  const filterPills = el('div', { class: 'entities-filter-pills' }, categories.map(cat => {
    const isActive = state.entitiesTab.type === cat.id;
    return el('button', {
      class: `filter-pill-btn ${isActive ? 'active' : ''}`,
      onclick: () => {
        state.entitiesTab.type = cat.id;
        renderEntities(c);
      }
    }, [
      cat.label,
      el('span', { class: 'pill-count-badge' }, [String(cat.count)])
    ]);
  }));

  // Entity Cards Grid
  const cardsGrid = el('div', { class: 'entities-cards-grid' });

  if (filtered.length === 0) {
    cardsGrid.append(el('div', { class: 'entities-empty-state' }, [
      el('div', { class: 'empty-icon' }, [icon('search')]),
      el('h3', {}, ['No Entities Matching Criteria']),
      el('p', {}, ['Try changing your search term or selecting a different category filter.']),
      el('button', {
        class: 'primary-btn small',
        onclick: () => {
          state.entitiesTab.query = '';
          state.entitiesTab.type = 'all';
          renderEntities(c);
        }
      }, ['Reset All Filters'])
    ]));
  } else {
    filtered.forEach(entity => {
      const typeColor = objectTypeColors[entity.type] || '#1E293B';
      const typeIcon = objectTypeIcons[entity.type] || 'shield';
      const links = getConnectedLinks(entity.id);
      const initialLetter = (entity.name || 'E').replace(/[^a-zA-Z0-9+]/g, '').charAt(0).toUpperCase() || 'E';

      // Risk score calculation
      const riskScores = { high: 81, medium: 54, low: 22 };
      const riskScore = riskScores[entity.risk] || 75;

      // Extract highlights / tags
      const tags = [];
      if (entity.local && entity.local !== entity.name) tags.push(entity.local);
      if (entity.identifiers?.alias) tags.push(entity.identifiers.alias);
      if (entity.identifiers?.bankName) tags.push(entity.identifiers.bankName);
      if (entity.identifiers?.carrier) tags.push(entity.identifiers.carrier);
      if (entity.identifiers?.make) tags.push(entity.identifiers.make);
      if (entity.identifiers?.sections) tags.push(entity.identifiers.sections);

      const card = el('div', {
        class: 'entity-directory-card',
        onclick: () => {
          openEntityProfile(entity.id);
          showToast(`Opening dossier for ${entity.name}`);
        }
      }, [
        el('div', { class: 'card-top-row' }, [
          el('div', { class: 'card-avatar-box', style: `background:${typeColor};color:#FFFFFF` }, [
            initialLetter
          ]),
          el('div', { class: 'card-type-and-risk' }, [
            el('span', { class: 'card-type-badge', style: `color:${typeColor};background:${typeColor}15` }, [
              icon(typeIcon),
              ` ${entity.type}`
            ]),
            el('span', { class: `hero-risk-pill ${entity.risk || 'low'}` }, [
              `${(entity.risk || 'HIGH').charAt(0).toUpperCase() + (entity.risk || 'HIGH').slice(1)} (${riskScore})`
            ])
          ])
        ]),

        el('div', { class: 'card-body-content' }, [
          el('h3', { class: 'card-entity-name', title: entity.name }, [entity.name]),
          el('p', { class: 'card-entity-role' }, [entity.role || entity.local || `${entity.type} Node`]),
          el('div', { class: 'card-location-row' }, [
            icon('shield'),
            el('span', {}, [entity.city || 'Maharashtra Police Jurisdiction'])
          ]),
          tags.length > 0 ? el('div', { class: 'card-tags-row' }, tags.slice(0, 3).map(tag => el('span', { class: 'card-tag-pill' }, [tag]))) : null
        ].filter(Boolean)),

        el('div', { class: 'card-footer-row' }, [
          el('div', { class: 'card-links-count' }, [
            icon('network'),
            el('span', {}, [`${links.length} Connected Leads`])
          ]),
          el('div', { class: 'card-action-btns' }, [
            el('button', {
              class: 'card-graph-btn',
              title: 'Open in Network Graph',
              onclick: (e) => {
                e.stopPropagation();
                startGraphInvestigation(entity.id);
                state.view = 'network';
                notifyStateChange();
                showToast(`Visualizing network for ${entity.name}`);
              }
            }, [icon('network')]),
            el('button', {
              class: 'card-open-btn',
              title: 'Inspect full profile',
              onclick: (e) => {
                e.stopPropagation();
                openEntityProfile(entity.id);
              }
            }, ['Inspect Profile →'])
          ])
        ])
      ]);

      cardsGrid.append(card);
    });
  }

  const container = el('div', { class: 'entities-view-container' }, [
    header,
    topControls,
    filterPills,
    cardsGrid
  ]);

  c.append(container);
}
