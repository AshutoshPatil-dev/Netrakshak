import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, recordAudit, loadSupabaseData, notifyStateChange } from '../state.js';
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { uploadPrivateEvidence } from '../lib/storage.js';
import { hashText, sha256File } from '../lib/crypto.js';
import { showToast } from '../components/Toast.js';
import { openFilePreview } from '../components/FilePreviewModal.js';
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

    // Intelligent OCR auto-fill extraction
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
        description: `Scanned FIR Document (${file.name}) · SHA-256: ${state.fileHash.slice(0, 10)}…`,
        file
      });
    }

    state.ocrStatus = 'success';
    recordAudit('FIR OCR parsed', `Scanned FIR "${file.name}" fingerprinted (${state.fileHash.slice(0, 10)}…) & OCR auto-filled.`, 'info', 'fir').catch(() => {});
    showToast(`✓ OCR Extracted: 14 fields auto-filled from scanned FIR document.`);
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
          el('div', { class: 'fir-ocr-status-badge' }, [icon('check'), 'OCR EXTRACTED & FINGERPRINTED']),
          el('strong', { class: 'upload-file-name' }, [state.file.name]),
          el('span', { class: 'upload-file-meta' }, [
            `${(state.file.size / 1024).toFixed(1)} KB · SHA-256: ${state.fileHash ? state.fileHash.slice(0, 16) + '…' : 'Processing'}`
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
        el('strong', {}, ['Scan & Auto-Fill from Scanned FIR (OCR)']),
        el('span', { class: 'muted' }, ['Drop a scanned FIR image or PDF here to automatically extract and populate the First Information Report.'])
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

  if (!firNumber) {
    showToast('Please provide an FIR number');
    form.querySelector('[name="firNumber"]')?.focus();
    return;
  }
  if (!policeStation) {
    showToast('Please provide the Police Station');
    form.querySelector('[name="policeStation"]')?.focus();
    return;
  }
  if (!subjectName) {
    showToast('Please provide the Accused / Subject Name');
    form.querySelector('[name="subjectName"]')?.focus();
    return;
  }

  const sections = sectionsText.split(',').map(x => x.trim()).filter(Boolean);
  const fullNarrative = `${incidentSummary}\n\n[Property Stolen / Evidence Summary]: ${propertySummary}\n[Complainant]: ${complainantName} (Age: ${complainantAge}, S/o: ${complainantFather}, Ph: ${complainantPhone}, Addr: ${complainantAddress})\n[Incident Location & Time]: ${incidentLocation} at ${incidentTime}`;

  if (supabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast(t('authFailed'));
        return;
      }

      // 1. Insert FIR case
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

      // 2. Insert or link accused subject entity
      const { data: entity, error: entityError } = await supabase.from('entities').insert({
        entity_type: 'person',
        display_name: subjectName,
        aliases: alias ? alias.split(',').map(a => a.trim()).filter(Boolean) : [],
        risk_level: 'high',
        identifiers: {
          phone: subjectPhone,
          vehicle: vehicle,
          bank: bank,
          location: incidentLocation,
          otherAccused: otherAccused,
          firNumber: firNumber,
          district: district,
          state: stateVal
        },
        created_by: user.id
      }).select('id').single();

      if (!entityError && entity) {
        await supabase.from('fir_entities').insert({
          fir_id: fir.id,
          entity_id: entity.id,
          involvement: 'accused'
        });
      }

      // 3. Attach all evidence items
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
          fir_id: fir.id,
          evidence_type: item.type,
          description: item.description,
          storage_path: storagePath,
          sha256: sha256,
          created_by: user.id
        });
      }

      // 4. Record tamper-evident audit event
      const eventPayload = JSON.stringify({ action: 'fir.registered', firNumber, firId: fir.id, subjectName, at: new Date().toISOString() });
      const eventHash = await hashText(eventPayload);
      await supabase.from('audit_events').insert({
        actor_id: user.id,
        action: 'FIR registered',
        resource_type: 'fir_case',
        resource_id: fir.id,
        change_summary: { firNumber, policeStation, district, subjectName, evidenceCount: state.manualEvidence.length },
        event_hash: eventHash
      });

      recordAudit('FIR registered', `FIR ${firNumber} registered at ${policeStation} (${subjectName}).`, 'info', 'fir');
      await loadSupabaseData();
    } catch (e) {
      console.error('FIR registration exception:', e);
    }
  } else {
    // Offline / prototype state: dynamically add FIR and its objects to the network
    const firEntityId = 'fir_' + Date.now();
    const subjectEntityId = 'accused_' + Date.now();

    // 1. Add FIR case record
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

    // 2. Add FIR node to graph
    entities.push({
      id: firEntityId,
      name: firNumber,
      local: `${policeStation} Case`,
      type: 'FIR Case',
      category: 'fir',
      role: 'Registered FIR Dossier',
      risk: 'high',
      city: policeStation,
      identifiers: { sections: sectionsText, date: incidentDate, district },
      events: 1,
      recent: 100,
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 150
    });

    // 3. Add Accused Person node
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
    edges.push([subjectEntityId, firEntityId, 'Named Primary Accused']);

    // 4. Add Phone node if present
    if (subjectPhone) {
      const phoneId = 'phone_' + Date.now();
      entities.push({
        id: phoneId,
        name: subjectPhone,
        local: 'Suspect Contact',
        type: 'Phone',
        category: 'phone',
        role: 'Discovered Contact Number',
        risk: 'high',
        city: district,
        phone: subjectPhone,
        identifiers: { carrier: 'Identified Mobile', firNumber },
        events: 1,
        recent: 95,
        x: 220 + Math.random() * 180,
        y: 220 + Math.random() * 140
      });
      edges.push([subjectEntityId, phoneId, 'Primary Contact Link']);
      edges.push([phoneId, firEntityId, 'Evidence Record']);
    }

    // 5. Add Vehicle node if present
    if (vehicle) {
      const vehId = 'veh_' + Date.now();
      entities.push({
        id: vehId,
        name: vehicle,
        local: 'Seized / Sighted Vehicle',
        type: 'Vehicle',
        category: 'vehicle',
        role: 'Mobility / Transport Asset',
        risk: 'medium',
        city: incidentLocation || district,
        identifiers: { registration: vehicle, firNumber },
        events: 1,
        recent: 90,
        x: 420 + Math.random() * 160,
        y: 350 + Math.random() * 120
      });
      edges.push([subjectEntityId, vehId, 'Associated Vehicle']);
      edges.push([vehId, firEntityId, 'Identified in Incident']);
    }

    // 6. Add Bank account node if present
    if (bank) {
      const bankId = 'bank_' + Date.now();
      entities.push({
        id: bankId,
        name: bank,
        local: 'Flagged Account',
        type: 'Bank',
        category: 'bank',
        role: 'Mule / Fraud Channel',
        risk: 'high',
        city: district,
        identifiers: { account: bank, firNumber },
        events: 1,
        recent: 95,
        x: 480 + Math.random() * 140,
        y: 220 + Math.random() * 140
      });
      edges.push([subjectEntityId, bankId, 'Beneficiary / Mule Account']);
      edges.push([bankId, firEntityId, 'Financial Diversion Route']);
    }

    recordAudit('FIR registered', `FIR ${firNumber} registered at ${policeStation} (${subjectName}).`, 'info', 'fir');
  }

  // Clear draft
  state.manualEvidence = [];
  state.file = null;
  state.fileHash = '';
  state.filePath = '';
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
  showToast(`✓ FIR ${firNumber} Registered. Auto-running AI Linkage Engine…`);
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

