import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, notifyStateChange, openEntityProfile, startGraphInvestigation } from '../state.js';
import { showToast } from '../components/Toast.js';
import { objectTypeColors, objectTypeIcons } from './NetworkGraphView.js';

export const CHRONOLOGICAL_EVENTS = [
  {
    id: 'ev_01',
    date: '2026-08-16',
    time: '21:10',
    type: 'fir_registration',
    category: 'Women Safety / Cyber Crime',
    severity: 'high',
    title: 'FIR Registered: Cyber-Stalking & Extortion Racket',
    caseNumber: 'FIR-MH-2026-9041',
    station: 'Women & Child Cyber Protection Unit, Shivajinagar',
    description: 'Victim statement recorded under Section 73 BNS protection. Cyber cell uncovers untraceable VoIP routing and shared burner handset originating from FC Road boiler room.',
    entities: [
      { id: 'e0000001-0000-0000-0000-000000000010', name: 'Deepak Verma', role: 'VoIP Lead', type: 'Person' },
      { id: 'e0000002-0000-0000-0000-000000000002', name: '+91 98199 44312', role: 'Burner Telephony', type: 'Phone' }
    ]
  },
  {
    id: 'ev_02',
    date: '2026-08-14',
    time: '14:30',
    type: 'fir_registration',
    category: 'Financial Syndicate',
    severity: 'high',
    title: 'FIR Registered: Multi-Crore Synthetic Crypto Fraud',
    caseNumber: 'FIR-MH-2026-4821',
    station: 'Cyber Crime Police Station, Shivajinagar',
    description: 'Complainant Rajesh Kulkarni defrauded of INR 14.50L via forged investment bond portal and cryptocurrency layering route.',
    entities: [
      { id: 'e0000001-0000-0000-0000-000000000001', name: 'Sameer Khan', role: 'Syndicate Kingpin', type: 'Person' },
      { id: 'e0000004-0000-0000-0000-000000000001', name: 'HDFC-50100492817291', role: 'Intake Mule Account', type: 'Bank' }
    ]
  },
  {
    id: 'ev_03',
    date: '2026-08-14',
    time: '14:43',
    type: 'financial_transfer',
    category: 'Layering Velocity',
    severity: 'high',
    title: 'Rapid IMPS Multi-Split Dispersal',
    caseNumber: 'FIR-MH-2026-4821',
    station: 'Financial Intelligence Unit',
    description: 'INR 14,50,000 received in HDFC mule account is split in 13 minutes across ICICI and AXIS accounts to evade automatic banking freezes.',
    entities: [
      { id: 'e0000004-0000-0000-0000-000000000001', name: 'HDFC-50100492817291', role: 'Primary Layering', type: 'Bank' },
      { id: 'e0000004-0000-0000-0000-000000000002', name: 'ICICI-0021948102', role: 'Split Account', type: 'Bank' },
      { id: 'e0000004-0000-0000-0000-000000000003', name: 'AXIS-91201004812', role: 'ATM Dispersal Account', type: 'Bank' }
    ]
  },
  {
    id: 'ev_04',
    date: '2026-08-12',
    time: '18:20',
    type: 'anpr_sighting',
    category: 'Mobility Surveillance',
    severity: 'medium',
    title: 'ANPR Hit: Getaway Vehicle Sighting at Shivajinagar Junction',
    caseNumber: 'General Surveillance',
    station: 'Pune Traffic Command / ANPR Grid',
    description: 'Vehicle MH-12-PQ-9081 (White Swift) captured across 4 automated toll cameras co-located with active cell tower sector PN-CY-482.',
    entities: [
      { id: 'e0000003-0000-0000-0000-000000000001', name: 'MH-12-PQ-9081', role: 'Getaway Vehicle', type: 'Vehicle' },
      { id: 'e0000005-0000-0000-0000-000000000001', name: 'Cell Tower PN-CY-482', role: 'FC Road Base', type: 'Location' }
    ]
  },
  {
    id: 'ev_05',
    date: '2026-08-11',
    time: '19:45',
    type: 'fir_registration',
    category: 'Organized Extortion',
    severity: 'high',
    title: 'FIR Registered: Swargate Hafta Extortion & Firearms',
    caseNumber: 'FIR-MH-2026-2811',
    station: 'Swargate Police Station',
    description: 'Protection money extortion racket targeting timber merchants. Countrymade firearm and threat slips recovered from motorcycle couriers.',
    entities: [
      { id: 'e0000001-0000-0000-0000-000000000005', name: 'Suresh Shinde', role: 'Extortion Kingpin', type: 'Person' },
      { id: 'e0000003-0000-0000-0000-000000000002', name: 'MH-14-EA-7712', role: 'Black Pulsar', type: 'Vehicle' }
    ]
  },
  {
    id: 'ev_06',
    date: '2026-08-02',
    time: '16:00',
    type: 'fir_registration',
    category: 'Corporate Shell Front',
    severity: 'high',
    title: 'FIR Registered: Apex Digital Asset Identity Theft',
    caseNumber: 'FIR-MH-2026-0512',
    station: 'Bandra Cyber Police Station, Mumbai',
    description: 'Offshore crypto bond conversion and forged ROC filings managed by Maya Shelar and Vikram Rathi via Bandra Kurla Complex shell office.',
    entities: [
      { id: 'e0000001-0000-0000-0000-000000000008', name: 'Maya Shelar', role: 'Shell Director', type: 'Person' },
      { id: 'e0000006-0000-0000-0000-000000000001', name: 'Apex Digital Asset LLP', role: 'Shell Entity', type: 'Organization' },
      { id: 'e0000003-0000-0000-0000-000000000003', name: 'MH-01-DK-3490', role: 'Executive Fortuner', type: 'Vehicle' }
    ]
  },
  {
    id: 'ev_07',
    date: '2026-07-22',
    time: '11:15',
    type: 'fir_registration',
    category: 'Mule Recruitment Hub',
    severity: 'medium',
    title: 'FIR Registered: Student Admission Mule Recruiter Hub',
    caseNumber: 'FIR-MH-2026-1940',
    station: 'Kothrud Police Station',
    description: 'Arjun Pawar and Rohit Salunkhe arrested in safehouse with 12 unlinked debit cards and student UPI credentials.',
    entities: [
      { id: 'e0000001-0000-0000-0000-000000000004', name: 'Arjun Pawar', role: 'Mule Recruiter', type: 'Person' },
      { id: 'e0000004-0000-0000-0000-000000000003', name: 'AXIS-91201004812', role: 'ATM Account', type: 'Bank' }
    ]
  },
  {
    id: 'ev_08',
    date: '2026-07-15',
    time: '02:40',
    type: 'telephony_spike',
    category: 'CDR Intercepts',
    severity: 'high',
    title: 'Late-Night Burner SIM Activity Cluster',
    caseNumber: 'Inter-Agency Intelligence',
    station: 'Special Investigation Team (SIT)',
    description: '74 high-frequency encrypted calls exchanged between Sameer Khan, Vikram Rathi, and Deepak Verma prior to nationwide phishing wave.',
    entities: [
      { id: 'e0000002-0000-0000-0000-000000000001', name: '+91 98811 55421', role: 'Primary Burner', type: 'Phone' },
      { id: 'e0000002-0000-0000-0000-000000000002', name: '+91 98199 44312', role: 'Tech Burner', type: 'Phone' }
    ]
  }
];

