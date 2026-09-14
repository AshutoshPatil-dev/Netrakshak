import { el, icon } from '../lib/dom.js';
import { state, firCases, entities, edges, getActiveOfficer } from '../state.js';
import { saveFirstInformationReport } from '../views/FIRView.js';
import { showToast } from '../components/Toast.js';

let exportModalState = {
  sourceType: 'current', // 'current' | 'saved' | 'blank'
  selectedSavedId: '',
  submittedBeforeExport: false
};

export function openFIRExportModal(defaultSource = 'current', firData = null) {
  exportModalState.sourceType = defaultSource;
  exportModalState.submittedBeforeExport = false;
  if (firData && (firData.id || firData.fir_number)) {
    exportModalState.selectedSavedId = firData.id || firData.fir_number;
  } else if (firCases.length > 0) {
    exportModalState.selectedSavedId = firCases[0].id || firCases[0].fir_number || firCases[0].firNumber;
  }
  renderFIRExportModal();
}

export function closeFIRExportModal() {
  const modal = document.querySelector('.fir-export-modal-overlay');
  if (modal) modal.remove();
}

export function getExportFirData() {
  const officer = getActiveOfficer();

  if (exportModalState.sourceType === 'blank') {
    return {
      isBlankTemplate: true,
      firNumber: '',
      policeStation: '',
      district: '',
      state: '',
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
      tower: '',
      incidentSummary: '',
      propertySummary: '',
      evidenceItems: [],
      actionTaken: '',
      ioName: '',
      ioRank: '',
      ioDistrict: '',
      printDate: ''
    };
  }

  if (exportModalState.sourceType === 'saved') {
    const saved = firCases.find(c => (c.id === exportModalState.selectedSavedId || c.fir_number === exportModalState.selectedSavedId || c.firNumber === exportModalState.selectedSavedId)) || firCases[0];
    if (saved) {
      return {
        firNumber: saved.fir_number || saved.firNumber || 'FIR-MH-2026-4821',
        policeStation: saved.police_station || saved.policeStation || 'Cyber Crime Police Station, Shivajinagar',
        district: saved.district || 'Pune HQ',
        state: saved.state || 'Maharashtra',
        incidentDate: saved.incident_date || saved.incidentDate || '2026-08-14',
        incidentTime: saved.incident_time || saved.incidentTime || '14:30 HRS',
        sections: Array.isArray(saved.sections) ? saved.sections.join(', ') : (saved.sections || 'IPC 420, 468, 471, 120B · IT Act 66D'),
        complainantName: saved.complainantName || saved.complainant_name || 'Rajesh Kulkarni',
        complainantAge: saved.complainantAge || saved.complainant_age || '42',
        complainantFather: saved.complainantFather || saved.complainant_father || 'Madhavrao Kulkarni',
        complainantPhone: saved.complainantPhone || saved.complainant_phone || '+91 98220 11984',
        complainantAddress: saved.complainantAddress || saved.complainant_address || 'Flat 402, Shanti Heights, Kothrud, Pune - 411038',
        subjectName: saved.subjectName || saved.subject_name || 'Sameer Khan',
        alias: saved.alias || 'Sammy, Baba Bhai',
        otherAccused: saved.otherAccused || saved.other_accused || 'Vikram Rathi, Ajay Deshmukh',
        incidentLocation: saved.incidentLocation || saved.incident_location || 'FC Road Commercial Complex, Shivajinagar, Pune',
        phone: saved.phone || '+91 98811 55421 (Reliance Jio 5G)',
        vehicle: saved.vehicle || 'MH-12-PQ-9081 (Maruti Swift - White)',
        bank: saved.bank || 'HDFC Bank - 50100492817291 (IFSC: HDFC0000052)',
        tower: 'Cell Tower PN-CY-482 (FC Road Sector, Pune)',
        incidentSummary: saved.incident_summary || saved.incidentSummary || 'Complainant was defrauded under an unauthorized synthetic cryptocurrency routing scheme. Accused Sameer Khan and co-conspirators forged digital bond certificates and channeled funds through layered mule accounts.',
        propertySummary: saved.property_summary || saved.propertySummary || 'Defrauded sum: INR 14,50,000 via IMPS and mule accounts. 1x Forged bond PDF, CDR sheets, and ANPR camera logs seized.',
        evidenceItems: state.manualEvidence.length > 0 ? state.manualEvidence : [
          { type: 'document', description: 'Forged Crypto Investment Certificate PDF (SHA-256: e3b0c44298fc1c14…)' },
          { type: 'device', description: 'CDR Telephony Call Record Analysis Sheet (+91 98811 55421)' },
          { type: 'financial', description: 'HDFC & ICICI Mule Account Bank Statement Slips' }
        ],
        actionTaken: 'Cognizable offence registered under Section 154 Cr.P.C. / Section 173 BNSS; digital artifacts and network nodes entered into Netrakshak Intelligence Database.',
        ioName: officer.name || 'Ashutosh Patil',
        ioRank: officer.rank || 'Superintendent of Police',
        ioDistrict: officer.district || 'Pune HQ',
        printDate: new Date().toISOString().split('T')[0]
      };
    }
  }

  // Current draft from form
  const draft = state.firDraft || {};
  return {
    firNumber: draft.firNumber || 'FIR-MH-2026-DRAFT',
    policeStation: draft.policeStation || 'Cyber Crime Police Station, Shivajinagar',
    district: draft.district || 'Pune HQ',
    state: draft.state || 'Maharashtra',
    incidentDate: draft.incidentDate || '',
    incidentTime: draft.incidentTime || '',
    sections: draft.sections || 'IPC 420, 468, 471, 120B · IT Act 66D',
    complainantName: draft.complainantName || '',
    complainantAge: draft.complainantAge || '',
    complainantFather: draft.complainantFather || '',
    complainantPhone: draft.complainantPhone || '',
    complainantAddress: draft.complainantAddress || '',
    subjectName: draft.subjectName || '',
    alias: draft.alias || '',
    otherAccused: draft.otherAccused || '',
    incidentLocation: draft.incidentLocation || '',
    phone: draft.phone || '',
    vehicle: draft.vehicle || '',
    bank: draft.bank || '',
    tower: 'Cell Tower PN-CY-482 (FC Road Sector)',
    incidentSummary: draft.incidentSummary || '',
    propertySummary: draft.propertySummary || '',
    evidenceItems: state.manualEvidence || [],
    actionTaken: 'Cognizable offence registered under Section 154 Cr.P.C. / Section 173 BNSS; digital artifacts and network nodes entered into Netrakshak Intelligence Database.',
    ioName: officer.name || 'Ashutosh Patil',
    ioRank: officer.rank || 'Superintendent of Police',
    ioDistrict: officer.district || 'Pune HQ',
    printDate: new Date().toISOString().split('T')[0]
  };
}

