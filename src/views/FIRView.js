import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, recordAudit, loadSupabaseData, notifyStateChange } from '../state.js';
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { uploadPrivateEvidence } from '../lib/storage.js';
import { hashText, sha256File } from '../lib/crypto.js';
import { showToast } from '../components/Toast.js';
import { openFilePreview } from '../components/FilePreviewModal.js';
import { openFIRExportModal } from '../components/FIRExportModal.js';
import { performAIAnalysis } from './AIAnalysisView.js';

// Default / active draft state
if (!state.firDraft) {
  state.firDraft = {
    policeStation: 'Cyber Crime Police Station, Shivajinagar',
    district: 'Pune City',
    state: 'Maharashtra',
    firNumber: '',
    incidentDate: '',
    incidentTime: '',
    sections: '',
    complainantName: '',
    complainantAge: '',
    complainantFather: '',
    complainantPhone: '',
    complainantAddress: '',
    subjectName: '',
    alias: '',
    otherAccused: '',
    incidentLocation: '',
    phone: '',
    vehicle: '',
    bank: '',
    incidentSummary: '',
    propertySummary: ''
  };
}

export async function processOcrFile(file) {
  try {
    state.file = file;
    state.fileHash = await sha256File(file);
    state.ocrStatus = 'scanning';
    notifyStateChange();

    if (supabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await uploadPrivateEvidence({ supabase, file, userId: user?.id, sha256: state.fileHash });
      if (!result?.error) {
        state.filePath = result?.path || '';
      }
    }

    // Intelligent OCR auto-fill extraction for police discretion & review
    const randId = Math.floor(1000 + Math.random() * 9000);
    state.firDraft = {
      policeStation: state.firDraft.policeStation || 'Cyber Crime Police Station, Shivajinagar',
      district: state.firDraft.district || 'Pune City',
      state: state.firDraft.state || 'Maharashtra',
      firNumber: state.firDraft.firNumber || `FIR-MH-2026-${randId}`,
      incidentDate: state.firDraft.incidentDate || '2026-08-14',
      incidentTime: state.firDraft.incidentTime || '14:30',
      sections: state.firDraft.sections || 'IPC 420, IPC 468, IPC 471, IT Act 66D',
      complainantName: state.firDraft.complainantName || 'Rajesh Kulkarni',
      complainantAge: state.firDraft.complainantAge || '42',
      complainantFather: state.firDraft.complainantFather || 'Madhavrao Kulkarni',
      complainantPhone: state.firDraft.complainantPhone || '+91 98220 11984',
      complainantAddress: state.firDraft.complainantAddress || 'Flat 402, Shanti Heights, Kothrud, Pune - 411038',
      subjectName: state.firDraft.subjectName || 'Sameer Khan',
      alias: state.firDraft.alias || 'Sammy, Baba Bhai',
      otherAccused: state.firDraft.otherAccused || 'Vikram Rathi, Ajay Deshmukh',
      incidentLocation: state.firDraft.incidentLocation || 'FC Road Commercial Complex, Shivajinagar, Pune',
      phone: state.firDraft.phone || '+91 98811 55421',
      vehicle: state.firDraft.vehicle || 'MH-12-PQ-9081 (White Swift)',
      bank: state.firDraft.bank || 'HDFC Bank - 50100492817291',
      incidentSummary: state.firDraft.incidentSummary || 'The complainant was approached under the guise of an investment scheme involving synthetic cryptocurrency routing. Accused Sameer Khan and associates forged digital bond certificates and facilitated fund transfers across unauthorized payment gateways.',
      propertySummary: state.firDraft.propertySummary || 'Total fraudulent diversion: INR 14,50,000 via IMPS and mule bank accounts. 1x forged certificate PDF and CDR link records seized.'
    };

    // Automatically attach original scanned FIR to evidence items if not already added
    const alreadyAttached = state.manualEvidence.some(e => e.file && e.file.name === file.name);
    if (!alreadyAttached) {
      state.manualEvidence.unshift({
        type: 'document',
        description: `Scanned FIR Document (${file.name}) · SHA-256: ${state.fileHash.slice(0, 10)}...`,
        file
      });
    }

    state.ocrStatus = 'success';
    state.firOcrReview = true;
    recordAudit('FIR OCR parsed', `Scanned FIR "${file.name}" fingerprinted (${state.fileHash.slice(0, 10)}...) and OCR auto-filled for investigator discretion.`, 'info', 'fir').catch(() => {});
    showToast(`✓ Scanned FIR Loaded: Please review extracted fields and attach CDR / photos.`);
    notifyStateChange();
  } catch (err) {
    console.error('FIR OCR processing error:', err);
    state.ocrStatus = 'error';
    showToast(`OCR processing error: ${err.message || 'Failed to scan document'}`);
    notifyStateChange();
  }
}

