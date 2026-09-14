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

export function womenSafetyCommandPanel() {
  const wsCases = firCases.filter(c => c.isWomenSafety || /stalk|harass|354|78|75|pocso|women/i.test(`${c.sections} ${c.policeStation} ${c.police_station}`));
  return el('section', { class: 'panel women-safety-panel' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow rose' }, ['Special Operation Cell']),
        el('h3', { style: 'color: #BE123C; display: flex; align-items: center; gap: 8px;' }, [
          icon('shield'),
          'Women & Child Safety Priority Command'
        ]),
        el('span', { class: 'muted' }, ['Fast-Track Bharatiya Nagarik Suraksha Sanhita (BNSS) & Section 73 Identity Protection Monitor'])
      ]),
      el('button', {
        class: 'primary-btn small rose-btn',
        onclick: () => {
          state.womenSafetyFilter = true;
          state.view = 'fir';
          notifyStateChange();
        }
      }, [icon('file'), 'View Safety FIRs'])
    ]),
    el('div', { class: 'women-safety-stats-grid' }, [
      el('div', { class: 'safety-stat-card' }, [
        el('span', { class: 'safety-stat-val' }, [String(wsCases.length)]),
        el('span', { class: 'safety-stat-lbl' }, ['Priority Safety FIRs']),
        el('span', { class: 'safety-stat-sub' }, ['100% Identity Redacted'])
      ]),
      el('div', { class: 'safety-stat-card' }, [
        el('span', { class: 'safety-stat-val' }, ['48h']),
        el('span', { class: 'safety-stat-lbl' }, ['Sec 164 BNSS Target']),
        el('span', { class: 'safety-stat-sub' }, ['Judicial Statement Protocol'])
      ]),
      el('div', { class: 'safety-stat-card' }, [
        el('span', { class: 'safety-stat-val' }, ['60 Days']),
        el('span', { class: 'safety-stat-lbl' }, ['Chargesheet Mandate']),
        el('span', { class: 'safety-stat-sub' }, ['Strict Statutory Timeline'])
      ]),
      el('div', { class: 'safety-stat-card' }, [
        el('span', { class: 'safety-stat-val text-red' }, ['1 High Risk']),
        el('span', { class: 'safety-stat-lbl' }, ['Repeat Cyber Stalker']),
        el('span', { class: 'safety-stat-sub' }, ['Deepak Verma (VoIP Hub)'])
      ])
    ])
  ]);
}

export function renderOverview(c) {
  c.innerHTML = '';
  const highRiskCount = entities.filter(e => e.risk === 'high').length;

  const activeCase = state.womenSafetyFilter 
    ? (firCases.find(c => c.isWomenSafety) || firCases[0])
    : firCases[0];

  const activeCaseCard = activeCase ? el('div', { class: 'case-row' }, [
    el('div', { class: 'case-main' }, [
      el('div', { class: `case-icon ${activeCase.isWomenSafety ? 'rose-icon' : ''}` }, [icon(activeCase.isWomenSafety ? 'shield' : 'network')]),
      el('div', {}, [
        el('strong', {}, [
          activeCase.fir_number || activeCase.firNumber || 'FIR Case',
          activeCase.isWomenSafety ? el('span', { class: 'case-tag-rose' }, ['Women Safety Priority']) : null
        ]),
        el('span', {}, [`${activeCase.police_station || activeCase.policeStation || ''} · ${activeCase.district || ''}`])
      ])
    ]),
    el('div', { class: 'case-progress' }, [
      el('div', { class: 'progress-label' }, [
        activeCase.isWomenSafety ? 'BNSS Fast-Track Audit' : t('networkConfidence'),
        el('strong', {}, ['100%'])
      ]),
      el('div', { class: 'progress' }, [el('span', { style: `width:100%; ${activeCase.isWomenSafety ? 'background: #E11D48;' : ''}` })])
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

  const dashboardElements = [
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: `eyebrow ${state.womenSafetyFilter ? 'rose' : 'blue'}` }, [
          state.womenSafetyFilter ? 'Women & Child Safety Command Lens Active' : t('today')
        ]),
        el('h1', {}, [
          state.womenSafetyFilter ? 'Women & Child Protection Intelligence' : t('welcome')
        ]),
        el('p', { class: 'muted' }, [
          state.womenSafetyFilter 
            ? 'Real-time surveillance & fast-track intelligence on stalking, harassment, missing vulnerable persons, and cyber threats.'
            : t('briefing')
        ])
      ]),
      el('div', { style: 'display: flex; gap: 8px;' }, [
        el('button', {
          class: `outline-btn ${state.womenSafetyFilter ? 'active-rose-btn' : ''}`,
          onclick: () => {
            state.womenSafetyFilter = !state.womenSafetyFilter;
            notifyStateChange();
          }
        }, [icon('shield'), state.womenSafetyFilter ? 'Exit Safety Lens' : 'Women Safety Lens']),
        el('button', { class: 'outline-btn', onclick: () => { state.view = 'network'; notifyStateChange(); } }, [icon('network'), t('viewNetwork')])
      ])
    ]),
    el('div', { class: 'metric-grid' }, [
      card(t('alerts'), String(highRiskCount), 'High risk priority', 'metric-red'),
      card(t('entities'), String(entities.length), 'Entities in database', 'metric-blue'),
      card(t('connections'), String(edges.length), 'Verified linkages', 'metric-green'),
      card(t('fir'), String(firCases.length), 'Registered FIR dossiers', 'metric-purple')
    ]),
    state.womenSafetyFilter ? womenSafetyCommandPanel() : null,
    el('div', { class: 'dashboard-grid' }, [intelligenceSummaryPanel(), riskPanel()]),
    el('div', { class: 'section-heading' }, [
      el('h2', {}, [state.womenSafetyFilter ? 'Priority Fast-Track Case' : t('activeCase')]),
      el('button', { class: 'text-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [t('viewAll'), icon('arrow')])
    ]),
    activeCaseCard
  ].filter(Boolean);

  c.append(...dashboardElements);
}