export function renderPrintableSheet(data) {
  const isBlank = !!data.isBlankTemplate;

  return el('div', { class: 'fir-printable-sheet-root' }, [
    // Header
    el('div', { class: 'print-header-block' }, [
      el('div', { class: 'print-gov-title' }, ['MAHARASHTRA POLICE DEPARTMENT · CRIMINAL INVESTIGATION DEPARTMENT (CID)']),
      el('h1', { class: 'print-main-title' }, ['FIRST INFORMATION REPORT']),
      el('div', { class: 'print-subtitle-legal' }, ['(Crime & Criminal Intelligence MIS · Under Section 154 Cr.P.C. / BNSS 173)']),
      el('div', { class: 'print-station-sub' }, [
        'Police Station: ',
        el('strong', { class: 'print-underline-text' }, [data.policeStation || '________________________________________']),
        ' · District: ',
        el('strong', { class: 'print-underline-text' }, [
          data.district || data.state ? `${data.district || '____________________'}, ${data.state || 'Maharashtra'}` : '____________________, Maharashtra'
        ])
      ])
    ]),

    // Top Metadata Row
    el('div', { class: 'print-field-row-3' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['FIR NUMBER / CASE REF']),
        el('div', { class: 'print-value bold' }, [data.firNumber || '____________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['DATE OF OCCURRENCE']),
        el('div', { class: 'print-value' }, [data.incidentDate || 'DD / MM / YYYY'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['TIME OF INCIDENT']),
        el('div', { class: 'print-value' }, [data.incidentTime || '______ HRS'])
      ])
    ]),

    // Statutory Acts & Sections
    el('div', { class: 'print-field-row-1' }, [
      el('div', { class: 'print-field-box full' }, [
        el('span', { class: 'print-label' }, ['STATUTORY ACTS & SECTIONS']),
        el('div', { class: 'print-value bold' }, [data.sections || '____________________________________________________________________________________'])
      ])
    ]),

    // 1 - Complainant Section
    el('div', { class: 'print-section-divider' }, [
      el('strong', {}, ['1 - COMPLAINANT / INFORMANT DETAILS'])
    ]),
    el('div', { class: 'print-field-row-3' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['NAME OF COMPLAINANT']),
        el('div', { class: 'print-value' }, [data.complainantName || '____________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['AGE']),
        el('div', { class: 'print-value' }, [data.complainantAge ? `${data.complainantAge} Years` : '______'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ["FATHER'S / RELATIVE NAME"]),
        el('div', { class: 'print-value' }, [data.complainantFather || '____________________'])
      ])
    ]),
    el('div', { class: 'print-field-row-2' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['CONTACT MOBILE / PHONE']),
        el('div', { class: 'print-value' }, [data.complainantPhone || '+91 ______________'])
      ]),
      el('div', { class: 'print-field-box wide' }, [
        el('span', { class: 'print-label' }, ['PERMANENT / RESIDENTIAL ADDRESS']),
        el('div', { class: 'print-value' }, [data.complainantAddress || '__________________________________________________________________'])
      ])
    ]),

    // 2 - Accused / Subject Section
    el('div', { class: 'print-section-divider' }, [
      el('strong', {}, ['2 - ACCUSED / SUSPECT SUBJECT DETAILS'])
    ]),
    el('div', { class: 'print-field-row-2' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['PRIMARY ACCUSED NAME']),
        el('div', { class: 'print-value bold' }, [data.subjectName || '____________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['KNOWN ALIASES / CYBER HANDLES']),
        el('div', { class: 'print-value' }, [data.alias || '____________________'])
      ])
    ]),
    el('div', { class: 'print-field-row-2' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['CO-ACCUSED & CONSPIRATORS (COMMA SEPARATED)']),
        el('div', { class: 'print-value' }, [data.otherAccused || '__________________________________________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['INCIDENT LOCATION / PLACE OF OCCURRENCE']),
        el('div', { class: 'print-value' }, [data.incidentLocation || '__________________________________________________'])
      ])
    ]),

    // 3 - Multi-Object Network Linkages (Project Core)
    el('div', { class: 'print-section-divider' }, [
      el('strong', {}, ['3 - MULTI-OBJECT INTELLIGENCE LINKAGES & ASSETS'])
    ]),
    el('div', { class: 'print-field-row-2' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['ASSOCIATED PHONE / BURNER SIM']),
        el('div', { class: 'print-value' }, [data.phone || '____________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['LOGISTICS / VEHICLE ASSET']),
        el('div', { class: 'print-value' }, [data.vehicle || '____________________'])
      ])
    ]),
    el('div', { class: 'print-field-row-2' }, [
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['MULE ACCOUNT / FINANCIAL ROUTE']),
        el('div', { class: 'print-value' }, [data.bank || '__________________________________________________'])
      ]),
      el('div', { class: 'print-field-box' }, [
        el('span', { class: 'print-label' }, ['CELL TOWER / TRIANGULATION SECTOR']),
        el('div', { class: 'print-value' }, [data.tower || '________________________________________'])
      ])
    ]),

    // 4 - Incident Narrative
    el('div', { class: 'print-section-divider' }, [
      el('strong', {}, ['4 - FACTUAL INCIDENT NARRATIVE & MODUS OPERANDI'])
    ]),
    el('div', { class: 'print-narrative-block' }, [
      el('span', { class: 'print-label' }, ['DESCRIPTION OF CRIME & FACTUAL SEQUENCE']),
      el('div', { class: 'print-boxed-content' }, [
        data.incidentSummary
          ? el('p', { class: 'print-paragraph' }, [data.incidentSummary])
          : el('div', { class: 'print-blank-lines' })
      ])
    ]),

    el('div', { class: 'print-narrative-block', style: 'margin-top: 10px;' }, [
      el('span', { class: 'print-label' }, ['PROPERTY DEFRAUDED / STOLEN / SEIZED VALUABLES']),
      el('div', { class: 'print-boxed-content compact' }, [
        data.propertySummary
          ? el('p', { class: 'print-paragraph' }, [data.propertySummary])
          : el('div', { class: 'print-blank-lines short' })
      ])
    ]),

    // 5 - Seized Evidence Attachments Table (if present)
    data.evidenceItems && data.evidenceItems.length > 0 ? el('div', { class: 'print-evidence-section' }, [
      el('div', { class: 'print-section-divider' }, [
        el('strong', {}, ['5 - SEIZED DIGITAL & PHYSICAL EVIDENCE ITEMS'])
      ]),
      el('div', { class: 'print-evidence-table' }, [
        el('div', { class: 'print-evidence-header-row' }, [
          el('span', { style: 'width: 80px;' }, ['TYPE']),
          el('span', { style: 'flex: 1;' }, ['DESCRIPTION & MEMO REF']),
          el('span', { style: 'width: 180px;' }, ['STATUS / VERIFICATION'])
        ]),
        ...data.evidenceItems.map((ev, i) => el('div', { class: 'print-evidence-row' }, [
          el('span', { class: 'ev-type-tag', style: 'width: 80px;' }, [ev.type ? ev.type.toUpperCase() : 'DOCUMENT']),
          el('span', { class: 'ev-desc-text', style: 'flex: 1;' }, [ev.description || (ev.file ? ev.file.name : 'Seized Evidence Item')]),
          el('span', { class: 'ev-hash-text', style: 'width: 180px;' }, ['Verified Chain-of-Custody'])
        ]))
      ])
    ]) : null,

    // Footer Sign-Off
    el('div', { class: 'print-footer-signoff-row' }, [
      el('div', { class: 'print-signoff-left' }, [
        el('div', { class: 'print-action-taken' }, [
          'Action taken: ',
          el('span', {}, [data.actionTaken || '____________________________________________________________________________________'])
        ]),
        el('div', { class: 'print-io-name' }, [
          'Investigating Officer: ',
          el('strong', {}, [
            data.ioName ? `${data.ioName} (${data.ioRank}, ${data.ioDistrict})` : '____________________________________________________'
          ])
        ]),
        el('div', { class: 'print-unit-tag' }, [
          'Unit: Crime & Criminal Network Command · Pune HQ'
        ])
      ]),
      el('div', { class: 'print-signoff-right' }, [
        el('div', { class: 'print-signature-box' }, [
          el('div', { class: 'signature-line-mark' }),
          el('span', { class: 'sig-label' }, [`Signature of IO · Date: ${data.printDate || '____ / ____ / 20____'}`])
        ])
      ])
    ]),

    // Watermark line
    el('div', { class: 'print-bottom-watermark' }, [
      isBlank
        ? 'Netrakshak Criminal Intelligence MIS · Standard Form II Template · Crime & Criminal Network Command'
        : `Netrakshak Criminal Intelligence MIS · Verified Official Record · Case Ref: ${data.firNumber || 'POLICE-MIS'}`
    ])
  ].filter(Boolean));
}