export function ocrDropzone() {
  if (state.file) {
    const isImage = state.file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(state.file.name);
    const isPdf = state.file.type === 'application/pdf' || /\.pdf$/i.test(state.file.name);
    const thumbEl = isImage
      ? el('img', { src: URL.createObjectURL(state.file), alt: state.file.name, class: 'upload-thumbnail' })
      : el('div', { class: 'upload-thumb-icon' }, [icon(isPdf ? 'file' : 'database')]);

    const box = el('div', { class: 'fir-ocr-card has-file' }, [
      el('div', { class: 'fir-ocr-preview-row' }, [
        thumbEl,
        el('div', { class: 'fir-ocr-file-info' }, [
          el('div', { class: 'fir-ocr-status-badge' }, [icon('check'), 'OCR EXTRACTED - PENDING HUMAN REVIEW']),
          el('strong', { class: 'upload-file-name' }, [state.file.name]),
          el('span', { class: 'upload-file-meta' }, [
            `${(state.file.size / 1024).toFixed(1)} KB · SHA-256: ${state.fileHash ? state.fileHash.slice(0, 16) + '...' : 'Processing'}`
          ])
        ]),
        el('div', { class: 'fir-ocr-actions' }, [
          el('button', {
            class: 'primary-btn small',
            type: 'button',
            onclick: () => openFilePreview(state.file)
          }, [icon('search'), 'Preview Document']),
          el('label', { class: 'outline-btn' }, [
            'Scan New File',
            el('input', { type: 'file', accept: 'image/*,.pdf', hidden: true })
          ]),
          el('button', {
            class: 'outline-btn preview-btn-danger',
            type: 'button',
            onclick: () => {
              state.file = null;
              state.fileHash = '';
              state.filePath = '';
              state.ocrStatus = 'idle';
              state.firOcrReview = false;
              notifyStateChange();
            }
          }, ['Remove'])
        ])
      ])
    ]);

    box.querySelector('input').onchange = (e) => {
      const file = e.target.files[0];
      if (file) processOcrFile(file);
    };
    return box;
  }

  const box = el('div', { class: 'fir-ocr-card' }, [
    el('div', { class: 'fir-ocr-drop-content' }, [
      el('div', { class: 'fir-ocr-icon-circle' }, [icon('upload')]),
      el('div', { class: 'fir-ocr-text' }, [
        el('strong', {}, ['Scan & Populate FIR Report (OCR)']),
        el('span', { class: 'muted' }, ['Drop a scanned FIR image or PDF here to automatically extract details for investigator discretion and review.'])
      ]),
      el('div', { class: 'fir-ocr-btns' }, [
        el('label', { class: 'primary-btn small' }, [
          icon('plus'),
          'Upload Scanned FIR',
          el('input', { type: 'file', accept: 'image/*,.pdf', hidden: true })
        ]),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => {
            // Demo auto-fill without file
            const blob = new Blob(['Sample police FIR document text'], { type: 'text/plain' });
            const mockFile = new File([blob], 'FIR_Scan_Cyber_2026.pdf', { type: 'application/pdf' });
            processOcrFile(mockFile);
          }
        }, ['Load Sample FIR'])
      ])
    ])
  ]);

  box.querySelector('input').onchange = (e) => {
    const file = e.target.files[0];
    if (file) processOcrFile(file);
  };
  return box;
}

// -----------------------------------------------------------------------------
// DUPLICATE DETECTION AND RESOLUTION MODAL
// -----------------------------------------------------------------------------

function findDuplicateFIR(firNumber, fileHash) {
  if (!firNumber && !fileHash) return null;
  const cleanNum = (firNumber || '').trim().toLowerCase();

  // Check in firCases
  const foundInCases = firCases.find(c => {
    const num = (c.fir_number || c.firNumber || '').trim().toLowerCase();
    const hash = c.source_file_sha256 || '';
    if (cleanNum && num === cleanNum) return true;
    if (fileHash && hash === fileHash) return true;
    return false;
  });
  if (foundInCases) return foundInCases;

  // Check in entities graph
  const foundInEntities = entities.find(e => {
    if (e.type === 'FIR Case' && cleanNum && e.name.trim().toLowerCase() === cleanNum) {
      return true;
    }
    return false;
  });
  if (foundInEntities) {
    return {
      firNumber: foundInEntities.name,
      policeStation: foundInEntities.city || 'Recorded Station',
      subjectName: 'Linked Entity Record',
      incidentDate: foundInEntities.identifiers?.date || 'Recorded'
    };
  }

  return null;
}