let timelineFilterType = 'all';
let timelineSearchQuery = '';

export function renderTimeline(c) {
  c.innerHTML = '';

  const filteredEvents = CHRONOLOGICAL_EVENTS.filter(ev => {
    if (timelineFilterType !== 'all') {
      if (timelineFilterType === 'fir' && ev.type !== 'fir_registration') return false;
      if (timelineFilterType === 'financial' && ev.type !== 'financial_transfer') return false;
      if (timelineFilterType === 'mobility' && ev.type !== 'anpr_sighting') return false;
      if (timelineFilterType === 'telephony' && ev.type !== 'telephony_spike') return false;
    }
    if (timelineSearchQuery) {
      const q = timelineSearchQuery.toLowerCase();
      const matchText = `${ev.title} ${ev.description} ${ev.caseNumber} ${ev.station} ${ev.entities.map(e => e.name).join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const pageHeader = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['Investigation Chronology']),
      el('h1', {}, ['Unified Multi-Case Incident Timeline']),
      el('p', { class: 'muted' }, ['Sequential chronological reconstruction of FIR registrations, telephony CDR bursts, financial laundering routing, and mobility sightings across police jurisdictions.'])
    ]),
    el('div', { style: 'display: flex; gap: 8px;' }, [
      el('button', {
        class: 'outline-btn',
        onclick: () => window.print()
      }, [icon('file'), 'Print Court Chronology']),
      el('button', {
        class: 'primary-btn',
        onclick: () => {
          state.view = 'network';
          notifyStateChange();
        }
      }, [icon('network'), 'Explore in Network Graph'])
    ])
  ]);

  const filterBar = el('div', { class: 'timeline-filter-bar' }, [
    el('div', { class: 'timeline-filter-chips' }, [
      { id: 'all', label: 'All Events' },
      { id: 'fir', label: 'FIR Registrations' },
      { id: 'telephony', label: 'Telephony (CDR)' },
      { id: 'financial', label: 'Financial Routing' },
      { id: 'mobility', label: 'ANPR Mobility' }
    ].map(tab => el('button', {
      class: `timeline-chip ${timelineFilterType === tab.id ? 'active' : ''}`,
      onclick: () => {
        timelineFilterType = tab.id;
        renderTimeline(c);
      }
    }, [tab.label]))),
    el('input', {
      type: 'text',
      class: 'ai-search-input',
      placeholder: 'Filter events by suspect name, FIR number, police station...',
      style: 'max-width: 380px;',
      value: timelineSearchQuery,
      oninput: (e) => {
        timelineSearchQuery = e.target.value;
        renderTimeline(c);
      }
    })
  ]);

  const timelineContainer = el('div', { class: 'timeline-stream-container' }, filteredEvents.length > 0 ? filteredEvents.map((ev, index) => {
    let iconName = 'file';
    let typeBadgeColor = '#2563EB';
    if (ev.type === 'fir_registration') { iconName = 'shield'; typeBadgeColor = '#DC2626'; }
    else if (ev.type === 'financial_transfer') { iconName = 'database'; typeBadgeColor = '#D97706'; }
    else if (ev.type === 'anpr_sighting') { iconName = 'grid'; typeBadgeColor = '#059669'; }
    else if (ev.type === 'telephony_spike') { iconName = 'pulse'; typeBadgeColor = '#7C3AED'; }

    return el('div', { class: `timeline-event-card ${ev.severity}` }, [
      el('div', { class: 'timeline-time-col' }, [
        el('strong', { class: 'event-date' }, [ev.date]),
        el('span', { class: 'event-time' }, [ev.time || '12:00']),
        el('span', { class: `event-severity-tag ${ev.severity}` }, [ev.severity.toUpperCase()])
      ]),
      el('div', { class: 'timeline-spine-col' }, [
        el('div', { class: 'timeline-node-icon', style: `background: ${typeBadgeColor}15; color: ${typeBadgeColor}; border-color: ${typeBadgeColor};` }, [
          icon(iconName)
        ]),
        index < filteredEvents.length - 1 ? el('div', { class: 'timeline-connecting-spine' }) : null
      ]),
      el('div', { class: 'timeline-content-col' }, [
        el('div', { class: 'event-meta-top' }, [
          el('span', { class: 'event-case-tag' }, [ev.caseNumber]),
          el('span', { class: 'event-station-name' }, [ev.station]),
          el('span', { class: 'event-category-pill' }, [ev.category])
        ]),
        el('h3', { class: 'event-title' }, [ev.title]),
        el('p', { class: 'event-description' }, [ev.description]),
        el('div', { class: 'event-involved-entities' }, [
          el('strong', { style: 'font-size: 11px; color: var(--app-text-secondary); margin-right: 6px;' }, ['Involved:']),
          ...ev.entities.map(ent => el('button', {
            class: 'event-entity-btn',
            onclick: () => openEntityProfile(ent.id)
          }, [
            el('span', { class: 'entity-tag-type' }, [ent.type]),
            `: ${ent.name} `,
            el('small', { class: 'entity-tag-role' }, [`(${ent.role})`])
          ]))
        ])
      ])
    ]);
  }) : [
    el('div', { class: 'empty-timeline-state' }, [
      icon('alert'),
      el('h3', {}, ['No Timeline Events Found']),
      el('p', { class: 'muted' }, ['Try resetting your search query or changing event category filters.'])
    ])
  ]);

  c.append(pageHeader, filterBar, timelineContainer);
}
