import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, getActiveOfficer, notifyStateChange } from '../state.js';

export function navItem(view, label, i) {
  const b = el('button', { class: `nav-item ${state.view === view ? 'active' : ''}` }, [
    el('span', { class: 'nav-icon' }, [icon(i)]),
    el('span', {}, [label])
  ]);
  b.onclick = () => {
    state.view = view;
    notifyStateChange();
  };
  return b;
}

export function renderSidebar() {
  const activeOfficer = getActiveOfficer();

  const sidebar = el('aside', { class: 'sidebar' }, [
    el('button', {
      class: 'sidebar-toggle',
      title: state.sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar'),
      onclick: () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        notifyStateChange();
      }
    }, [state.sidebarCollapsed ? '▶' : '◀']),
    el('div', { class: 'nav-section-label' }, [t('workspace')]),
    navItem('overview', t('command'), 'grid'),
    navItem('network', t('network'), 'network'),
    navItem('fir', t('fir'), 'file'),
    ...(activeOfficer.isAdmin ? [
      navItem('officers', t('officers'), 'users'),
      navItem('audit_logs', t('auditLogs'), 'database')
    ] : []),
    el('div', { class: 'nav-section-label' }, [t('governance')]),
    navItem('sources', t('sources'), 'database'),

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