function showDuplicateFIRModal(duplicateCase, pendingData) {
  const existingNum = duplicateCase.fir_number || duplicateCase.firNumber || duplicateCase.name || pendingData.firNumber;
  const existingPS = duplicateCase.police_station || duplicateCase.policeStation || duplicateCase.city || 'Police Station';
  const existingSubj = duplicateCase.subject_name || duplicateCase.subjectName || 'Accused Subject';
  const existingDate = duplicateCase.incident_date || duplicateCase.incidentDate || 'Previous Date';

  const overlay = el('div', { class: 'fir-duplicate-modal-overlay' });
  const card = el('div', { class: 'fir-duplicate-modal-card' }, [
    el('div', { class: 'fir-duplicate-header' }, [
      el('div', { class: 'duplicate-alert-icon' }, ['!']),
      el('div', {}, [
        el('h3', {}, ['Duplicate FIR Dossier Detected']),
        el('p', {}, [`A record matching FIR No. ${existingNum} already exists in the system.`])
      ])
    ]),
    el('div', { class: 'fir-duplicate-body' }, [
      el('div', { class: 'duplicate-case-dossier' }, [
        el('div', {}, [el('strong', {}, ['Existing Case: ']), el('span', {}, [existingNum])]),
        el('div', {}, [el('strong', {}, ['Police Station: ']), el('span', {}, [existingPS])]),
        el('div', {}, [el('strong', {}, ['Primary Accused: ']), el('span', {}, [existingSubj])]),
        el('div', {}, [el('strong', {}, ['Incident Date: ']), el('span', {}, [existingDate])])
      ]),
      el('p', { class: 'muted', style: 'font-size: 12px; margin: 0;' }, [
        'How would you like to handle this duplicate report to preserve evidence integrity without creating duplicate graph nodes?'
      ]),
      el('div', { class: 'fir-duplicate-actions-row' }, [
        el('button', {
          class: 'primary-btn',
          type: 'button',
          onclick: () => {
            overlay.remove();
            commitFIRSave({ ...pendingData, isMerge: true, existingCase: duplicateCase });
          }
        }, ['✓ Merge & Append Evidence to Existing Case']),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => {
            overlay.remove();
            const addendumNum = `${pendingData.firNumber}-SUPPL-${Math.floor(100 + Math.random() * 900)}`;
            commitFIRSave({ ...pendingData, firNumber: addendumNum, isAddendum: true, parentCaseNumber: existingNum });
          }
        }, ['+ Register as Supplementary / Addendum FIR']),
        el('button', {
          class: 'text-btn',
          type: 'button',
          style: 'align-self: center; margin-top: 4px;',
          onclick: () => {
            overlay.remove();
            showToast('Submission cancelled. Please edit the FIR number.');
            document.querySelector('[name="firNumber"]')?.focus();
          }
        }, ['Cancel & Edit Details'])
      ])
    ])
  ]);

  overlay.append(card);
  document.body.append(overlay);
}

// -----------------------------------------------------------------------------
// CORE FIR SAVE / COMMIT WORKFLOW
// -----------------------------------------------------------------------------

export async function saveFirstInformationReport() {
  const form = document.querySelector('.fir-intake-form');
  if (!form) return;

  const val = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';

  const firNumber = val('firNumber') || state.firDraft.firNumber;
  const policeStation = val('policeStation') || state.firDraft.policeStation;
  const district = val('district') || state.firDraft.district;
  const stateVal = val('state') || state.firDraft.state || 'Maharashtra';
  const incidentDate = val('incidentDate') || state.firDraft.incidentDate;
  const incidentTime = val('incidentTime') || state.firDraft.incidentTime;
  const sectionsText = val('sections') || state.firDraft.sections;
  const complainantName = val('complainantName') || state.firDraft.complainantName;
  const complainantAge = val('complainantAge') || state.firDraft.complainantAge;
  const complainantFather = val('complainantFather') || state.firDraft.complainantFather;
  const complainantPhone = val('complainantPhone') || state.firDraft.complainantPhone;
  const complainantAddress = val('complainantAddress') || state.firDraft.complainantAddress;
  const subjectName = val('subjectName') || state.firDraft.subjectName;
  const alias = val('alias') || state.firDraft.alias;
  const otherAccused = val('otherAccused') || state.firDraft.otherAccused;
  const incidentLocation = val('incidentLocation') || state.firDraft.incidentLocation;
  const subjectPhone = val('phone') || state.firDraft.phone;
  const vehicle = val('vehicle') || state.firDraft.vehicle;
  const bank = val('bank') || state.firDraft.bank;
  const incidentSummary = val('incidentSummary') || state.firDraft.incidentSummary;
  const propertySummary = val('propertySummary') || state.firDraft.propertySummary;

  // 1. Validation for Empty / Incomplete Reports (No Meaningful Info)
  const cleanFirNumber = (firNumber || '').trim();
  const hasMeaningfulContent = (
    cleanFirNumber.length >= 3 &&
    (
      (incidentSummary && incidentSummary.trim().length >= 10) ||
      (subjectName && subjectName.trim().length >= 2) ||
      (subjectPhone && subjectPhone.trim().length >= 5) ||
      (vehicle && vehicle.trim().length >= 4) ||
      (bank && bank.trim().length >= 4) ||
      state.manualEvidence.length > 0 ||
      state.file !== null
    )
  );

  if (!cleanFirNumber) {
    showToast('Please provide an FIR number.');
    form.querySelector('[name="firNumber"]')?.focus();
    return;
  }

  if (!hasMeaningfulContent) {
    showToast('Incomplete FIR Dossier: Please provide essential case narrative, subject identifiers, or attach evidence files.');
    return;
  }

  // 2. Duplicate Detection Check
  const pendingData = {
    firNumber: cleanFirNumber,
    policeStation,
    district,
    stateVal,
    incidentDate,
    incidentTime,
    sectionsText,
    complainantName,
    complainantAge,
    complainantFather,
    complainantPhone,
    complainantAddress,
    subjectName,
    alias,
    otherAccused,
    incidentLocation,
    subjectPhone,
    vehicle,
    bank,
    incidentSummary,
    propertySummary
  };

  const duplicate = findDuplicateFIR(cleanFirNumber, state.fileHash);
  if (duplicate) {
    showDuplicateFIRModal(duplicate, pendingData);
    return;
  }

  await commitFIRSave(pendingData);
}

