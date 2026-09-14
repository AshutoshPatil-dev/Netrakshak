import { supabase, supabaseConfigured } from './supabase.js';
import { state, notifyStateChange, recordAudit } from '../state.js';

export async function computeBufferSha256(arrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyEvidenceItem(item) {
  if (!supabaseConfigured || !supabase) {
    return {
      id: item.id,
      description: item.description || 'Evidence Asset',
      storagePath: item.storage_path,
      expectedHash: item.sha256,
      actualHash: null,
      status: 'OFFLINE_MODE',
      details: 'Local offline storage mode'
    };
  }

  if (!item.storage_path) {
    return {
      id: item.id,
      description: item.description || 'Evidence Asset',
      storagePath: null,
      expectedHash: item.sha256,
      actualHash: null,
      status: 'NO_STORAGE_PATH',
      details: 'No vault storage path registered'
    };
  }

  try {
    const { data, error } = await supabase.storage.from('fir-evidence').download(item.storage_path);

    if (error || !data) {
      return {
        id: item.id,
        description: item.description || item.storage_path,
        storagePath: item.storage_path,
        expectedHash: item.sha256,
        actualHash: null,
        status: 'DELETED',
        details: `File missing from bucket: ${error?.message || '404 Object Not Found'}`
      };
    }

    const arrayBuffer = await data.arrayBuffer();
    const actualHash = await computeBufferSha256(arrayBuffer);

    if (item.sha256 && actualHash.toLowerCase() !== item.sha256.toLowerCase()) {
      return {
        id: item.id,
        description: item.description || item.storage_path,
        storagePath: item.storage_path,
        expectedHash: item.sha256,
        actualHash,
        status: 'TAMPERED',
        details: 'SHA-256 Checksum Mismatch (Content Modified in Storage)'
      };
    }

    return {
      id: item.id,
      description: item.description || item.storage_path,
      storagePath: item.storage_path,
      expectedHash: item.sha256,
      actualHash,
      status: 'VERIFIED',
      details: 'Cryptographic SHA-256 signature verified intact',
      size: data.size
    };
  } catch (err) {
    return {
      id: item.id,
      description: item.description || item.storage_path,
      storagePath: item.storage_path,
      expectedHash: item.sha256,
      actualHash: null,
      status: 'ERROR',
      details: err.message || 'Verification failed'
    };
  }
}

const CORE_TABLES = [
  { name: 'public.profiles', description: 'Law enforcement officer profiles' },
  { name: 'public.entities', description: 'Suspects, phones, vehicles, bank accounts' },
  { name: 'public.relationships', description: 'Intelligence linkage graph edges' },
  { name: 'public.fir_cases', description: 'First Information Reports' },
  { name: 'public.evidence_items', description: 'Evidence registry with SHA-256 signatures' },
  { name: 'public.audit_events', description: 'Cryptographic hash-chain audit log' },
  { name: 'public.cdr_records', description: 'Cellular tower dumps & call detail records' },
  { name: 'public.financial_transactions', description: 'Mule bank account transactions' }
];

export async function verifyDatabaseTable(tableName) {
  if (!supabaseConfigured || !supabase) {
    return { tableName, status: 'OFFLINE', count: 0, healthy: true };
  }

  const rawName = tableName.replace('public.', '');
  try {
    const { count, error } = await supabase.from(rawName).select('*', { count: 'exact', head: true });
    if (error) {
      return { tableName, status: 'COMPROMISED', error: error.message, count: 0, healthy: false };
    }
    return { tableName, status: 'OPERATIONAL', count: count || 0, healthy: true };
  } catch (err) {
    return { tableName, status: 'DROPPED', error: err.message, count: 0, healthy: false };
  }
}

export async function runCryptographicAudit() {
  if (state.isIntegrityAuditing) return state.integrityAuditResult;
  state.isIntegrityAuditing = true;
  notifyStateChange();

  try {
    // 1. Fetch latest evidence items from Supabase
    let itemsToVerify = state.evidenceItems || [];
    if (supabaseConfigured && supabase) {
      const { data: dbItems } = await supabase.from('evidence_items').select('*');
      if (dbItems && dbItems.length > 0) {
        itemsToVerify = dbItems;
        state.evidenceItems = dbItems;
      }
    }

    // 2. Verify all evidence files against storage bucket
    const evidenceResults = await Promise.all(itemsToVerify.map(item => verifyEvidenceItem(item)));

    // 3. Verify all core database tables
    const tableResults = await Promise.all(CORE_TABLES.map(t => verifyDatabaseTable(t.name)));

    // 4. Calculate metrics
    const totalFiles = evidenceResults.length;
    const verifiedFiles = evidenceResults.filter(r => r.status === 'VERIFIED').length;
    const missingFiles = evidenceResults.filter(r => r.status === 'DELETED').length;
    const tamperedFiles = evidenceResults.filter(r => r.status === 'TAMPERED').length;

    const totalTables = tableResults.length;
    const operationalTables = tableResults.filter(t => t.healthy).length;
    const compromisedTables = tableResults.filter(t => !t.healthy).length;

    const totalAudited = totalFiles + totalTables;
    const totalPassed = verifiedFiles + operationalTables;
    const integrityPercentage = totalAudited > 0 ? Math.round((totalPassed / totalAudited) * 100) : 100;
    const hasBreaches = missingFiles > 0 || tamperedFiles > 0 || compromisedTables > 0;

    const auditResult = {
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString(),
      integrityPercentage,
      hasBreaches,
      totalFiles,
      verifiedFiles,
      missingFiles,
      tamperedFiles,
      totalTables,
      operationalTables,
      compromisedTables,
      evidenceResults,
      tableResults
    };

    state.integrityAuditResult = auditResult;

    if (hasBreaches) {
      recordAudit(
        'Integrity alert',
        `Breach detected: ${missingFiles} missing file(s), ${tamperedFiles} tampered file(s), ${compromisedTables} compromised table(s).`,
        'critical',
        'integrity'
      ).catch(() => {});
    }

    return auditResult;
  } catch (err) {
    console.error('Integrity audit execution error:', err);
    return null;
  } finally {
    state.isIntegrityAuditing = false;
    notifyStateChange();
  }
}
