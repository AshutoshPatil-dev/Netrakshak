import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, getActiveOfficer, notifyStateChange, returnToGraphLaunchpad } from '../state.js';

export function navItem(view, label, i) {
  const b = el('button', { class: `nav-item ${state.view === view ? 'active' : ''}`, 'data-view': view }, [
    el('span', { class: 'nav-icon' }, [icon(i)]),
    el('span', {}, [label])
  ]);
  b.onclick = () => {
    if (view === 'network') {
      returnToGraphLaunchpad();
      state.selected = null;
      state.query = '';
      state.type = 'all';
    } else if (view === 'fir' && state.view === 'fir') {
      state.firActiveTab = 'intake';
    } else if (view === 'entities' && state.view === 'entities') {
      state.profileEntityId = null;
      state.query = '';
    }
    state.view = view;
    notifyStateChange();
  };
  return b;
}

export function renderSidebar() {
  const activeOfficer = getActiveOfficer();

  const sidebarHeader = el('div', { class: 'sidebar-header' }, [
    el('div', { class: 'sidebar-header-left' }, [
      el('span', { class: 'sidebar-header-badge' }, [icon('shield')]),
      el('span', { class: 'sidebar-header-text' }, ['WORKSPACE'])
    ]),
    el('button', {
      class: 'sidebar-toggle-btn',
      title: state.sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar'),
      onclick: () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        notifyStateChange();
      }
    }, [
      el('span', { class: 'toggle-icon' }, [state.sidebarCollapsed ? '▶' : '◀'])
    ])
  ]);

  const sidebar = el('aside', { class: 'sidebar' }, [
    sidebarHeader,
    el('div', { class: 'nav-section-label' }, [t('workspace')]),
    navItem('overview', t('command'), 'grid'),
    navItem('entities', t('entitiesNav'), 'user'),
    navItem('network', t('network'), 'network'),
    navItem('patterns', t('patternsAnomalies'), 'alert'),
    navItem('fir', t('fir'), 'file'),
    navItem('ai_analysis', t('aiAnalysis'), 'sparkle'),
    ...(activeOfficer.isAdmin ? [
      navItem('officers', t('officers'), 'users'),
      navItem('audit_logs', t('auditLogs'), 'database'),
      el('div', { class: 'nav-section-label' }, [t('governance')]),
      navItem('sources', t('sources'), 'database')
    ] : []),

    el('div', { class: 'sidebar-bottom' }, [
      el('div', { class: 'profile-mini' }, [
        el('div', { class: 'avatar' }, [activeOfficer.initials]),
        el('div', {}, [
          el('strong', {}, [activeOfficer.name]),
          el('span', {}, [activeOfficer.role])
        ])
      ])
    ])
  ]);


  return sidebar;
}