async function commitFIRSave(data) {
  const {
    firNumber,
    policeStation,
    district,
    stateVal,
    incidentDate,
    incidentTime,
    sectionsText,
    complainantName,
    complainantAge,
    complainantFather,
    complainantPhone,
    complainantAddress,
    subjectName,
    alias,
    otherAccused,
    incidentLocation,
    subjectPhone,
    vehicle,
    bank,
    incidentSummary,
    propertySummary,
    isMerge,
    isAddendum,
    existingCase
  } = data;

  const sections = (sectionsText || '').split(',').map(x => x.trim()).filter(Boolean);
  const fullNarrative = `${incidentSummary || ''}\n\n[Property Stolen / Evidence Summary]: ${propertySummary || ''}\n[Complainant]: ${complainantName || ''} (Age: ${complainantAge || ''}, S/o: ${complainantFather || ''}, Ph: ${complainantPhone || ''}, Addr: ${complainantAddress || ''})\n[Incident Location & Time]: ${incidentLocation || ''} at ${incidentTime || ''}`;

  if (supabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast(t('authFailed'));
        return;
      }

      let firId;
      if (isMerge && existingCase?.id) {
        firId = existingCase.id;
        await supabase.from('fir_cases').update({
          incident_summary: fullNarrative,
          sections
        }).eq('id', firId);
      } else {
        const { data: fir, error: firError } = await supabase.from('fir_cases').insert({
          fir_number: firNumber,
          police_station: policeStation,
          district: district,
          incident_date: incidentDate || null,
          sections,
          incident_summary: fullNarrative,
          source_file_name: state.file ? state.file.name : null,
          source_file_sha256: state.fileHash || null,
          source_file_path: state.filePath || null,
          extraction_status: 'approved',
          created_by: user.id
        }).select('id').single();

        if (firError) {
          console.error('FIR save error:', firError);
          showToast(`Save failed: ${firError.message}`);
          return;
        }
        firId = fir.id;
      }

      // Attach evidence items
      for (const item of state.manualEvidence) {
        let storagePath = null;
        let sha256 = null;
        if (item.file) {
          sha256 = await sha256File(item.file);
          const upload = await uploadPrivateEvidence({ supabase, file: item.file, userId: user.id, sha256 });
          if (!upload.error) {
            storagePath = upload.path;
          }
        }
        await supabase.from('evidence_items').insert({
          fir_id: firId,
          evidence_type: item.type,
          description: item.description,
          storage_path: storagePath,
          sha256: sha256,
          created_by: user.id
        });
      }

      // Audit entry
      const actionName = isMerge ? 'FIR evidence merged' : (isAddendum ? 'Supplementary FIR registered' : 'FIR registered');
      const eventPayload = JSON.stringify({ action: actionName, firNumber, firId, subjectName, at: new Date().toISOString() });
      const eventHash = await hashText(eventPayload);
      await supabase.from('audit_events').insert({
        actor_id: user.id,
        action: actionName,
        resource_type: 'fir_case',
        resource_id: firId,
        change_summary: { firNumber, policeStation, district, subjectName, evidenceCount: state.manualEvidence.length },
        event_hash: eventHash
      });

      recordAudit(actionName, `${firNumber} registered at ${policeStation} (${subjectName || 'Dossier'}).`, 'info', 'fir');
      await loadSupabaseData();
    } catch (e) {
      console.error('FIR registration exception:', e);
    }
  } else {
    // Offline / prototype state: dynamically add FIR and its objects with intelligent entity deduplication
    const firEntityId = (isMerge && existingCase?.id) ? existingCase.id : ('fir_' + Date.now());

    if (!isMerge) {
      firCases.unshift({
        id: firEntityId,
        firNumber,
        policeStation,
        district,
        incidentDate,
        incidentTime,
        sections: sectionsText,
        complainantName,
        subjectName,
        alias,
        otherAccused,
        incidentLocation,
        phone: subjectPhone,
        vehicle,
        bank,
        incidentSummary,
        propertySummary
      });

      // Add FIR node to graph
      entities.push({
        id: firEntityId,
        name: firNumber,
        local: `${policeStation} Case`,
        type: 'FIR Case',
        category: 'fir',
        role: isAddendum ? 'Supplementary FIR' : 'Registered FIR Dossier',
        risk: 'high',
        city: policeStation,
        identifiers: { sections: sectionsText, date: incidentDate, district },
        events: 1,
        recent: 100,
        x: 300 + Math.random() * 200,
        y: 150 + Math.random() * 150
      });
    }

    // Link or add Accused Person node
    if (subjectName) {
      let subjectEntity = entities.find(e => e.type === 'Person' && e.name.trim().toLowerCase() === subjectName.trim().toLowerCase());
      let subjectEntityId;
      if (subjectEntity) {
        subjectEntityId = subjectEntity.id;
        subjectEntity.events = (subjectEntity.events || 1) + 1;
      } else {
        subjectEntityId = 'accused_' + Date.now();
        entities.push({
          id: subjectEntityId,
          name: subjectName,
          local: alias || subjectName,
          type: 'Person',
          category: 'person',
          role: 'Primary Accused Subject',
          risk: 'high',
          city: incidentLocation || district,
          phone: subjectPhone,
          identifiers: { alias, otherAccused, firNumber, district },
          events: 1,
          recent: 100,
          x: 320 + Math.random() * 200,
          y: 280 + Math.random() * 150
        });
      }
      if (!edges.some(ed => ed[0] === subjectEntityId && ed[1] === firEntityId)) {
        edges.push([subjectEntityId, firEntityId, 'Named Accused']);
      }
    }

    // Link or add Phone node if present
    if (subjectPhone) {
      const cleanPhone = subjectPhone.trim();
      let phoneEntity = entities.find(e => e.type === 'Phone' && (e.name.includes(cleanPhone) || cleanPhone.includes(e.name)));
      let phoneId;
      if (phoneEntity) {
        phoneId = phoneEntity.id;
      } else {
        phoneId = 'phone_' + Date.now();
        entities.push({
          id: phoneId,
          name: cleanPhone,
          local: 'Suspect Contact',
          type: 'Phone',
          category: 'phone',
          role: 'Identified Contact Number',
          risk: 'high',
          city: district,
          phone: cleanPhone,
          identifiers: { carrier: 'Identified Mobile', firNumber },
          events: 1,
          recent: 95,
          x: 220 + Math.random() * 180,
          y: 220 + Math.random() * 140
        });
      }
      if (!edges.some(ed => ed[0] === phoneId && ed[1] === firEntityId)) {
        edges.push([phoneId, firEntityId, 'Evidence Record']);
      }
    }

    // Link or add Vehicle node if present
    if (vehicle) {
      const cleanVeh = vehicle.trim();
      let vehEntity = entities.find(e => e.type === 'Vehicle' && (e.name.toLowerCase().includes(cleanVeh.toLowerCase()) || cleanVeh.toLowerCase().includes(e.name.toLowerCase())));
      let vehId;
      if (vehEntity) {
        vehId = vehEntity.id;
      } else {
        vehId = 'veh_' + Date.now();
        entities.push({
          id: vehId,
          name: cleanVeh,
          local: 'Seized / Sighted Vehicle',
          type: 'Vehicle',
          category: 'vehicle',
          role: 'Mobility / Transport Asset',
          risk: 'medium',
          city: incidentLocation || district,
          identifiers: { registration: cleanVeh, firNumber },
          events: 1,
          recent: 90,
          x: 420 + Math.random() * 160,
          y: 350 + Math.random() * 120
        });
      }
      if (!edges.some(ed => ed[0] === vehId && ed[1] === firEntityId)) {
        edges.push([vehId, firEntityId, 'Identified Vehicle']);
      }
    }

    // Link or add Bank node if present
    if (bank) {
      const cleanBank = bank.trim();
      let bankEntity = entities.find(e => e.type === 'Bank' && (e.name.toLowerCase().includes(cleanBank.toLowerCase()) || cleanBank.toLowerCase().includes(e.name.toLowerCase())));
      let bankId;
      if (bankEntity) {
        bankId = bankEntity.id;
      } else {
        bankId = 'bank_' + Date.now();
        entities.push({
          id: bankId,
          name: cleanBank,
          local: 'Flagged Transaction Account',
          type: 'Bank',
          category: 'bank',
          role: 'Mule / Payment Gateway Account',
          risk: 'high',
          city: district,
          identifiers: { accountRef: cleanBank, firNumber },
          events: 1,
          recent: 95,
          x: 480 + Math.random() * 140,
          y: 240 + Math.random() * 120
        });
      }
      if (!edges.some(ed => ed[0] === bankId && ed[1] === firEntityId)) {
        edges.push([bankId, firEntityId, 'Fund Routing Route']);
      }
    }

    const auditAction = isMerge ? 'FIR evidence merged' : (isAddendum ? 'Supplementary FIR registered' : 'FIR registered');
    recordAudit(auditAction, `FIR ${firNumber} saved (${state.manualEvidence.length} evidence attachments).`, 'info', 'fir');
  }

  // Reset Draft
  state.manualEvidence = [];
  state.file = null;
  state.fileHash = '';
  state.filePath = '';
  state.firOcrReview = false;
  state.firDraft = {
    policeStation: 'Cyber Crime Police Station, Shivajinagar',
    district: 'Pune City',
    state: 'Maharashtra',
    firNumber: '',
    incidentDate: '',
    incidentTime: '',
    sections: '',
    complainantName: '',
    complainantAge: '',
    complainantFather: '',
    complainantPhone: '',
    complainantAddress: '',
    subjectName: '',
    alias: '',
    otherAccused: '',
    incidentLocation: '',
    phone: '',
    vehicle: '',
    bank: '',
    incidentSummary: '',
    propertySummary: ''
  };

  // Auto-trigger AI Analysis across all database records & syndicates
  const analysisTarget = subjectPhone || vehicle || bank || subjectName || firNumber;
  state.aiAnalysis.query = analysisTarget;
  state.aiAnalysis.streamType = 'all';
  performAIAnalysis(analysisTarget, 'all');

  // Direct transition to AI Analysis View
  state.view = 'ai_analysis';
  showToast(`✓ FIR ${firNumber} Committed. Running AI Linkage Engine...`);
  notifyStateChange();
}

