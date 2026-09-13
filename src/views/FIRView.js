import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, recordAudit, loadSupabaseData, notifyStateChange } from '../state.js';
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { uploadPrivateEvidence } from '../lib/storage.js';
import { hashText, sha256File } from '../lib/crypto.js';
import { showToast } from '../components/Toast.js';
import { openFilePreview } from '../components/FilePreviewModal.js';

export function uploadBox() {
  if (state.file) {
    const isImage = state.file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(state.file.name);
    const isPdf = state.file.type === 'application/pdf' || /\.pdf$/i.test(state.file.name);
    const thumbEl = isImage
      ? el('img', { src: URL.createObjectURL(state.file), alt: state.file.name, class: 'upload-thumbnail' })
      : el('div', { class: 'upload-thumb-icon' }, [icon(isPdf ? 'file' : 'database')]);

    const box = el('div', { class: 'upload-box has-file' }, [
      el('div', { class: 'upload-preview-card' }, [
        thumbEl,
        el('div', { class: 'upload-file-details' }, [
          el('strong', { class: 'upload-file-name' }, [state.file.name]),
          el('span', { class: 'upload-file-meta' }, [
            `${(state.file.size / 1024).toFixed(1)} KB · ${state.file.type || 'Document'} · SHA-256: ${state.fileHash ? state.fileHash.slice(0, 16) + '…' : 'Processing'}`
          ])
        ])
      ]),
      el('div', { class: 'upload-actions' }, [
        el('button', {
          class: 'primary-btn small',
          type: 'button',
          onclick: () => openFilePreview(state.file)
        }, [icon('search'), 'Preview Document']),
        el('label', { class: 'outline-btn' }, [
          'Replace file',
          el('input', { type: 'file', accept: 'image/*,.pdf', hidden: true })
        ]),
        el('button', {
          class: 'outline-btn preview-btn-danger',
          type: 'button',
          onclick: () => {
            state.file = null;
            state.fileHash = '';
            state.filePath = '';
            notifyStateChange();
          }
        }, ['Remove'])
      ])
    ]);

    box.querySelector('input').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleFileUpload(file);
    };
    return box;
  }

  const box = el('div', { class: 'upload-box' }, [
    el('div', { class: 'upload-icon' }, [icon('upload')]),
    el('strong', {}, [t('noFile')]),
    el('span', {}, [t('uploadBody')]),
    el('label', { class: 'outline-btn' }, [
      t('browse'),
      el('input', { type: 'file', accept: 'image/*,.pdf', hidden: true })
    ])
  ]);
  box.querySelector('input').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFileUpload(file);
  };
  return box;
}

export async function handleFileUpload(file) {
  try {
    state.file = file;
    state.fileHash = await sha256File(file);
    if (supabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await uploadPrivateEvidence({ supabase, file, userId: user?.id, sha256: state.fileHash });
      if (result?.error) {
        showToast(`Evidence storage warning: ${result.error.message || 'File recorded locally'}`);
      } else {
        state.filePath = result?.path || '';
      }
    }
    recordAudit('FIR uploaded', `Scanned FIR "${file.name}" fingerprinted (${state.fileHash.slice(0, 10)}…).`, 'info', 'fir').catch(() => {});
    showToast(`Document uploaded & fingerprinted: ${state.fileHash.slice(0, 12)}…`);
    notifyStateChange();
  } catch (err) {
    console.error('FIR upload error:', err);
    showToast(`Upload failed: ${err.message || 'Error processing document'}`);
  }
}

export function uploadFIRPanel() {
  return el('div', { class: 'fir-grid' }, [
    el('section', { class: 'panel upload-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('uploadTitle')]),
          el('span', { class: 'muted' }, [t('uploadBody')])
        ]),
        el('span', { class: 'secure-pill' }, [icon('lock'), 'Secure Upload'])
      ]),
      uploadBox(),
      el('div', { class: 'workflow' }, [
        ['01', t('fingerprintStep'), t('sha256')],
        ['02', t('extractStep'), t('ocrAdapter')],
        ['03', t('reviewStep'), t('officerConfirmation')],
        ['04', t('commitStep'), t('auditLedger')]
      ].map(([n, a, b], i) => el('div', { class: `workflow-step ${state.fileHash && i === 0 ? 'done' : ''}` }, [
        el('span', {}, [n]),
        el('strong', {}, [a]),
        el('small', {}, [b])
      ])))
    ]),
    el('div', { class: 'panel draft-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('reviewDraft')]),
          el('span', { class: 'muted' }, [t('reviewRequired')])
        ]),
        el('span', { class: 'draft-status' }, [state.fileHash ? 'READY FOR REVIEW' : t('noFile')])
      ]),
      el('div', { class: 'draft-grid' }, [
        [t('firNumber'), ''],
        [t('policeStation'), ''],
        [t('district'), ''],
        [t('incidentDate'), ''],
        [t('sections'), ''],
        [t('namedEntities'), '']
      ].map(([a, b]) => el('label', {}, [a, el('input', { value: b, placeholder: a, disabled: !state.fileHash })])))
    ])
  ]);
}

