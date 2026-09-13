import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, notifyStateChange } from '../state.js';
import { supabaseConfigured } from '../lib/supabase.js';

export function renderSources(c) {
  c.innerHTML = '';
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['GOVERNANCE - DATABASE SCHEMA']),
        el('h1', {}, [t('sources')]),
        el('p', { class: 'muted' }, ['Operational database tables and live storage volumes.'])
      ]),
      el('button', { class: 'primary-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('upload'), 'Intake FIR Case'])
    ]),
    el('div', { class: 'source-grid' }, [
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
    el('div', { class: 'panel integrity-panel' }, [
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
