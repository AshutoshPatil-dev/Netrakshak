import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, getActiveOfficer, notifyStateChange } from '../state.js';
import { supabaseConfigured } from '../lib/supabase.js';
import { runCryptographicAudit } from '../lib/integrity.js';

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

  // Auto-run audit if not yet completed
  if (!state.integrityAuditResult && !state.isIntegrityAuditing) {
    runCryptographicAudit();
  }

  const audit = state.integrityAuditResult;
  const isAuditing = state.isIntegrityAuditing;
  const integrityScore = audit ? audit.integrityPercentage : (supabaseConfigured ? 100 : 100);
  const hasBreaches = audit ? audit.hasBreaches : false;
  const missingFilesCount = audit ? audit.missingFiles : 0;
  const tamperedFilesCount = audit ? audit.tamperedFiles : 0;
  const compromisedTablesCount = audit ? audit.compromisedTables : 0;

  // Header
  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['GOVERNANCE · DATA INTEGRITY & LEDGER']),
      el('h1', {}, [t('sources')]),
      el('p', { class: 'muted' }, ['Real-time cryptographic SHA-256 evidence verification, audit hash-chains, and database health.'])
    ]),
    el('div', { style: 'display: flex; gap: 10px;' }, [
      el('button', {
        class: `primary-btn ${isAuditing ? 'loading' : ''}`,
        disabled: isAuditing,
        onclick: async () => {
          await runCryptographicAudit();
        }
      }, [icon('check'), isAuditing ? 'Verifying Hashes…' : 'Run Cryptographic Audit']),
      el('button', { class: 'outline-btn', onclick: () => { state.view = 'fir'; notifyStateChange(); } }, [icon('upload'), 'Intake FIR Case'])
    ])
  ]);

  // Top Governance & Integrity Metric Cards
  const metrics = el('div', { class: 'metric-grid' }, [
    el('div', { class: `metric-card ${hasBreaches ? 'metric-red' : 'metric-purple'}` }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, [t('integrity')]),
        el('span', { class: 'metric-spark' }, [icon(hasBreaches ? 'alert' : 'shield')])
      ]),
      el('strong', { class: 'metric-value', style: hasBreaches ? 'color: #DC2626;' : '' }, [
        isAuditing ? '…' : `${integrityScore}%`
      ]),
      el('span', { class: 'metric-foot' }, [
        hasBreaches ? '⚠ Breaches Detected' : 'All Signatures & Tables Verified'
      ])
    ]),
    el('div', { class: 'metric-card metric-blue' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Database Tables']),
        el('span', { class: 'metric-spark' }, [icon('database')])
      ]),
      el('strong', { class: 'metric-value' }, [
        audit ? `${audit.operationalTables}/${audit.totalTables}` : '8 Core'
      ]),
      el('span', { class: 'metric-foot' }, [
        compromisedTablesCount > 0 ? `${compromisedTablesCount} Tables Compromised` : 'PostgreSQL RLS Protected'
      ])
    ]),
    el('div', { class: 'metric-card metric-green' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Evidence Files']),
        el('span', { class: 'metric-spark' }, [icon('file')])
      ]),
      el('strong', { class: 'metric-value' }, [
        audit ? `${audit.verifiedFiles}/${audit.vaultFilesCount ?? audit.totalFiles}` : String(state.evidenceItems?.length || 0)
      ]),
      el('span', { class: 'metric-foot' }, [
        missingFilesCount > 0
          ? `${missingFilesCount} Missing from Vault`
          : (audit?.localMetadataCount ? `${audit.localMetadataCount} Local Record(s)` : 'SHA-256 Fingerprinted')
      ])
    ]),
    el('div', { class: 'metric-card metric-amber' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Audit Hash Chain']),
        el('span', { class: 'metric-spark' }, [icon('check')])
      ]),
      el('strong', { class: 'metric-value' }, [String(audit?.totalAuditEvents || state.auditLogs.length)]),
      el('span', { class: 'metric-foot' }, ['Immutable Ledger Trail'])
    ])
  ]);

  // Breach Alert Banner
  let alertBanner = null;
  if (audit) {
    if (hasBreaches) {
      const breachItems = [];
      if (missingFilesCount > 0) {
        breachItems.push(`${missingFilesCount} evidence file(s) deleted from Supabase Storage Vault (404 Not Found in bucket).`);
      }
      if (tamperedFilesCount > 0) {
        breachItems.push(`${tamperedFilesCount} evidence file(s) modified or corrupted (SHA-256 hash mismatch detected).`);
      }
      if (compromisedTablesCount > 0) {
        breachItems.push(`${compromisedTablesCount} database table(s) inaccessible, dropped, or permission restricted.`);
      }

      alertBanner = el('div', { class: 'integrity-breach-banner' }, [
        el('div', { class: 'breach-banner-icon' }, ['⚠']),
        el('div', { class: 'breach-banner-content' }, [
          el('h4', {}, ['Critical Evidence Integrity Alert']),
          el('p', {}, ['The real-time cryptographic audit detected missing or tampered resources across your storage bucket and database tables:']),
          el('ul', { class: 'breach-bullet-list' }, breachItems.map(item => el('li', {}, [item])))
        ])
      ]);
    } else {
      alertBanner = el('div', { class: 'integrity-breach-banner all-good' }, [
        el('div', { class: 'breach-banner-icon' }, [icon('check')]),
        el('div', { class: 'breach-banner-content' }, [
          el('h4', {}, ['Evidence Vault & Ledger Intact']),
          el('p', {}, ['All storage files in fir-evidence match their recorded SHA-256 cryptographic signatures. All PostgreSQL core tables are operational and protected with Row Level Security (RLS).'])
        ])
      ]);
    }
  }

  // Action Status Bar
  const actionBar = el('div', { class: 'audit-action-bar' }, [
    el('div', { class: 'audit-status-text' }, [
      el('span', { class: `audit-pulse-dot ${hasBreaches ? 'breached' : ''}` }),
      el('strong', {}, [isAuditing ? 'Audit in progress…' : (hasBreaches ? 'Integrity Status: Compromised' : 'Integrity Status: Verified')]),
      el('span', { class: 'muted' }, [audit ? `(Last audited: ${audit.formattedTime})` : ''])
    ]),
    el('button', {
      class: 'outline-btn',
      disabled: isAuditing,
      onclick: async () => {
        await runCryptographicAudit();
      }
    }, [icon('refresh'), 'Re-Verify Storage & Tables'])
  ]);

  // Evidence Files SHA-256 Verification Table
  const evidenceRows = (audit?.evidenceResults || []).map(res => {
    let statusClass = 'verified';
    let statusLabel = 'VERIFIED (200 OK)';
    let statusIcon = 'check';
    let diagnosticColor = '#166534';
    let diagnosticText = res.details;

    if (res.status === 'DELETED') {
      statusClass = 'deleted';
      statusLabel = 'DELETED / 404 NOT FOUND';
      statusIcon = 'alert';
      diagnosticColor = '#991B1B';
    } else if (res.status === 'TAMPERED') {
      statusClass = 'tampered';
      statusLabel = 'CHECKSUM MISMATCH';
      statusIcon = 'alert';
      diagnosticColor = '#991B1B';
    } else if (res.status === 'NO_STORAGE_PATH') {
      statusClass = 'unregistered';
      statusLabel = 'DATABASE RECORD';
      statusIcon = 'database';
      diagnosticColor = '#92400E';
      diagnosticText = 'Cryptographically registered in PostgreSQL database registry';
    } else if (res.status === 'OFFLINE_MODE') {
      statusClass = 'unregistered';
      statusLabel = 'OFFLINE RECORD';
      statusIcon = 'database';
      diagnosticColor = '#92400E';
    } else if (res.status === 'ERROR') {
      statusClass = 'deleted';
      statusLabel = 'ERROR';
      statusIcon = 'alert';
      diagnosticColor = '#991B1B';
    }

    return el('tr', {}, [
      el('td', {}, [
        el('strong', { style: 'display: block; color: var(--navy);' }, [res.description]),
        el('small', { class: 'muted' }, [res.storagePath || 'Database registry metadata'])
      ]),
      el('td', {}, [
        el('span', { class: 'hash-pill', title: res.expectedHash || 'None' }, [
          res.expectedHash ? `${res.expectedHash.slice(0, 16)}…${res.expectedHash.slice(-8)}` : 'None'
        ])
      ]),
      el('td', {}, [
        el('span', { class: 'hash-pill', title: res.actualHash || diagnosticText }, [
          res.actualHash ? `${res.actualHash.slice(0, 16)}…${res.actualHash.slice(-8)}` : (res.status === 'DELETED' ? '404 NOT FOUND' : 'Database Managed')
        ])
      ]),
      el('td', {}, [
        el('span', { class: `status-pill-badge ${statusClass}` }, [
          icon(statusIcon),
          statusLabel
        ])
      ]),
      el('td', {}, [
        el('small', { style: `color: ${diagnosticColor};` }, [diagnosticText])
      ])
    ]);
  });

  const evidenceTableCard = el('div', { class: 'integrity-table-card' }, [
    el('div', { class: 'integrity-table-header' }, [
      el('h3', {}, ['Evidence Vault SHA-256 Signatures Audit']),
      el('span', { class: 'muted', style: 'font-size: 11px;' }, [
        audit ? `${audit.verifiedFiles || 0}/${audit.vaultFilesCount ?? audit.totalFiles} Vault Files Intact` : '0/0 Files Intact'
      ])
    ]),
    evidenceRows.length > 0
      ? el('table', { class: 'integrity-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', {}, ['Evidence Asset / Path']),
              el('th', {}, ['Registered SHA-256 Fingerprint']),
              el('th', {}, ['Live Storage Bucket Hash']),
              el('th', {}, ['Status']),
              el('th', {}, ['Audit Diagnostic'])
            ])
          ]),
          el('tbody', {}, evidenceRows)
        ])
      : el('div', { style: 'padding: 24px; text-align: center; color: var(--muted); font-size: 11px;' }, [
          'No evidence files registered in database registry.'
        ])
  ]);

  // Database Tables Health Table
  const tableRows = (audit?.tableResults || []).map(tRes => {
    const isOk = tRes.healthy;
    return el('tr', {}, [
      el('td', {}, [el('strong', {}, [tRes.tableName])]),
      el('td', {}, [`${tRes.count} records`]),
      el('td', {}, [
        el('span', { class: `status-pill-badge ${isOk ? 'operational' : 'dropped'}` }, [
          icon(isOk ? 'check' : 'alert'),
          isOk ? 'OPERATIONAL' : 'COMPROMISED'
        ])
      ]),
      el('td', {}, [
        el('small', { style: isOk ? 'color: var(--slate);' : 'color: #DC2626;' }, [
          isOk ? 'RLS Policy Active · Healthy Connection' : (tRes.error || 'Connection Failed / Table Dropped')
        ])
      ])
    ]);
  });

  const databaseTableCard = el('div', { class: 'integrity-table-card' }, [
    el('div', { class: 'integrity-table-header' }, [
      el('h3', {}, ['PostgreSQL Core Tables & RLS Status']),
      el('span', { class: 'muted', style: 'font-size: 11px;' }, [`${audit?.operationalTables || 0}/${audit?.totalTables || 0} Tables Healthy`])
    ]),
    el('table', { class: 'integrity-table' }, [
      el('thead', {}, [
        el('tr', {}, [
          el('th', {}, ['Table Name']),
          el('th', {}, ['Live Row Count']),
          el('th', {}, ['Status']),
          el('th', {}, ['Security / Health Diagnostic'])
        ])
      ]),
      el('tbody', {}, tableRows)
    ])
  ]);

  c.append(
    header,
    metrics,
    alertBanner || el('div'),
    actionBar,
    evidenceTableCard,
    databaseTableCard
  );
}