export async function saveManualFIR() {
  if (!supabaseConfigured) {
    showToast(t('authNotConfigured'));
    return;
  }
  const form = document.querySelector('.manual-form');
  const value = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast(t('authFailed'));
    return;
  }
  const sections = value('sections').split(',').map(x => x.trim()).filter(Boolean);
  const { data: fir, error: firError } = await supabase.from('fir_cases').insert({
    fir_number: value('firNumber'),
    police_station: value('policeStation'),
    district: value('district'),
    incident_date: value('incidentDate') || null,
    sections,
    incident_summary: value('incidentSummary'),
    extraction_status: 'manual',
    created_by: user.id
  }).select('id').single();

  if (firError) {
    showToast(t('saveFailed'));
    return;
  }
  const subjectName = value('subjectName');
  if (subjectName) {
    const { data: entity, error: entityError } = await supabase.from('entities').insert({
      entity_type: 'person',
      display_name: subjectName,
      aliases: value('alias') ? [value('alias')] : [],
      identifiers: {
        dob: value('dob'),
        address: value('address'),
        phone: value('phone'),
        vehicle: value('vehicle'),
        bank: value('bank')
      },
      created_by: user.id
    }).select('id').single();
    if (entityError) {
      showToast(t('saveFailed'));
      return;
    }
    await supabase.from('fir_entities').insert({ fir_id: fir.id, entity_id: entity.id, involvement: 'subject' });
  }
  for (const item of state.manualEvidence) {
    let storagePath = null;
    let sha256 = null;
    if (item.file) {
      sha256 = await sha256File(item.file);
      const upload = await uploadPrivateEvidence({ supabase, file: item.file, userId: user.id, sha256 });
      if (upload.error) {
        showToast(t('saveFailed'));
        return;
      }
      storagePath = upload.path;
    }
    const { error } = await supabase.from('evidence_items').insert({
      fir_id: fir.id,
      evidence_type: item.type,
      description: item.description,
      storage_path: storagePath,
      sha256,
      created_by: user.id
    });
    if (error) {
      showToast(t('saveFailed'));
      return;
    }
  }
  const eventPayload = JSON.stringify({ action: 'fir.created', firId: fir.id, actor: user.id, at: new Date().toISOString() });
  const eventHash = await hashText(eventPayload);
  await supabase.from('audit_events').insert({
    actor_id: user.id,
    action: 'fir.created',
    resource_type: 'fir_case',
    resource_id: fir.id,
    change_summary: { firNumber: value('firNumber'), evidenceCount: state.manualEvidence.length },
    event_hash: eventHash
  });

  recordAudit('FIR created', `FIR ${value('firNumber')} created at ${value('policeStation')}.`, 'info', 'fir');
  state.manualEvidence = [];
  showToast(t('caseSaved'));
  await loadSupabaseData();
  notifyStateChange();
}

function manualField(label, key, attrs = {}) {
  return el('label', { class: `manual-field ${attrs.wide ? 'wide' : ''}` }, [
    label,
    el('input', { ...attrs, name: key, wide: undefined, placeholder: attrs.placeholder || label })
  ]);
}

