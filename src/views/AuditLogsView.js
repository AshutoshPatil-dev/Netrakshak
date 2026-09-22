import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, getActiveOfficer, notifyStateChange } from '../state.js';

export function renderAuditLogs(c) {
  c.innerHTML = '';
  const activeOfficer = getActiveOfficer();

  if (!activeOfficer.isAdmin) {
    c.append(el('div', { class: 'restricted-access-panel' }, [
      el('div', { class: 'restricted-lock-icon' }, [icon('lock')]),
      el('div', { class: 'restricted-badge' }, ['RESTRICTED CLEARANCE']),
      el('h2', {}, ['Administrator Clearance Required']),
      el('p', {}, [
        'Immutable audit logs, SHA-256 chain-of-custody ledgers, and forensic activity streams are strictly restricted to System Administrators for evidentiary compliance and data privacy.'
      ]),
      el('div', { class: 'restricted-officer-info' }, [
        el('span', {}, ['Current Officer:']),
        el('strong', {}, [activeOfficer.name]),
        el('span', { class: 'role-tag' }, [`Role: ${(activeOfficer.rawRole || 'case-officer').toUpperCase()}`])
      ]),
      el('button', {
        class: 'primary-btn small',
        onclick: () => { state.view = 'overview'; notifyStateChange(); }
      }, ['Return to Dashboard'])
    ]));
    return;
  }

  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('h1', {}, [t('auditLogs')]),
      el('p', { class: 'muted' }, [t('auditSubtitle')])
    ])
  ]);

  const totalCount = state.auditLogs.length;
  const warningCount = state.auditLogs.filter(l => l.level === 'warning').length;
  const criticalCount = state.auditLogs.filter(l => l.level === 'critical').length;

  const metricGrid = el('div', { class: 'audit-metric-grid' }, [
    el('div', { class: 'audit-metric-card' }, [
      el('span', { class: 'audit-metric-label' }, ['ALL']),
      el('strong', { class: 'audit-metric-value' }, [String(totalCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Total recorded events'])
    ]),
    el('div', { class: 'audit-metric-card warning-card' }, [
      el('span', { class: 'audit-metric-label' }, ['WARNINGS']),
      el('strong', { class: 'audit-metric-value' }, [String(warningCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Review recommended'])
    ]),
    el('div', { class: 'audit-metric-card critical-card' }, [
      el('span', { class: 'audit-metric-label' }, ['CRITICAL EVENTS']),
      el('strong', { class: 'audit-metric-value' }, [String(criticalCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Immediate action required'])
    ]),
    el('div', { class: 'audit-metric-card tamper-card' }, [
      el('span', { class: 'audit-metric-label' }, [t('tamperAlerts')]),
      el('strong', { class: 'audit-metric-value' }, ['0']),
      el('span', { class: 'audit-metric-sub' }, [t('noActiveAlerts')])
    ])
  ]);

  const uniqueActors = Array.from(new Set(state.auditLogs.map(l => l.actor).filter(Boolean)));
  const uniqueActions = Array.from(new Set(state.auditLogs.map(l => l.action).filter(Boolean)));

  const searchInput = el('input', {
    placeholder: 'Search audit logs by officer, action, summary, timestamp…',
    value: state.auditSearchQuery || ''
  });
  searchInput.oninput = (e) => {
    state.auditSearchQuery = e.target.value;
    notifyStateChange();
    setTimeout(() => {
      const inp = document.querySelector('.audit-search-wrapper input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }, 0);
  };

  const actorSelect = el('select', { class: 'audit-filter-select' }, [
    el('option', { value: 'all' }, ['All Officers / Actors']),
    ...uniqueActors.map(a => {
      const opt = el('option', { value: a }, [a]);
      if (state.auditActorFilter === a) opt.selected = true;
      return opt;
    })
  ]);
  actorSelect.onchange = (e) => {
    state.auditActorFilter = e.target.value;
    notifyStateChange();
  };

  const actionSelect = el('select', { class: 'audit-filter-select' }, [
    el('option', { value: 'all' }, ['All Action Types']),
    ...uniqueActions.map(act => {
      const opt = el('option', { value: act }, [act]);
      if (state.auditActionFilter === act) opt.selected = true;
      return opt;
    })
  ]);
  actionSelect.onchange = (e) => {
    state.auditActionFilter = e.target.value;
    notifyStateChange();
  };

  const filterBar = el('div', { class: 'audit-filter-bar' }, [
    el('div', { class: 'audit-filter-row-top' }, [
      el('div', { class: 'audit-search-wrapper' }, [
        el('span', { class: 'audit-search-icon' }, [icon('search')]),
        searchInput
      ]),
      el('div', { class: 'audit-filter-selects' }, [
        actorSelect,
        actionSelect
      ])
    ]),
    el('div', { class: 'audit-filter-row-bottom' }, [
      el('div', { class: 'audit-filter-left' }, [
        el('span', { class: 'audit-filter-label' }, [t('level') + ':']),
        el('div', { class: 'audit-filter-pills' }, [
          ['all', t('all')],
          ['info', t('info') || 'Info'],
          ['warning', t('warnings') || 'Warnings'],
          ['critical', t('critical') || 'Critical']
        ].map(([lvl, label]) => {
          const btn = el('button', {
            class: `audit-pill ${state.auditLevelFilter === lvl ? 'active' : ''}`,
            onclick: () => {
              state.auditLevelFilter = lvl;
              notifyStateChange();
            }
          }, [label]);
          return btn;
        }))
      ])
    ])
  ]);

  const q = (state.auditSearchQuery || '').toLowerCase().trim();
  const filteredLogs = state.auditLogs.filter(log => {
    if (state.auditLevelFilter !== 'all' && log.level !== state.auditLevelFilter) return false;
    if (state.auditActorFilter !== 'all' && log.actor !== state.auditActorFilter) return false;
    if (state.auditActionFilter !== 'all' && log.action !== state.auditActionFilter && log.actionType !== state.auditActionFilter) return false;
    if (q) {
      const matchActor = (log.actor || '').toLowerCase().includes(q);
      const matchAction = (log.action || '').toLowerCase().includes(q);
      const matchSummary = (log.summary || '').toLowerCase().includes(q);
      const matchTime = (log.time || '').toLowerCase().includes(q);
      const matchLevel = (log.level || '').toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchSummary && !matchTime && !matchLevel) return false;
    }
    return true;
  });

  const tableBody = filteredLogs.length > 0 ? filteredLogs.map(log => {
    const actionClass = log.actionType || 'system';
    const level = (log.level || 'info').toLowerCase();
    const isSystemAction = log.actionType === 'integrity' || log.action === 'Integrity alert' || log.actor === 'System (Vault Engine)';
    const displayActor = isSystemAction ? 'System (Vault Engine)' : (log.actor || 'System');
    const displayInitials = isSystemAction ? 'SYS' : (log.actorInitials || (displayActor ? displayActor.slice(0, 2).toUpperCase() : 'OF'));

    return el('tr', {}, [
      el('td', { class: 'audit-time-cell' }, [log.time]),
      el('td', {}, [
        el('span', { class: `audit-level-badge ${level}` }, [
          icon(level === 'critical' ? 'alert' : (level === 'warning' ? 'alert' : 'check')),
          level.toUpperCase()
        ])
      ]),
      el('td', {}, [
        el('div', { class: 'audit-actor-cell' }, [
          el('div', { class: 'audit-actor-avatar', style: isSystemAction ? 'background: #475569;' : '' }, [displayInitials]),
          el('strong', {}, [displayActor])
        ])
      ]),
      el('td', {}, [
        el('span', { class: `audit-action-pill ${actionClass}` }, [log.action])
      ]),
      el('td', { class: 'audit-summary-cell' }, [log.summary])
    ]);
  }) : [
    el('tr', {}, [
      el('td', { colspan: '5', style: 'text-align: center; padding: 48px 16px; color: var(--muted); font-size: 13px;' }, ['No audit log events match the current filter criteria.'])
    ])
  ];

  const table = el('table', { class: 'audit-table' }, [
    el('thead', {}, [
      el('tr', {}, [
        el('th', { style: 'width: 130px;' }, [t('time')]),
        el('th', { style: 'width: 105px;' }, ['Level']),
        el('th', { style: 'width: 170px;' }, [t('actor')]),
        el('th', { style: 'width: 150px;' }, [t('action')]),
        el('th', {}, [t('summary')])
      ])
    ]),
    el('tbody', {}, tableBody)
  ]);

  const tablePanel = el('div', { class: 'audit-table-panel' }, [table]);

  c.append(header, metricGrid, filterBar, tablePanel);
}