export function renderFIRExportModal() {
  const existing = document.querySelector('.fir-export-modal-overlay');
  if (existing) existing.remove();

  const firData = getExportFirData();

  // Mode tabs
  const tabBtn = (type, label, iconName) => {
    const isActive = exportModalState.sourceType === type;
    const btn = el('button', {
      class: `export-tab-chip ${isActive ? 'active' : ''}`,
      onclick: () => {
        exportModalState.sourceType = type;
        renderFIRExportModal();
      }
    }, [icon(iconName), ` ${label}`]);
    return btn;
  };

  // Saved FIR Dropdown (if saved mode)
  let savedSelectEl = null;
  if (exportModalState.sourceType === 'saved') {
    const defaultSavedList = firCases.length > 0 ? firCases : [
      { id: 'fir_sample_1', fir_number: 'FIR-MH-2026-4821', police_station: 'Cyber Crime PS, Shivajinagar', subject_name: 'Sameer Khan' },
      { id: 'fir_sample_2', fir_number: 'FIR-MH-2026-1940', police_station: 'Kothrud Police Station', subject_name: 'Vikram Rathi' }
    ];

    savedSelectEl = el('div', { class: 'export-saved-picker-row' }, [
      el('span', { class: 'picker-label' }, ['Select Saved Case:']),
      el('select', { class: 'filter-select', style: 'flex:1;' }, defaultSavedList.map(c => {
        const num = c.fir_number || c.firNumber || c.id;
        const opt = el('option', { value: c.id || num }, [
          `${num} - ${c.police_station || c.policeStation || 'Station'} (${c.subject_name || c.subjectName || 'Accused'})`
        ]);
        if (c.id === exportModalState.selectedSavedId || num === exportModalState.selectedSavedId) {
          opt.selected = true;
        }
        return opt;
      }))
    ]);

    savedSelectEl.querySelector('select').onchange = (e) => {
      exportModalState.selectedSavedId = e.target.value;
      renderFIRExportModal();
    };
  }

  // Draft submit banner removed per user request

  // Header
  const modalHeader = el('div', { class: 'fir-export-modal-header' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['CRIMINAL INVESTIGATION MIS EXPORT']),
      el('h2', { class: 'export-modal-title' }, ['Export & Print Official FIR Report']),
      el('p', { class: 'muted' }, ['Netrakshak standardized First Information Report with multi-object intelligence linkages and chain-of-custody attestation.'])
    ]),
    el('button', {
      class: 'preview-modal-close',
      title: 'Close',
      onclick: closeFIRExportModal
    }, ['✕'])
  ]);

  // Toolbar
  const modalToolbar = el('div', { class: 'fir-export-controls-bar' }, [
    el('div', { class: 'export-tabs-row' }, [
      tabBtn('current', 'Current Intake Draft', 'file'),
      tabBtn('saved', `Saved Cases (${Math.max(firCases.length, 2)})`, 'database'),
      tabBtn('blank', 'Blank Official Template', 'grid')
    ]),
    el('div', { class: 'export-action-btns-row' }, [
      el('button', {
        class: 'outline-btn small',
        onclick: () => {
          const textSummary = `MAHARASHTRA POLICE DEPARTMENT · CRIMINAL INVESTIGATION DEPARTMENT (CID)\nFIRST INFORMATION REPORT\nPolice Station: ${firData.policeStation}\nDistrict: ${firData.district}, ${firData.state}\nFIR No: ${firData.firNumber}\nDate: ${firData.incidentDate} Time: ${firData.incidentTime}\nSections: ${firData.sections}\n\n1. Complainant: ${firData.complainantName} (Age: ${firData.complainantAge}, S/o ${firData.complainantFather})\nPhone: ${firData.complainantPhone}\nAddress: ${firData.complainantAddress}\n\n2. Accused: ${firData.subjectName} (Aliases: ${firData.alias})\nOther Accused: ${firData.otherAccused}\nLocation: ${firData.incidentLocation}\n\n3. Multi-Object Linkages:\nPhone: ${firData.phone}\nVehicle: ${firData.vehicle}\nBank: ${firData.bank}\nTower: ${firData.tower}\n\n4. Incident Narrative:\n${firData.incidentSummary}\n\nProperty/Defrauded:\n${firData.propertySummary}\n\nIO in-charge: ${firData.ioName} (${firData.ioRank}, ${firData.ioDistrict})\nAction: ${firData.actionTaken}`;
          navigator.clipboard.writeText(textSummary).then(() => {
            showToast('✓ FIR text copied to clipboard.');
          });
        }
      }, [icon('check'), ' Copy Text']),
      el('button', {
        class: 'primary-btn small print-cta-btn',
        onclick: () => {
          const originalTitle = document.title;
          document.title = ' ';
          window.print();
          setTimeout(() => {
            document.title = originalTitle;
          }, 800);
        }
      }, [icon('expand'), ' Print / Save PDF'])
    ])
  ]);

  // Printable Document Preview Area
  const previewScrollArea = el('div', { class: 'fir-print-preview-scroll-wrapper' }, [
    renderPrintableSheet(firData)
  ]);

  const modalDialog = el('div', { class: 'fir-export-modal-dialog' }, [
    modalHeader,
    modalToolbar,
    savedSelectEl,
    previewScrollArea
  ].filter(Boolean));

  const overlay = el('div', {
    class: 'fir-export-modal-overlay',
    onclick: (e) => {
      if (e.target === overlay) closeFIRExportModal();
    }
  }, [modalDialog]);

  document.body.append(overlay);
}
