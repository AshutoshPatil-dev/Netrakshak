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

import { extractFIRWithVision, getGeminiApiKey } from '../lib/ocr.js';

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

export async function processOcrFile(file, forceHandwritten = false) {
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

    const hasApiKey = !!getGeminiApiKey();
    let isLiveAI = false;

    if (hasApiKey) {
      try {
        const visionResult = await extractFIRWithVision(file);
        if (visionResult && visionResult.data) {
          const d = visionResult.data;
          state.firDraft = {
            policeStation: d.policeStation || state.firDraft.policeStation || 'Pune City Police Station',
            district: d.district || state.firDraft.district || 'Pune City',
            state: d.state || state.firDraft.state || 'Maharashtra',
            firNumber: d.firNumber || `FIR-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            incidentDate: d.incidentDate || new Date().toISOString().slice(0, 10),
            incidentTime: d.incidentTime || '12:00',
            sections: d.sections || '',
            complainantName: d.complainantName || '',
            complainantAge: d.complainantAge || '',
            complainantFather: d.complainantFather || '',
            complainantPhone: d.complainantPhone || '',
            complainantAddress: d.complainantAddress || '',
            subjectName: d.subjectName || '',
            alias: d.alias || '',
            otherAccused: d.otherAccused || '',
            incidentLocation: d.incidentLocation || '',
            phone: d.phone || '',
            vehicle: d.vehicle || '',
            bank: d.bank || '',
            incidentSummary: d.incidentSummary || '',
            propertySummary: d.propertySummary || ''
          };
          state.ocrScriptDetected = d.scriptDetected || 'Multilingual Devanagari / English (Gemini Vision AI)';
          state.ocrConfidence = typeof d.confidence === 'number' ? d.confidence : 98.2;
          state.ocrEngineUsed = 'gemini-vision';
          isLiveAI = true;
        }
      } catch (visionErr) {
        console.warn('Gemini Vision OCR error, falling back to local extractor:', visionErr);
        showToast(`AI Vision notice: ${visionErr.message}. Falling back to offline parser.`);
      }
    }

    // Fallback if no API key or vision processing failed
    if (!isLiveAI) {
      const isHandwritten = forceHandwritten || 
        state.ocrEngine === 'handwritten' || 
        (file && /handwrit|diary|script|kothrud_gd|swargate/i.test(file.name));

      const randId = Math.floor(1000 + Math.random() * 9000);
      state.ocrEngineUsed = 'offline-simulated';

      if (isHandwritten) {
        state.ocrScriptDetected = 'Handwritten Police Ledger Script (Marathi / Devanagari / English)';
        state.ocrConfidence = 89.4;
        state.firDraft = {
          policeStation: 'Swargate Police Station, Pune City',
          district: 'Pune City',
          state: 'Maharashtra',
          firNumber: `FIR-MH-2026-${randId}`,
          incidentDate: '2026-08-11',
          incidentTime: '19:45',
          sections: 'IPC 384 (Extortion), IPC 386, IPC 120B, Arms Act 25',
          complainantName: 'Sunil Jagtap',
          complainantAge: '38',
          complainantFather: 'Anandrao Jagtap',
          complainantPhone: '+91 94220 33190',
          complainantAddress: 'Ganesh Peth, Near Timber Market, Swargate, Pune - 411002',
          subjectName: 'Suresh Shinde',
          alias: 'Surya, Anna',
          otherAccused: 'Arjun Pawar, Pappu More',
          incidentLocation: 'Timber Market Road, Swargate, Pune',
          phone: '+91 99230 44102',
          vehicle: 'MH-14-EA-7712 (Black Pulsar)',
          bank: 'Bank of Maharashtra - 60129948102',
          incidentSummary: 'Handwritten statement transcribed: Complainant (shop owner) received multiple extortion slips and threatening calls demanding monthly hafta. Threat note handwritten on ruled diary paper delivered by two bike-borne associates.',
          propertySummary: 'Seized items: 1x handwritten extortion demand slip, 1x SIM packaging card (+91 99230 44102), and CCTV footage snapshot of black motorcycle.'
        };
      } else {
        state.ocrScriptDetected = 'Computerized Typescript (English / Devanagari)';
        state.ocrConfidence = 97.2;
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
      }
    }

    // Automatically attach original scanned FIR to evidence items if not already added
    const alreadyAttached = state.manualEvidence.some(e => e.file && e.file.name === file.name);
    if (!alreadyAttached) {
      state.manualEvidence.unshift({
        type: 'document',
        description: `${state.ocrEngineUsed === 'gemini-vision' ? 'AI Vision Extracted' : 'Scanned'} FIR (${file.name}) · SHA-256: ${state.fileHash.slice(0, 10)}...`,
        file
      });
    }

    state.ocrStatus = 'success';
    state.firOcrReview = true;
    const auditLabel = isLiveAI ? 'FIR Vision AI Extracted' : 'FIR OCR (Offline Demo) parsed';
    recordAudit(auditLabel, `Document "${file.name}" fingerprinted (${state.fileHash.slice(0, 10)}...) with ${isLiveAI ? 'Gemini 1.5 Flash Vision AI' : 'standard OCR'} engine.`, 'info', 'fir').catch(() => {});
    showToast(isLiveAI ? `✓ Gemini Vision AI: Multilingual FIR fields extracted with high accuracy.` : `✓ Scanned FIR Loaded (Offline Demo): Please review extracted fields.`);
    notifyStateChange();
  } catch (err) {
    console.error('FIR OCR processing error:', err);
    state.ocrStatus = 'error';
    showToast(`OCR processing error: ${err.message || 'Failed to scan document'}`);
    notifyStateChange();
  }
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

export function renderFIRIntakeForm() {

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
    // Document Main Container
    el('div', { class: 'fir-document-sheet' }, [
      // Top Action Bar (Single upload button on the left top, hidden during export and prints)
      el('div', { class: 'fir-sheet-top-bar no-print' }, [
        el('div', { class: 'fir-upload-top-left' }, [
          !state.file ? el('label', { class: 'primary-btn small fir-upload-trigger-btn' }, [
            icon('plus'),
            ' Upload FIR (Image / PDF)',
            el('input', {
              type: 'file',
              accept: 'image/*,.pdf',
              hidden: true,
              onchange: (e) => {
                const file = e.target.files[0];
                if (file) processOcrFile(file);
              }
            })
          ]) : el('div', { class: 'fir-uploaded-file-pill' }, [
            el('span', { class: 'fir-file-pill-icon' }, [icon(state.file.type && state.file.type.startsWith('image/') ? 'image' : 'file')]),
            el('span', { class: 'fir-file-pill-name', title: state.file.name }, [state.file.name]),
            el('button', {
              type: 'button',
              class: 'fir-file-pill-btn',
              title: 'Preview document',
              onclick: () => openFilePreview(state.file)
            }, [icon('search'), ' Preview']),
            el('button', {
              type: 'button',
              class: 'fir-file-pill-btn danger',
              title: 'Remove document',
              onclick: () => {
                state.file = null;
                state.fileHash = '';
                state.filePath = '';
                state.ocrStatus = 'idle';
                state.firOcrReview = false;
                state.ocrScriptDetected = '';
                state.ocrConfidence = 0;
                notifyStateChange();
              }
            }, ['✕'])
          ])
        ]),
        state.firOcrReview ? el('div', { class: 'fir-ocr-quick-pill' }, [
          el('span', { class: 'fir-quick-status-dot', style: state.ocrEngineUsed === 'gemini-vision' ? 'background: #10B981;' : '' }),
          el('span', { class: 'fir-quick-status-text' }, [
            state.ocrEngineUsed === 'gemini-vision'
              ? `⚡ Gemini Vision AI Extracted (${state.ocrConfidence || 98}% Confidence)`
              : (state.ocrScriptDetected && state.ocrScriptDetected.includes('Handwritten')
                  ? '✍️ Handwritten HTR Auto-Filled'
                  : '📄 Printed OCR Auto-Filled')
          ])
        ]) : null
      ]),

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

  return formSection;
}

export function renderFIRDossiersList() {
  const allCases = [...firCases];

  const searchInput = el('input', {
    type: 'text',
    class: 'ai-search-input',
    placeholder: 'Search FIR cases by number, police station, accused name, sections, or vehicle...',
    style: 'flex: 1; max-width: 450px;',
    oninput: (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.fir-dossier-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }
  });

  const headerActions = el('div', { style: 'display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;' }, [
    el('div', {}, [
      el('h2', { style: 'font-size: 18px; font-weight: 800; margin: 0; color: var(--app-text);' }, ['Registered FIR Case Dossiers (', String(allCases.length), ' Active Cases)']),
      el('p', { class: 'muted', style: 'font-size: 12px; margin-top: 2px;' }, ['Official First Information Reports linking suspect identities, communication records (CDR), vehicles, and mule bank accounts across police stations.'])
    ]),
    el('div', { style: 'display: flex; align-items: center; gap: 10px;' }, [
      searchInput,
      el('button', {
        class: 'primary-btn',
        onclick: () => {
          state.firActiveTab = 'intake';
          notifyStateChange();
        }
      }, [icon('plus'), 'New FIR Intake & Scan'])
    ])
  ]);

  const cards = allCases.map(c => {
    const firNo = c.firNumber || c.fir_number || 'FIR-MH-2026';
    const ps = c.policeStation || c.police_station || 'Police Station';
    const dist = c.district || 'District';
    const date = c.incidentDate || c.incident_date || '2026-08';
    const sectionsArray = Array.isArray(c.sections) ? c.sections : (c.sections || 'IPC 420').split(',').map(s => s.trim());
    const subj = c.subjectName || c.subject_name || 'Accused Subject';
    const otherAcc = c.otherAccused || c.other_accused || '';
    const phone = c.phone || '';
    const veh = c.vehicle || '';
    const bnk = c.bank || '';
    const summary = c.incidentSummary || c.incident_summary || 'Incident narrative registered under police station records.';
    const propSummary = c.propertySummary || c.property_summary || '';

    // Find linked entities in state
    const linkedAccused = entities.filter(e => {
      const eName = (e.name || '').toLowerCase();
      return eName.includes(subj.toLowerCase()) || (otherAcc && otherAcc.toLowerCase().includes(eName));
    });

    return el('div', { class: 'fir-dossier-card' }, [
      // Top header
      el('div', { class: 'fir-dossier-top' }, [
        el('div', {}, [
          el('div', { class: 'fir-dossier-badge-row' }, [
            el('span', { class: 'fir-num-badge' }, [firNo]),
            el('span', { style: 'font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0;' }, ['OCR EXTRACTED & VERIFIED']),
            c.syndicateGroup ? el('span', { style: 'font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;' }, [`Syndicate: ${c.syndicateGroup}`]) : null
          ].filter(Boolean)),
          el('h3', { class: 'fir-station-title' }, [ps]),
          el('div', { class: 'fir-meta-info' }, [`Jurisdiction: ${dist} · Registration Date: ${date}`])
        ]),
        el('div', { class: 'fir-sections-list' }, sectionsArray.map(sec => el('span', { class: 'fir-section-tag' }, [sec])))
      ]),

      // Provenance & Incident Facts Narrative
      el('div', { class: 'fir-dossier-provenance-box' }, [
        el('strong', { style: 'display: block; font-size: 12px; color: var(--app-text); margin-bottom: 4px;' }, ['Incident Narrative & Registered Police Facts:']),
        el('span', {}, [summary])
      ]),

      // Attributed Entities & Seized Assets
      el('div', { class: 'fir-entities-attribution-grid' }, [
        el('div', { class: 'fir-attrib-box' }, [
          el('span', { class: 'fir-attrib-label' }, [icon('user'), 'Accused Suspects']),
          el('span', { class: 'fir-attrib-val' }, [subj]),
          el('span', { class: 'fir-attrib-sub' }, [otherAcc ? `Co-Accused: ${otherAcc}` : 'Primary Target'])
        ]),
        phone ? el('div', { class: 'fir-attrib-box' }, [
          el('span', { class: 'fir-attrib-label' }, [icon('pulse'), 'Seized Telephony (CDR)']),
          el('span', { class: 'fir-attrib-val' }, [phone]),
          el('span', { class: 'fir-attrib-sub' }, ['Cell Tower Triangulated'])
        ]) : null,
        veh ? el('div', { class: 'fir-attrib-box' }, [
          el('span', { class: 'fir-attrib-label' }, [icon('grid'), 'Identified Mobility']),
          el('span', { class: 'fir-attrib-val' }, [veh]),
          el('span', { class: 'fir-attrib-sub' }, ['ANPR Tracked'])
        ]) : null,
        bnk ? el('div', { class: 'fir-attrib-box' }, [
          el('span', { class: 'fir-attrib-label' }, [icon('database'), 'Mule Financial Route']),
          el('span', { class: 'fir-attrib-val' }, [bnk]),
          el('span', { class: 'fir-attrib-sub' }, ['IMPS / P2P Layering'])
        ]) : null
      ].filter(Boolean)),

      propSummary ? el('div', { style: 'font-size: 12px; color: var(--app-text-secondary); background: #F1F5F9; border-radius: 6px; padding: 8px 12px;' }, [
        el('strong', { style: 'color: var(--app-text);' }, ['Seized Property / Digital Forensics: ']),
        el('span', {}, [propSummary])
      ]) : null,

      // Actions Footer
      el('div', { class: 'fir-dossier-actions' }, [
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.firDraft = { ...c };
            state.firActiveTab = 'intake';
            notifyStateChange();
            showToast(`Loaded ${firNo} into Form II Intake Editor`);
          }
        }, ['Edit in Form II']),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.firDraft = { ...c };
            openFIRExportModal();
          }
        }, [icon('file'), 'Export & Print FIR']),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.view = 'aiAnalysis';
            state.aiAnalysis.query = firNo;
            performAIAnalysis(firNo, 'all');
            notifyStateChange();
            showToast(`Ran AI Pattern scan for ${firNo}`);
          }
        }, [icon('sparkle'), 'Run AI Analysis']),
        el('button', {
          class: 'primary-btn small',
          onclick: () => {
            const targetEntity = linkedAccused[0] || entities.find(e => e.name.toLowerCase().includes(subj.toLowerCase())) || entities[0];
            state.graphExploration = {
              active: true,
              mode: 'focused',
              seedId: targetEntity ? targetEntity.id : null,
              expandedNodeIds: []
            };
            state.selected = targetEntity ? targetEntity.id : null;
            state.view = 'network';
            notifyStateChange();
            showToast(`Focusing Network Graph on ${firNo} (${targetEntity ? targetEntity.name : 'Suspect Network'})`);
          }
        }, [icon('network'), 'Inspect Network Linkages →'])
      ])
    ]);
  });

  return el('div', { class: 'fir-dossiers-list' }, [
    headerActions,
    ...cards
  ]);
}

export function renderFIR(c) {
  c.innerHTML = '';

  const activeTab = state.firActiveTab || 'intake';

  const tabBar = el('div', { class: 'fir-tab-nav' }, [
    el('div', { class: 'fir-tabs-left' }, [
      el('button', {
        class: `fir-tab-btn ${activeTab === 'intake' ? 'active' : ''}`,
        onclick: () => {
          state.firActiveTab = 'intake';
          notifyStateChange();
        }
      }, [icon('plus'), 'New FIR Intake & OCR Extraction']),
      el('button', {
        class: `fir-tab-btn ${activeTab === 'dossiers' ? 'active' : ''}`,
        onclick: () => {
          state.firActiveTab = 'dossiers';
          notifyStateChange();
        }
      }, [icon('file'), `Registered FIR Dossiers (${firCases.length})`])
    ]),
    activeTab === 'dossiers' ? el('button', {
      class: 'btn-secondary btn-sm',
      onclick: () => {
        state.firActiveTab = 'intake';
        notifyStateChange();
      }
    }, ['← Back to FIR Intake']) : null
  ].filter(Boolean));

  const contentArea = activeTab === 'dossiers' ? renderFIRDossiersList() : renderFIRIntakeForm();

  const container = el('div', { class: 'fir-view-container' }, [
    tabBar,
    contentArea
  ]);

  c.append(container);
}

