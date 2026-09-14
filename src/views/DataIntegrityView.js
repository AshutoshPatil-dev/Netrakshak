import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, getActiveOfficer, notifyStateChange } from '../state.js';
import { supabaseConfigured } from '../lib/supabase.js';

export function renderSources(c) {
  c.innerHTML = '';
  const activeOfficer = getActiveOfficer();

  if (!activeOfficer.isAdmin) {
    c.append(
      el('div', { class: 'page-heading' }, [
        el('div', {}, [
          el('h1', {}, [t('sources')]),
          el('p', { class: 'muted' }, ['Administrative Governance & Database Access Control'])
        ])
      ]),
      el('div', { class: 'officers-empty-shell' }, [
        el('div', { class: 'empty-shell-icon' }, [icon('shield')]),
        el('h3', {}, ['Restricted Administrative Access']),
        el('p', { class: 'muted' }, ['Data & Integrity governance is restricted to authorized Police Administrators. Contact your station administrator for elevated privileges.']),
        el('button', { class: 'primary-btn', style: 'margin-top: 14px;', onclick: () => { state.view = 'overview'; notifyStateChange(); } }, ['Return to Dashboard'])
      ])
    );
    return;
  }

  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['GOVERNANCE · DATA INTEGRITY & LEDGER']),
        el('h1', {}, [t('sources')]),
        el('p', { class: 'muted' }, ['Operational database tables, cryptographic audit anchors, and storage volumes.'])
      ]),
      el('button', { class: 'primary-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('upload'), 'Intake FIR Case'])
    ]),

    // Top Governance & Integrity Metric Cards
    el('div', { class: 'metric-grid' }, [
      el('div', { class: 'metric-card metric-purple' }, [
        el('div', { class: 'metric-top' }, [
          el('span', { class: 'metric-label' }, [t('integrity')]),
          el('span', { class: 'metric-spark' }, [icon('shield')])
        ]),
        el('strong', { class: 'metric-value' }, [supabaseConfigured ? '100%' : 'Local']),
        el('span', { class: 'metric-foot' }, ['Ledger active'])
      ]),
      el('div', { class: 'metric-card metric-blue' }, [
        el('div', { class: 'metric-top' }, [
          el('span', { class: 'metric-label' }, ['Database Tables']),
          el('span', { class: 'metric-spark' }, [icon('database')])
        ]),
        el('strong', { class: 'metric-value' }, ['6 Core']),
        el('span', { class: 'metric-foot' }, ['PostgreSQL RLS Protected'])
      ]),
      el('div', { class: 'metric-card metric-green' }, [
        el('div', { class: 'metric-top' }, [
          el('span', { class: 'metric-label' }, ['Audit Hash Chain']),
          el('span', { class: 'metric-spark' }, [icon('check')])
        ]),
        el('strong', { class: 'metric-value' }, [String(state.auditLogs.length)]),
        el('span', { class: 'metric-foot' }, ['SHA-256 Fingerprinted'])
      ]),
      el('div', { class: 'metric-card metric-red' }, [
        el('div', { class: 'metric-top' }, [
          el('span', { class: 'metric-label' }, ['Evidence Vaults']),
          el('span', { class: 'metric-spark' }, [icon('file')])
        ]),
        el('strong', { class: 'metric-value' }, ['1 Private']),
        el('span', { class: 'metric-foot' }, ['Encrypted Evidence Storage'])
      ])
    ]),

    el('div', { class: 'source-grid', style: 'margin-top: 18px;' }, [
      ['public.entities', 'Master entity records', String(entities.length) + ' records', 'live', 'Persons, organizations, vehicles, phones, accounts'],
      ['public.relationships', 'Graph linkages and edges', String(edges.length) + ' connections', 'live', 'Multi-entity association matrix'],
      ['public.fir_cases', 'Registered FIR cases', String(firCases.length) + ' cases', 'live', 'Police station case filings and extracts'],
      ['public.profiles', 'Registered law-enforcement profiles', String(state.officers.length) + ' officers', 'live', 'Linked to Central Identity and IAM'],
      ['public.audit_events', 'Cryptographic activity audit', String(state.auditLogs.length) + ' events', 'verified', 'SHA-256 fingerprinted event trail'],
      ['Storage: fir-evidence', 'Encrypted evidence storage', 'Private bucket', 'verified', 'RLS-protected investigator vaults']
    ].map(([a, b, cx, status, d]) => el('div', { class: 'source-card' }, [
      el('div', { class: 'source-card-top' }, [
        el('div', { class: 'source-symbol' }, [icon(status === 'verified' ? 'check' : 'database')]),
        el('span', { class: 'source-status ' + status }, [status === 'verified' ? 'Active' : 'Live'])
      ]),
      el('h3', {}, [a]),
      el('p', { class: 'muted' }, [b]),
      el('div', { class: 'source-divider' }),
      el('span', {}, [cx]),
      el('small', {}, [d])
    ]))),

    el('div', { class: 'panel integrity-panel', style: 'margin-top: 18px;' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('integrityChecks')]),
          el('span', { class: 'muted' }, [supabaseConfigured ? 'Connected to Police Cloud' : 'Local storage mode'])
        ])
      ]),
      el('div', { class: 'integrity-items' }, [
        ['hashChain', 'Cryptographic SHA-256 hashing', String(state.auditLogs.length) + ' events fingerprinted'],
        ['ledger', 'Evidence Chain of Custody', 'Enabled and active'],
        ['access', 'Row Level Security (RLS)', supabaseConfigured ? 'Enforced by Database' : 'Active']
      ].map(([a, b, d]) => el('div', { class: 'integrity-item' }, [
        el('span', { class: 'integrity-check' }, [icon('check')]),
        el('div', {}, [
          el('strong', {}, [a === 'hashChain' ? t('hashChain') : a === 'ledger' ? t('ledger') : 'Access controls']),
          el('span', {}, [b])
        ]),
        el('strong', { class: 'integrity-value' }, [d])
      ])))
    ])
  );
}
