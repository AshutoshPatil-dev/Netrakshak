import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, notifyStateChange, openEntityProfile } from '../state.js';
import { supabaseConfigured } from '../lib/supabase.js';
import { showToast } from '../components/Toast.js';
import { objectTypeColors, objectTypeIcons } from './NetworkGraphView.js';

export function card(title, value, foot, cls = '') {
  return el('div', { class: `metric-card ${cls}` }, [
    el('div', { class: 'metric-top' }, [
      el('span', { class: 'metric-label' }, [title]),
      el('span', { class: 'metric-spark' }, [icon('pulse')])
    ]),
    el('strong', { class: 'metric-value' }, [value]),
    el('span', { class: 'metric-foot' }, [foot])
  ]);
}

export function intelligenceSummaryPanel() {
  const categories = [
    { type: 'FIR Case', label: 'FIR Cases', iconName: 'file' },
    { type: 'Person', label: 'Suspects & Persons', iconName: 'user' },
    { type: 'Vehicle', label: 'Vehicles', iconName: 'grid' },
    { type: 'Phone', label: 'Phones / SIMs', iconName: 'pulse' },
    { type: 'Bank', label: 'Mule Accounts', iconName: 'database' },
    { type: 'Location', label: 'Cell Towers', iconName: 'network' }
  ];

  return el('section', { class: 'panel' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, ['Intelligence Multi-Object Summary']),
        el('span', { class: 'muted' }, ['Active entities across the intelligence database'])
      ]),
      el('button', {
        class: 'text-btn',
        onclick: () => { state.view = 'network'; notifyStateChange(); }
      }, ['Explore Graph', icon('arrow')])
    ]),
    el('div', { style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; padding: 14px 0;' }, categories.map(cat => {
      const count = entities.filter(e => e.type === cat.type).length;
      const color = objectTypeColors[cat.type] || '#1E293B';
      return el('button', {
        style: 'background: var(--app-surface); border: 1px solid var(--app-border); border-radius: 8px; padding: 12px; text-align: left; cursor: pointer; transition: all 0.15s ease;',
        onclick: () => {
          state.type = cat.type.toLowerCase();
          state.view = 'network';
          notifyStateChange();
        }
      }, [
        el('div', { style: `width: 26px; height: 26px; border-radius: 6px; background: ${color}15; color: ${color}; display: grid; place-items: center; font-size: 12px; margin-bottom: 8px;` }, [
          icon(cat.iconName)
        ]),
        el('strong', { style: 'display: block; font-size: 16px; color: var(--app-text); line-height: 1.1;' }, [String(count)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: var(--app-text-secondary); margin-top: 2px; display: block;' }, [cat.label])
      ]);
    }))
  ]);
}

export function riskPanel() {
  const high = entities.filter(e => e.risk === 'high').length;
  const medium = entities.filter(e => e.risk === 'medium').length;
  const low = entities.filter(e => e.risk === 'low').length;

  return el('section', { class: 'panel' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, [t('riskPulse')]),
        el('span', { class: 'muted' }, ['Risk Level Summary'])
      ]),
      el('button', { class: 'icon-btn', onclick: () => showToast(t('refreshed')) }, ['•••'])
    ]),
    el('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 0;' }, [
      el('div', { style: 'background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #DC2626;' }, [String(high)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #991B1B;' }, ['HIGH RISK'])
      ]),
      el('div', { style: 'background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #D97706;' }, [String(medium)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #92400E;' }, ['MEDIUM RISK'])
      ]),
      el('div', { style: 'background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #16A34A;' }, [String(low)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #166534;' }, ['LOW RISK'])
      ])
    ])
  ]);
}

export function renderOverview(c) {
  c.innerHTML = '';
  const highRiskCount = entities.filter(e => e.risk === 'high').length;

  const activeCaseCard = firCases.length > 0 ? el('div', { class: 'case-row' }, [
    el('div', { class: 'case-main' }, [
      el('div', { class: 'case-icon' }, [icon('network')]),
      el('div', {}, [
        el('strong', {}, [firCases[0].fir_number || 'FIR Case']),
        el('span', {}, [`${firCases[0].police_station || ''} · ${firCases[0].district || ''}`])
      ])
    ]),
    el('div', { class: 'case-progress' }, [
      el('div', { class: 'progress-label' }, [t('networkConfidence'), el('strong', {}, ['100%'])]),
      el('div', { class: 'progress' }, [el('span', { style: 'width:100%' })])
    ]),
    el('button', { class: 'icon-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('arrow')])
  ]) : el('div', { class: 'case-row' }, [
    el('div', { class: 'case-main' }, [
      el('div', { class: 'case-icon' }, [icon('file')]),
      el('div', {}, [
        el('strong', {}, ['No Active Investigation Cases']),
        el('span', {}, ['Record an FIR or intake evidence to initiate criminal linkage analysis.'])
      ])
    ]),
    el('button', { class: 'primary-btn small', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('plus'), 'New FIR Intake'])
  ]);

  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, [t('today')]),
        el('h1', {}, [t('welcome')]),
        el('p', { class: 'muted' }, [t('briefing')])
      ]),
      el('button', { class: 'outline-btn', onclick: () => { state.view = 'network'; notifyStateChange(); } }, [icon('network'), t('viewNetwork')])
    ]),
    el('div', { class: 'metric-grid' }, [
      card(t('alerts'), String(highRiskCount), 'High risk priority', 'metric-red'),
      card(t('entities'), String(entities.length), 'Entities in database', 'metric-blue'),
      card(t('connections'), String(edges.length), 'Verified linkages', 'metric-green'),
      card(t('fir'), String(firCases.length), 'Registered FIR dossiers', 'metric-purple')
    ]),
    el('div', { class: 'dashboard-grid' }, [intelligenceSummaryPanel(), riskPanel()]),
    el('div', { class: 'section-heading' }, [
      el('h2', {}, [t('activeCase')]),
      el('button', { class: 'text-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [t('viewAll'), icon('arrow')])
    ]),
    activeCaseCard
  );
}