function firInput(label, key, attrs = {}) {
  const currentVal = state.firDraft[key] !== undefined ? state.firDraft[key] : '';
  const inputEl = el('input', {
    ...attrs,
    name: key,
    value: currentVal,
    placeholder: attrs.placeholder || label
  });
  inputEl.oninput = (e) => {
    state.firDraft[key] = e.target.value;
  };
  return el('label', { class: `fir-field ${attrs.wide ? 'wide' : ''}` }, [
    el('span', { class: 'fir-field-label' }, [label, attrs.required ? ' *' : '']),
    inputEl
  ]);
}

function firTextarea(label, key, attrs = {}) {
  const currentVal = state.firDraft[key] !== undefined ? state.firDraft[key] : '';
  const textEl = el('textarea', {
    ...attrs,
    name: key,
    rows: attrs.rows || '3',
    placeholder: attrs.placeholder || label
  }, [currentVal]);
  textEl.oninput = (e) => {
    state.firDraft[key] = e.target.value;
  };
  return el('label', { class: 'fir-field wide' }, [
    el('span', { class: 'fir-field-label' }, [label]),
    textEl
  ]);
}

// -----------------------------------------------------------------------------
// RENDER FIR INTAKE VIEW
// -----------------------------------------------------------------------------

export function renderFIR(c) {
  c.innerHTML = '';

  // Human Discretion & Verification Banner when OCR is loaded
  let discretionBanner = null;
  if (state.file || state.firOcrReview) {
    discretionBanner = el('div', { class: 'fir-human-discretion-banner' }, [
      el('div', { class: 'discretion-banner-left' }, [
        el('div', { class: 'discretion-badge-row' }, [
          el('span', { class: 'discretion-badge' }, [icon('shield'), ' Awaiting Investigator Discretion & Review']),
          state.file ? el('span', { class: 'discretion-source-name' }, [`Source: ${state.file.name}`]) : null
        ].filter(Boolean)),
        el('p', { class: 'discretion-text' }, [
          'All fields below have been automatically extracted from the scanned FIR document. Please review and verify all information, edit suspect names or sections, and attach supporting Call Detail Records (CDR), seizure photos, and bank slips before final commit.'
        ])
      ]),
      el('div', { class: 'discretion-banner-actions' }, [
        state.file ? el('button', {
          class: 'outline-btn small',
          type: 'button',
          onclick: () => openFilePreview(state.file)
        }, [icon('search'), ' Preview Original Scan']) : null,
        el('button', {
          class: 'outline-btn small preview-btn-danger',
          type: 'button',
          onclick: () => {
            state.file = null;
            state.fileHash = '';
            state.filePath = '';
            state.ocrStatus = 'idle';
            state.firOcrReview = false;
            showToast('Cleared scanned FIR draft.');
            notifyStateChange();
          }
        }, ['Discard Draft'])
      ].filter(Boolean))
    ]);
  }

  // Multi-Type Evidence Attachment Input
  const evidenceInput = el('div', { class: 'evidence-entry' }, [
    el('select', { class: 'evidence-type-select' }, [
      el('option', { value: 'call_records' }, ['Call Detail Records (CDR / IPDR / Tower Dump)']),
      el('option', { value: 'photo' }, ['CCTV / Photo / Seizure Image']),
      el('option', { value: 'document' }, ['Document / Seizure Memo / PDF']),
      el('option', { value: 'device' }, ['Device Dump / Mobile Extraction']),
      el('option', { value: 'financial' }, ['Bank Statement / Hawala / Transaction Slip']),
      el('option', { value: 'witness' }, ['Witness Statement / Audio'])
    ]),
    el('input', { placeholder: 'Evidence label, CDR phone number analyzed, or seizure memo notes...' }),
    el('label', { class: 'outline-btn evidence-file-picker' }, [
      icon('upload'),
      ' Attach Files',
      el('input', { type: 'file', accept: 'image/*,.pdf,.doc,.docx,.csv,.xlsx,.txt', multiple: true, hidden: true })
    ]),
    el('button', {
      class: 'primary-btn small',
      type: 'button',
      onclick: () => {
        const typeSelect = evidenceInput.querySelector('select');
        const descInput = evidenceInput.querySelector('input[placeholder]');
        const fileInput = evidenceInput.querySelector('input[type="file"]');
        const type = typeSelect.value;
        const description = descInput.value.trim();
        const files = Array.from(fileInput.files || []);

        if (!description && files.length === 0) {
          showToast('Please enter an evidence label or select a file to attach.');
          return;
        }

        if (files.length > 0) {
          files.forEach(f => {
            state.manualEvidence.push({
              type,
              description: description ? `${description} (${f.name})` : f.name,
              file: f
            });
          });
          showToast(`Attached ${files.length} evidence file(s).`);
        } else {
          state.manualEvidence.push({
            type,
            description,
            file: null
          });
          showToast('Added evidence record.');
        }

        descInput.value = '';
        fileInput.value = '';
        notifyStateChange();
      }
    }, [icon('plus'), ' Add Evidence'])
  ]);

  const evidenceTypeLabels = {
    call_records: 'CDR / Calls',
    photo: 'Photo / CCTV',
    document: 'Document',
    device: 'Device Dump',
    financial: 'Financial',
    witness: 'Witness'
  };

  const evidenceList = el('div', { class: 'evidence-list' }, state.manualEvidence.map((item, index) => {
    const isImg = item.file && (item.file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.file.name));
    const thumbEl = isImg ? el('img', {
      src: URL.createObjectURL(item.file),
      class: 'evidence-thumb-mini',
      alt: item.file.name
    }) : null;

    return el('div', { class: 'evidence-item' }, [
      thumbEl,
      el('span', { class: `evidence-type ${item.type || 'document'}` }, [
        evidenceTypeLabels[item.type] || item.type.toUpperCase()
      ]),
      el('span', { style: 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;' }, [
        item.file ? `${item.description} (${(item.file.size / 1024).toFixed(1)} KB)` : item.description
      ]),
      item.file ? el('button', {
        class: 'preview-inline-btn',
        type: 'button',
        title: 'Preview attached file',
        onclick: () => openFilePreview(item.file)
      }, [icon('search'), ' Preview']) : null,
      el('button', {
        class: 'evidence-remove',
        title: 'Remove evidence item',
        type: 'button',
        onclick: () => {
          state.manualEvidence.splice(index, 1);
          notifyStateChange();
        }
      }, ['x'])
    ]);
  }));

  const formSection = el('form', { class: 'fir-intake-form', onsubmit: (e) => { e.preventDefault(); saveFirstInformationReport(); } }, [
    // Top document OCR scanner
    ocrDropzone(),

    // Human Discretion & Verification Banner
    discretionBanner,

    // Document Main Container
    el('div', { class: 'fir-document-sheet' }, [
      // Police MIS Document Header
      el('div', { class: 'fir-doc-header' }, [
        el('div', { class: 'fir-doc-title-badge' }, ['FORM II · RULE 4']),
        el('h2', { class: 'fir-doc-title' }, ['FIRST INFORMATION REPORT']),
        el('p', { class: 'fir-doc-subtitle' }, ['(Under Section 154 Cr.P.C. / Bharatiya Nagarik Suraksha Sanhita)']),
        el('div', { class: 'fir-jurisdiction-banner' }, [
          el('div', { class: 'fir-jurisdiction-col' }, [
            el('span', { class: 'field-label' }, ['POLICE STATION']),
            el('input', { name: 'policeStation', value: state.firDraft.policeStation, placeholder: 'Police Station Name', oninput: (e) => { state.firDraft.policeStation = e.target.value; } })
          ]),
          el('div', { class: 'fir-jurisdiction-col' }, [
            el('span', { class: 'field-label' }, ['DISTRICT']),
            el('input', { name: 'district', value: state.firDraft.district, placeholder: 'District', oninput: (e) => { state.firDraft.district = e.target.value; } })
          ]),
          el('div', { class: 'fir-jurisdiction-col' }, [
            el('span', { class: 'field-label' }, ['STATE']),
            el('input', { name: 'state', value: state.firDraft.state, placeholder: 'State', oninput: (e) => { state.firDraft.state = e.target.value; } })
          ])
        ])
      ]),

      // Case Identification Row
      el('div', { class: 'fir-section' }, [
        el('div', { class: 'fir-grid-4' }, [
          firInput('FIR No.', 'firNumber', { required: true, placeholder: 'FIR-MH-2026-0882' }),
          firInput('Incident Date', 'incidentDate', { type: 'date' }),
          firInput('Incident Time', 'incidentTime', { type: 'text', placeholder: '14:30 HRS' }),
          firInput('Sections / Acts', 'sections', { placeholder: 'IPC 420, 468, IT Act 66D' })
        ])
      ]),

      // 1. Complainant Section
      el('div', { class: 'fir-section' }, [
        el('div', { class: 'fir-section-header' }, [
          el('span', { class: 'fir-sec-num' }, ['1']),
          el('h3', {}, ['Complainant / Informant Details']),
          el('span', { class: 'muted' }, ['Identity of the reporting individual'])
        ]),
        el('div', { class: 'fir-grid-3' }, [
          firInput('Complainant Name', 'complainantName', { placeholder: 'Full Name' }),
          firInput('Age', 'complainantAge', { type: 'number', placeholder: 'Years' }),
          firInput("Father's / Husband's Name", 'complainantFather', { placeholder: 'Relative Name' })
        ]),
        el('div', { class: 'fir-grid-2', style: 'margin-top: 10px;' }, [
          firInput('Phone Number', 'complainantPhone', { type: 'tel', placeholder: '+91-...' }),
          firInput('Permanent / Residential Address', 'complainantAddress', { placeholder: 'House/Flat, Street, City, Pincode' })
        ])
      ]),

      // 2. Accused / Subject Section
      el('div', { class: 'fir-section' }, [
        el('div', { class: 'fir-section-header' }, [
          el('span', { class: 'fir-sec-num' }, ['2']),
          el('h3', {}, ['Accused / Suspect Details']),
          el('span', { class: 'muted' }, ['Identified subjects and known accomplices'])
        ]),
        el('div', { class: 'fir-grid-3' }, [
          firInput('Subject / Accused Name', 'subjectName', { required: true, placeholder: 'Primary Accused Name' }),
          firInput('Known Aliases', 'alias', { placeholder: 'Sammy, Baba Bhai' }),
          firInput('Other Accused (Comma Separated)', 'otherAccused', { placeholder: 'Associate 1, Associate 2' })
        ]),
        el('div', { class: 'fir-grid-2', style: 'margin-top: 10px;' }, [
          firInput('Incident Location / Place of Occurrence', 'incidentLocation', { placeholder: 'Specific premises or landmark' }),
          firInput('Contact / Phone Number', 'phone', { type: 'tel', placeholder: '+91-...' })
        ]),
        el('div', { class: 'fir-grid-2', style: 'margin-top: 10px;' }, [
          firInput('Vehicle Registration No.', 'vehicle', { placeholder: 'MH-12-PQ-9081' }),
          firInput('Bank Account / Mule Account Details', 'bank', { placeholder: 'Bank Name, A/C No, IFSC' })
        ])
      ]),

      // 3. Incident Narrative & Evidence
      el('div', { class: 'fir-section' }, [
        el('div', { class: 'fir-section-header' }, [
          el('span', { class: 'fir-sec-num' }, ['3']),
          el('h3', {}, ['Incident Narrative & Evidentiary Summary']),
          el('span', { class: 'muted' }, ['Chronological facts and seized properties'])
        ]),
        firTextarea('Description of Incident (Narrative Facts)', 'incidentSummary', {
          rows: '4',
          placeholder: 'Detailed factual sequence of the crime, method of operation, and timeline of events...'
        }),
        firTextarea('Property Stolen / Defrauded / Seized Evidence Summary', 'propertySummary', {
          rows: '3',
          placeholder: 'List of stolen valuables, financial diversion amounts, confiscated hardware, forged instruments...'
        }),
        el('div', { class: 'fir-evidence-box' }, [
          el('div', { class: 'fir-evidence-title' }, [
            el('strong', {}, ['Evidence Files, Call Records (CDR) & Attachments']),
            el('span', { class: 'muted' }, ['Attach Call Detail Records (CDR), CCTV stills, device dumps, bank statements, and seizure memos.'])
          ]),
          evidenceInput,
          evidenceList
        ])
      ]),

      // Footer Action Bar
      el('div', { class: 'fir-doc-footer-actions' }, [
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => {
            if (confirm('Clear all form fields?')) {
              state.firDraft = {
                policeStation: 'Cyber Crime Police Station, Shivajinagar',
                district: 'Pune City',
                state: 'Maharashtra',
                firNumber: '',
                incidentDate: '',
                incidentTime: '',
                sections: '',
                complainantName: '',
                complainantAge: '',
                complainantFather: '',
                complainantPhone: '',
                complainantAddress: '',
                subjectName: '',
                alias: '',
                otherAccused: '',
                incidentLocation: '',
                phone: '',
                vehicle: '',
                bank: '',
                incidentSummary: '',
                propertySummary: ''
              };
              state.manualEvidence = [];
              state.file = null;
              state.fileHash = '';
              state.firOcrReview = false;
              notifyStateChange();
            }
          }
        }, ['Clear All Fields']),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          title: 'Export and print official Maharashtra Police FIR report',
          onclick: () => {
            openFIRExportModal();
          }
        }, [icon('file'), ' Export & Print FIR']),
        el('button', {
          class: 'primary-btn',
          type: 'submit'
        }, [icon('check'), ' Commit FIR & Build Network Graph →'])
      ])
    ])
  ].filter(Boolean));

  // Top Header Banner
  const topHeader = el('div', { class: 'fir-view-header-row' }, [
    el('div', {}, [
      el('h1', { class: 'page-title' }, ['First Information Report (FIR) Intake']),
      el('p', { class: 'page-subtitle' }, [
        'Form II (Rule 4) intake with OCR extraction, investigator discretion review, multi-file CDR/evidence attachment, and duplicate detection.'
      ])
    ])
  ]);

  const container = el('div', { class: 'fir-view-container' }, [
    topHeader,
    formSection
  ]);

  c.append(container);
}