export function manualFIRPanel() {
  const fields = el('div', { class: 'manual-grid' }, [
    manualField(t('firNumber'), 'firNumber', { type: 'text' }),
    manualField(t('policeStation'), 'policeStation', { type: 'text' }),
    manualField(t('district'), 'district', { type: 'text' }),
    manualField(t('incidentDate'), 'incidentDate', { type: 'date' }),
    manualField(t('sections'), 'sections', { type: 'text' }),
    manualField(t('reportingOfficer'), 'reportingOfficer', { type: 'text' }),
    manualField(t('subjectName'), 'subjectName', { type: 'text' }),
    manualField(t('alias'), 'alias', { type: 'text' }),
    manualField(t('dob'), 'dob', { type: 'date' }),
    manualField(t('phone'), 'phone', { type: 'tel' }),
    manualField(t('vehicle'), 'vehicle', { type: 'text' }),
    manualField(t('bank'), 'bank', { type: 'text' }),
    manualField(t('address'), 'address', { type: 'text', wide: true }),
    el('label', { class: 'manual-field wide' }, [
      t('incidentSummary'),
      el('textarea', { name: 'incidentSummary', rows: '4', placeholder: t('incidentSummary') })
    ])
  ]);

  const evidenceInput = el('div', { class: 'evidence-entry' }, [
    el('select', {}, [
      el('option', { value: 'document' }, [t('documentEvidence')]),
      el('option', { value: 'device' }, [t('deviceEvidence')]),
      el('option', { value: 'financial' }, [t('financialEvidence')]),
      el('option', { value: 'witness' }, [t('witnessEvidence')])
    ]),
    el('input', { placeholder: t('evidenceDescription') }),
    el('label', { class: 'outline-btn evidence-file-picker' }, [
      t('browse'),
      el('input', { type: 'file', accept: 'image/*,.pdf,.doc,.docx', hidden: true })
    ]),
    el('button', {
      class: 'outline-btn',
      onclick: () => {
        const type = evidenceInput.querySelector('select').value;
        const description = evidenceInput.querySelector('input[placeholder]').value.trim();
        const file = evidenceInput.querySelector('input[type="file"]').files[0] || null;
        if (!description && !file) return;
        state.manualEvidence.push({ type, description: description || file.name, file });
        notifyStateChange();
      }
    }, [icon('plus'), t('addEvidence')])
  ]);

  const evidenceList = el('div', { class: 'evidence-list' }, state.manualEvidence.map((item, index) => el('div', { class: 'evidence-item' }, [
    el('span', { class: 'evidence-type' }, [item.type]),
    el('span', {}, [item.file ? `${item.description} • ${item.file.name}` : item.description]),
    item.file ? el('button', {
      class: 'preview-inline-btn',
      type: 'button',
      title: 'Preview attached file',
      onclick: () => openFilePreview(item.file)
    }, [icon('search'), 'Preview']) : null,
    el('button', {
      class: 'evidence-remove',
      title: t('removeEvidence'),
      onclick: () => {
        state.manualEvidence.splice(index, 1);
        notifyStateChange();
      }
    }, ['×'])
  ])));

  return el('section', { class: 'panel manual-form' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, [t('manualEntry')]),
        el('span', { class: 'muted' }, [t('manualEntryHelp')])
      ]),
      el('span', { class: 'draft-status' }, [t('draft')])
    ]),
    el('div', { class: 'manual-section' }, [
      el('div', { class: 'section-label' }, [t('caseDetails')]),
      fields
    ]),
    el('div', { class: 'manual-section' }, [
      el('div', { class: 'section-label' }, [t('evidence')]),
      evidenceInput,
      evidenceList
    ]),
    el('div', { class: 'manual-actions' }, [
      el('button', { class: 'outline-btn', onclick: () => showToast(t('draftSaved')) }, [t('saveDraft')]),
      el('button', { class: 'primary-btn', onclick: saveManualFIR }, [icon('check'), t('saveCase')])
    ])
  ]);
}

export function renderFIR(c) {
  c.innerHTML = '';
  const modeBar = el('div', { class: 'fir-mode-bar' }, [
    el('span', { class: 'section-label' }, [t('caseDetails')]),
    el('div', { class: 'mode-buttons' }, [
      el('button', { class: `mode-button ${state.firMode === 'upload' ? 'active' : ''}`, onclick: () => { state.firMode = 'upload'; notifyStateChange(); } }, [icon('upload'), t('scannedUpload')]),
      el('button', { class: `mode-button ${state.firMode === 'manual' ? 'active' : ''}`, onclick: () => { state.firMode = 'manual'; notifyStateChange(); } }, [icon('file'), t('manualEntry')])
    ])
  ]);
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, [t('documentIntelligence')]),
        el('h1', {}, [t('fir')]),
        el('p', { class: 'muted' }, [t('uploadWorkflow')])
      ]),
      el('span', { class: 'secure-pill' }, [icon('lock'), t('secure')])
    ]),
    modeBar
  );
  if (state.firMode === 'manual') c.append(manualFIRPanel());
  else c.append(uploadFIRPanel());
}