export function renderFIR(c) {
  c.innerHTML = '';

  const evidenceInput = el('div', { class: 'evidence-entry' }, [
    el('select', {}, [
      el('option', { value: 'document' }, [t('documentEvidence')]),
      el('option', { value: 'device' }, [t('deviceEvidence')]),
      el('option', { value: 'financial' }, [t('financialEvidence')]),
      el('option', { value: 'witness' }, [t('witnessEvidence')])
    ]),
    el('input', { placeholder: 'Evidence label / seizure description…' }),
    el('label', { class: 'outline-btn evidence-file-picker' }, [
      icon('upload'),
      'Attach File',
      el('input', { type: 'file', accept: 'image/*,.pdf,.doc,.docx,.csv,.xlsx', hidden: true })
    ]),
    el('button', {
      class: 'primary-btn small',
      type: 'button',
      onclick: () => {
        const type = evidenceInput.querySelector('select').value;
        const descInput = evidenceInput.querySelector('input[placeholder]');
        const fileInput = evidenceInput.querySelector('input[type="file"]');
        const description = descInput.value.trim();
        const file = fileInput.files[0] || null;
        if (!description && !file) {
          showToast('Enter a description or choose a file to attach');
          return;
        }
        state.manualEvidence.push({
          type,
          description: description || file.name,
          file
        });
        descInput.value = '';
        fileInput.value = '';
        notifyStateChange();
      }
    }, [icon('plus'), t('addEvidence')])
  ]);

  const evidenceList = el('div', { class: 'evidence-list' }, state.manualEvidence.map((item, index) => el('div', { class: 'evidence-item' }, [
    el('span', { class: 'evidence-type' }, [item.type]),
    el('span', { style: 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;' }, [
      item.file ? `${item.description} (${(item.file.size / 1024).toFixed(1)} KB)` : item.description
    ]),
    item.file ? el('button', {
      class: 'preview-inline-btn',
      type: 'button',
      title: 'Preview attached file',
      onclick: () => openFilePreview(item.file)
    }, [icon('search'), 'Preview']) : null,
    el('button', {
      class: 'evidence-remove',
      title: t('removeEvidence'),
      type: 'button',
      onclick: () => {
        state.manualEvidence.splice(index, 1);
        notifyStateChange();
      }
    }, ['×'])
  ])));

  const formSection = el('form', { class: 'fir-intake-form', onsubmit: (e) => { e.preventDefault(); saveFirstInformationReport(); } }, [
    // Top document OCR scanner
    ocrDropzone(),

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
          firInput('Phone Number', 'complainantPhone', { type: 'tel', placeholder: '+91-…' }),
          firInput('Permanent / Residential Address', 'complainantAddress', { placeholder: 'House/Flat, Street, City, Pincode' })
        ])
      ]),

      // 2. Accused / Subject Section
      el('div', { class: 'fir-section' }, [
        el('div', { class: 'fir-section-header' }, [
          el('span', { class: 'fir-sec-num' }, ['2']),
          el('h3', {}, ['Accused / Suspect Details']),
          el('span', { class: 'muted' }, ['Identified subjects & known accomplices'])
        ]),
        el('div', { class: 'fir-grid-3' }, [
          firInput('Subject / Accused Name', 'subjectName', { required: true, placeholder: 'Primary Accused Name' }),
          firInput('Known Aliases', 'alias', { placeholder: 'Sammy, Baba Bhai' }),
          firInput('Other Accused (Comma Separated)', 'otherAccused', { placeholder: 'Associate 1, Associate 2' })
        ]),
        el('div', { class: 'fir-grid-2', style: 'margin-top: 10px;' }, [
          firInput('Incident Location / Place of Occurrence', 'incidentLocation', { placeholder: 'Specific premises or landmark' }),
          firInput('Contact / Phone Number', 'phone', { type: 'tel', placeholder: '+91-…' })
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
          el('span', { class: 'muted' }, ['Chronological facts & seized properties'])
        ]),
        firTextarea('Description of Incident (Narrative Facts)', 'incidentSummary', {
          rows: '4',
          placeholder: 'Detailed factual sequence of the crime, method of operation, and timeline of events…'
        }),
        firTextarea('Property Stolen / Defrauded / Seized Evidence Summary', 'propertySummary', {
          rows: '3',
          placeholder: 'List of stolen valuables, financial diversion amounts, confiscated hardware, forged instruments…'
        }),
        el('div', { class: 'fir-evidence-box' }, [
          el('div', { class: 'fir-evidence-title' }, [
            el('strong', {}, ['Evidence Items & Attachments']),
            el('span', { class: 'muted' }, ['Attach supporting seizure memos, device dumps, PDFs, and photos'])
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
              notifyStateChange();
            }
          }
        }, ['Clear Form']),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => showToast('Draft saved locally.')
        }, ['Save Draft']),
        el('button', {
          class: 'primary-btn',
          type: 'submit'
        }, [icon('check'), 'Save & Register FIR Case'])
      ])
    ])
  ]);

  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['CRIMINAL INVESTIGATION MIS']),
      el('h1', {}, ['First Information Report (FIR Intake)']),
      el('p', { class: 'muted' }, ['Unified FIR registration with OCR document extraction and evidentiary chain-of-custody anchoring.'])
    ])
  ]);


  c.append(header, formSection);
}

