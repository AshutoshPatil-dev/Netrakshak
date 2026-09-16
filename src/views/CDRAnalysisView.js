import { el, icon, escapeHtml } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { 
  state, 
  entities, 
  edges, 
  injectCDRIntoGraph, 
  recordAudit, 
  notifyStateChange,
  openEntityProfile
} from '../state.js';
import { 
  SAMPLE_PUNE_CYBER_CDR, 
  SAMPLE_SWARGATE_EXTORTION_CDR, 
  parseCDRCSV, 
  analyze24HourHistogram, 
  analyzeIMEISwaps, 
  analyzeTopContacts, 
  analyzeTowerCoLocation, 
  generateSection91PreservationNotice 
} from '../lib/cdrParser.js';
import { showToast } from '../components/Toast.js';

// Local view state
let customUploadedCDR = null;
let selectedHourFilter = null; // null for all, or 0-23
let selectedContactTarget = null;
let noticeFormState = {
  targetNumber: '+919820123456',
  imei: '864209040182741',
  imsi: '404450123456789',
  caseNumber: 'FIR-2026-CR-0891',
  policeStation: 'Cyber Crime Police Station, Shivajinagar, Pune',
  officerName: 'Inspector Ashutosh Patil',
  tspName: 'Bharti Airtel / Reliance Jio / Vodafone Idea'
};

function getActiveCDRRecords() {
  if (state.cdrActiveDataset === 'custom' && customUploadedCDR && customUploadedCDR.length > 0) {
    return customUploadedCDR;
  }
  if (state.cdrActiveDataset === 'swargate_extortion') {
    return SAMPLE_SWARGATE_EXTORTION_CDR;
  }
  return SAMPLE_PUNE_CYBER_CDR;
}

export function renderCDRAnalysis(c) {
  const records = getActiveCDRRecords();
  const histogram = analyze24HourHistogram(records);
  const imeiSwaps = analyzeIMEISwaps(records);
  const towerAnalysis = analyzeTowerCoLocation(records);
  const topContacts = analyzeTopContacts(records, selectedContactTarget);

  const container = el('div', { class: 'cdr-analysis-view' }, [
    renderHeader(),
    renderMetricCards(histogram, imeiSwaps, towerAnalysis),
    renderTabNav(),
    renderActiveTabContent(records, histogram, imeiSwaps, topContacts, towerAnalysis)
  ]);

  if (c) {
    c.innerHTML = '';
    c.append(container);
  }

  return container;
}

function renderHeader() {
  const fileInput = el('input', {
    type: 'file',
    accept: '.csv,.tsv,.txt',
    style: 'display: none;',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseCDRCSV(text);
        if (parsed.length === 0) {
          showToast('No valid CDR rows found in CSV. Check column headers.', 'error');
          return;
        }
        customUploadedCDR = parsed;
        state.cdrActiveDataset = 'custom';
        selectedHourFilter = null;
        selectedContactTarget = null;
        showToast(`Successfully ingested ${parsed.length} CDR records from ${file.name}`, 'success');
        recordAudit('CDR CSV Ingestion', `Ingested ${parsed.length} telecom records from ${file.name}`, 'info', 'telecom');
        notifyStateChange();
      } catch (err) {
        showToast(`Failed to parse CDR CSV: ${err.message}`, 'error');
      }
    }
  });

  return el('div', { class: 'cdr-header-card' }, [
    el('div', { class: 'cdr-header-top' }, [
      el('div', { class: 'cdr-title-group' }, [
        el('div', { class: 'cdr-badge' }, [
          el('span', { class: 'badge-dot' }),
          el('span', {}, ['MHA / NCRB TELECOM INTELLIGENCE ENGINE'])
        ]),
        el('h1', { class: 'cdr-title' }, ['Telecom CDR & IPDR Ingestion Analyzer']),
        el('p', { class: 'cdr-subtitle' }, [
          'Automated TSP dump ingestion, 24-hour chronological burst profiling, IMEI-IMSI handset matrix, and Cell Tower co-location triangulation.'
        ])
      ]),
      el('div', { class: 'cdr-dataset-actions' }, [
        fileInput,
        el('button', {
          class: `btn-dataset ${state.cdrActiveDataset === 'pune_cyber' ? 'active' : ''}`,
          onclick: () => {
            state.cdrActiveDataset = 'pune_cyber';
            selectedHourFilter = null;
            selectedContactTarget = null;
            noticeFormState.targetNumber = '+919820123456';
            noticeFormState.imei = '864209040182741';
            notifyStateChange();
          }
        }, ['Pune Cyber Syndicate']),
        el('button', {
          class: `btn-dataset ${state.cdrActiveDataset === 'swargate_extortion' ? 'active' : ''}`,
          onclick: () => {
            state.cdrActiveDataset = 'swargate_extortion';
            selectedHourFilter = null;
            selectedContactTarget = null;
            noticeFormState.targetNumber = '+919933441122';
            noticeFormState.imei = '358902094182900';
            notifyStateChange();
          }
        }, ['Swargate Extortion']),
        el('button', {
          class: `btn-dataset-upload ${state.cdrActiveDataset === 'custom' ? 'active' : ''}`,
          onclick: () => fileInput.click()
        }, [icon('upload'), ' Ingest Raw TSP CSV'])
      ])
    ])
  ]);
}

function renderMetricCards(histogram, imeiSwaps, towerAnalysis) {
  return el('div', { class: 'cdr-metric-grid' }, [
    el('div', { class: 'cdr-metric-card' }, [
      el('div', { class: 'metric-label' }, ['Total Call Records']),
      el('div', { class: 'metric-value' }, [String(histogram.totalCalls)]),
      el('div', { class: 'metric-meta' }, [`Duration: ${histogram.totalDurationFormatted}`])
    ]),
    el('div', { class: `cdr-metric-card ${histogram.hasHighNocturnalRisk ? 'metric-card-alert' : ''}` }, [
      el('div', { class: 'metric-label' }, ['Nocturnal Calls (23:00 - 05:00)']),
      el('div', { class: 'metric-value highlight-red' }, [`${histogram.nocturnalCalls} (${histogram.nocturnalPercent}%)`]),
      el('div', { class: 'metric-meta' }, [
        histogram.hasHighNocturnalRisk ? '⚠️ High Suspicion: Off-hours burner activity' : 'Normal daytime communication'
      ])
    ]),
    el('div', { class: `cdr-metric-card ${imeiSwaps.swapAlertCount > 0 ? 'metric-card-alert' : ''}` }, [
      el('div', { class: 'metric-label' }, ['IMEI Handset Swaps']),
      el('div', { class: 'metric-value highlight-amber' }, [`${imeiSwaps.swapAlertCount} Devices`]),
      el('div', { class: 'metric-meta' }, [
        imeiSwaps.swapAlertCount > 0 ? `${imeiSwaps.swapAlertCount} IMEIs linked to multiple SIMs` : 'Single SIM per handset'
      ])
    ]),
    el('div', { class: 'cdr-metric-card' }, [
      el('div', { class: 'metric-label' }, ['Cell Towers & Sectors']),
      el('div', { class: 'metric-value' }, [String(towerAnalysis.length)]),
      el('div', { class: 'metric-meta' }, [`Peak Tower: ${towerAnalysis[0]?.towerName || 'None'}`])
    ])
  ]);
}

function renderTabNav() {
  const tabs = [
    { id: 'histogram', label: '24h Chronological Burst Profiling', icon: 'audit' },
    { id: 'imei_matrix', label: 'IMEI - IMSI Handset Matrix', icon: 'lock' },
    { id: 'top_contacts', label: 'Top Contacts & Graph Injection', icon: 'users' },
    { id: 'tower_preservation', label: 'Cell Towers & Section 91 Notice', icon: 'file' }
  ];

  return el('div', { class: 'cdr-tab-nav' }, tabs.map(t => {
    const isActive = (state.cdrActiveTab || 'histogram') === t.id;
    return el('button', {
      class: `cdr-tab-btn ${isActive ? 'active' : ''}`,
      onclick: () => {
        state.cdrActiveTab = t.id;
        notifyStateChange();
      }
    }, [
      icon(t.icon),
      el('span', {}, [t.label])
    ]);
  }));
}

function renderActiveTabContent(records, histogram, imeiSwaps, topContacts, towerAnalysis) {
  const currentTab = state.cdrActiveTab || 'histogram';

  switch (currentTab) {
    case 'histogram':
      return renderHistogramTab(records, histogram);
    case 'imei_matrix':
      return renderIMEIMatrixTab(records, imeiSwaps);
    case 'top_contacts':
      return renderTopContactsTab(records, topContacts);
    case 'tower_preservation':
      return renderTowerPreservationTab(records, towerAnalysis);
    default:
      return renderHistogramTab(records, histogram);
  }
}

// ---------------- TAB 1: 24H HISTOGRAM & LOGS ----------------
function renderHistogramTab(records, histogram) {
  const maxCount = Math.max(...histogram.hourlyBuckets.map(b => b.count), 1);

  // Filter records based on selected hour or nocturnal filter
  let displayRecords = records;
  if (selectedHourFilter !== null) {
    displayRecords = records.filter(r => {
      const hr = new Date(r.timestamp).getHours();
      return hr === selectedHourFilter;
    });
  }

  const chartBars = histogram.hourlyBuckets.map(bucket => {
    const heightPercent = Math.max((bucket.count / maxCount) * 100, 4);
    const isSelected = selectedHourFilter === bucket.hour;
    const isNocturnal = bucket.isNocturnal;

    let barClass = 'histogram-bar';
    if (isNocturnal) barClass += ' bar-nocturnal';
    if (isSelected) barClass += ' bar-selected';

    return el('div', {
      class: 'histogram-bar-wrapper',
      title: `${bucket.label} (${isNocturnal ? 'Nocturnal' : 'Daytime'}): ${bucket.count} calls`,
      onclick: () => {
        selectedHourFilter = (selectedHourFilter === bucket.hour) ? null : bucket.hour;
        notifyStateChange();
      }
    }, [
      el('div', { class: 'bar-count-label' }, [bucket.count > 0 ? String(bucket.count) : '']),
      el('div', { class: 'bar-track' }, [
        el('div', { class: barClass, style: `height: ${heightPercent}%;` })
      ]),
      el('div', { class: `bar-hour-label ${isNocturnal ? 'label-nocturnal' : ''}` }, [bucket.label])
    ]);
  });

  return el('div', { class: 'cdr-tab-pane' }, [
    el('div', { class: 'cdr-chart-card' }, [
      el('div', { class: 'chart-header' }, [
        el('div', {}, [
          el('h3', { class: 'card-heading' }, ['24-Hour Call Frequency Distribution']),
          el('p', { class: 'card-subtext' }, [
            'Highlighted red bars indicate nocturnal window (23:00 - 05:00 IST), typical of burner phone coordination.'
          ])
        ]),
        el('div', { class: 'chart-filter-actions' }, [
          el('button', {
            class: `btn-filter-pill ${selectedHourFilter === null ? 'active' : ''}`,
            onclick: () => {
              selectedHourFilter = null;
              notifyStateChange();
            }
          }, ['Show All 24h']),
          el('button', {
            class: `btn-filter-pill ${selectedHourFilter === 'nocturnal' ? 'active' : ''}`,
            onclick: () => {
              selectedHourFilter = (selectedHourFilter === 'nocturnal') ? null : 'nocturnal';
              notifyStateChange();
            }
          }, ['Filter Nocturnal Only (23:00 - 05:00)'])
        ])
      ]),
      el('div', { class: 'histogram-chart-container' }, chartBars)
    ]),

    el('div', { class: 'cdr-table-card' }, [
      el('div', { class: 'table-header-row' }, [
        el('h3', { class: 'card-heading' }, [
          `Call Record Logs (${displayRecords.length} calls ${selectedHourFilter !== null ? 'filtered' : ''})`
        ]),
        el('span', { class: 'table-badge' }, [
          selectedHourFilter !== null ? `Hour Filter Active` : 'Complete Stream'
        ])
      ]),
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'cdr-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', {}, ['Timestamp (IST)']),
              el('th', {}, ['Calling Party (A)']),
              el('th', {}, ['Called Party (B)']),
              el('th', {}, ['Duration']),
              el('th', {}, ['Type']),
              el('th', {}, ['IMEI Handset']),
              el('th', {}, ['Cell Tower Sector']),
              el('th', {}, ['Classification'])
            ])
          ]),
          el('tbody', {}, displayRecords.map(r => {
            const timeFormatted = new Date(r.timestamp).toLocaleString('en-IN', {
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return el('tr', { class: r.isNocturnal ? 'row-nocturnal' : '' }, [
              el('td', { class: 'mono-text' }, [timeFormatted]),
              el('td', {}, [
                el('strong', {}, [r.callingName || r.callingNumber]),
                el('div', { class: 'sub-id mono-text' }, [r.callingNumber])
              ]),
              el('td', {}, [
                el('strong', {}, [r.calledName || r.calledNumber]),
                el('div', { class: 'sub-id mono-text' }, [r.calledNumber])
              ]),
              el('td', { class: 'mono-text' }, [`${r.durationSec}s`]),
              el('td', {}, [
                el('span', { class: `type-tag ${r.callType.toLowerCase().includes('in') ? 'tag-in' : 'tag-out'}` }, [
                  r.callType
                ])
              ]),
              el('td', { class: 'mono-text text-muted' }, [r.imei || '-']),
              el('td', {}, [
                el('div', {}, [r.firstCellTower || r.firstCellId]),
                el('div', { class: 'sub-id' }, [`Sector: ${r.firstCellSector || '0°'}`])
              ]),
              el('td', {}, [
                r.isNocturnal
                  ? el('span', { class: 'risk-pill pill-red' }, ['NOCTURNAL BURST'])
                  : el('span', { class: 'risk-pill pill-gray' }, ['Standard Daytime'])
              ])
            ]);
          }))
        ])
      ])
    ])
  ]);
}

// ---------------- TAB 2: IMEI - IMSI SWAP MATRIX ----------------
function renderIMEIMatrixTab(records, imeiSwaps) {
  return el('div', { class: 'cdr-tab-pane' }, [
    el('div', { class: 'alert-box alert-amber' }, [
      el('span', { class: 'alert-icon' }, ['⚠️']),
      el('div', { class: 'alert-text' }, [
        el('strong', {}, ['Handset Swapping & Multi-SIM Burner Analysis: ']),
        'Criminal syndicates frequently switch physical SIM cards (IMSIs) within the same physical phone (IMEI) to evade surveillance. Any IMEI associated with 2 or more IMSIs is flagged below.'
      ])
    ]),

    el('div', { class: 'cdr-table-card' }, [
      el('div', { class: 'table-header-row' }, [
        el('h3', { class: 'card-heading' }, ['IMEI Device Fingerprint & SIM Association Matrix']),
        el('span', { class: 'table-badge' }, [`${imeiSwaps.imeiList.length} Unique Handsets`])
      ]),
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'cdr-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', {}, ['IMEI Handset']),
              el('th', {}, ['Associated IMSI SIMs']),
              el('th', {}, ['Phone Numbers (MSISDN)']),
              el('th', {}, ['Total Calls']),
              el('th', {}, ['First Seen']),
              el('th', {}, ['Last Seen']),
              el('th', {}, ['Risk Classification'])
            ])
          ]),
          el('tbody', {}, imeiSwaps.imeiList.map(item => {
            const firstFormatted = new Date(item.firstSeen).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            const lastFormatted = new Date(item.lastSeen).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

            return el('tr', { class: item.isSwapped ? 'row-alert' : '' }, [
              el('td', { class: 'mono-text bold-text' }, [item.imei]),
              el('td', {}, [
                el('div', { class: 'imsi-chips' }, item.imsisArray.map(imsi => 
                  el('span', { class: `chip-imsi ${item.isSwapped ? 'chip-danger' : ''}` }, [imsi])
                )),
                item.isSwapped ? el('div', { class: 'sub-id highlight-red' }, [`${item.simCount} distinct SIM cards swapped into this handset`]) : null
              ]),
              el('td', { class: 'mono-text' }, [
                item.phonesArray.join(', ')
              ]),
              el('td', { class: 'mono-text' }, [String(item.callCount)]),
              el('td', { class: 'mono-text text-muted' }, [firstFormatted]),
              el('td', { class: 'mono-text text-muted' }, [lastFormatted]),
              el('td', {}, [
                item.isSwapped
                  ? el('span', { class: 'risk-pill pill-red' }, [item.riskBadge])
                  : el('span', { class: 'risk-pill pill-gray' }, ['Single SIM Device'])
              ])
            ]);
          }))
        ])
      ])
    ]),

    el('div', { class: 'cdr-table-card' }, [
      el('div', { class: 'table-header-row' }, [
        el('h3', { class: 'card-heading' }, ['IMSI Subscriber SIM to Handset Roaming Matrix']),
        el('span', { class: 'table-badge' }, [`${imeiSwaps.imsiList.length} Unique SIMs`])
      ]),
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'cdr-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', {}, ['IMSI Subscriber SIM']),
              el('th', {}, ['Associated IMEIs (Handsets)']),
              el('th', {}, ['Phone Numbers']),
              el('th', {}, ['Total Activity']),
              el('th', {}, ['Device Hopping Status'])
            ])
          ]),
          el('tbody', {}, imeiSwaps.imsiList.map(sim => el('tr', {}, [
            el('td', { class: 'mono-text bold-text' }, [sim.imsi]),
            el('td', {}, [
              el('div', { class: 'imsi-chips' }, sim.imeisArray.map(imei => 
                el('span', { class: 'chip-imsi' }, [imei])
              ))
            ]),
            el('td', { class: 'mono-text' }, [sim.phonesArray.join(', ')]),
            el('td', { class: 'mono-text' }, [`${sim.callCount} calls`]),
            el('td', {}, [
              sim.isMultiHandset
                ? el('span', { class: 'risk-pill pill-amber' }, ['MULTI-DEVICE ROAMING'])
                : el('span', { class: 'risk-pill pill-gray' }, ['Single Handset'])
            ])
          ])))
        ])
      ])
    ])
  ]);
}

// ---------------- TAB 3: TOP CONTACTS & GRAPH INJECTION ----------------
function renderTopContactsTab(records, topContacts) {
  // Extract distinct target callers
  const callerSet = new Set(records.map(r => r.callingNumber).filter(Boolean));
  const callers = Array.from(callerSet);

  return el('div', { class: 'cdr-tab-pane' }, [
    el('div', { class: 'cdr-contacts-toolbar' }, [
      el('div', { class: 'target-filter-group' }, [
        el('label', { class: 'field-label' }, ['Target Investigation Number:']),
        el('select', {
          class: 'cdr-select',
          onchange: (e) => {
            selectedContactTarget = e.target.value === 'all' ? null : e.target.value;
            notifyStateChange();
          }
        }, [
          el('option', { value: 'all', selected: !selectedContactTarget }, ['All Communicating Numbers']),
          ...callers.map(c => el('option', { value: c, selected: selectedContactTarget === c }, [c]))
        ])
      ]),
      el('div', { class: 'graph-inject-actions' }, [
        el('button', {
          class: 'btn-primary-command',
          onclick: () => {
            injectCDRIntoGraph(records, selectedContactTarget);
            showToast('Injected CDR telecom relationships directly into Network Graph!', 'success');
            recordAudit('CDR Graph Injection', `Injected ${records.length} telecom CDR connections into interactive relationship graph`, 'info', 'network');
          }
        }, [
          icon('network'),
          ' Inject All CDR Links into Network Graph'
        ])
      ])
    ]),

    el('div', { class: 'cdr-table-card' }, [
      el('div', { class: 'table-header-row' }, [
        el('h3', { class: 'card-heading' }, ['Ranked Communicated Contacts Matrix']),
        el('span', { class: 'table-badge' }, [`${topContacts.length} Contacts`])
      ]),
      el('div', { class: 'table-responsive' }, [
        el('table', { class: 'cdr-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', {}, ['Rank']),
              el('th', {}, ['Contact Name & Number']),
              el('th', {}, ['Total Calls']),
              el('th', {}, ['Direction (In / Out / SMS)']),
              el('th', {}, ['Total Airtime']),
              el('th', {}, ['Nocturnal Burst %']),
              el('th', {}, ['Frequent Cell Towers']),
              el('th', {}, ['Suspicion Level']),
              el('th', {}, ['Graph Action'])
            ])
          ]),
          el('tbody', {}, topContacts.map((c, idx) => el('tr', {}, [
            el('td', { class: 'mono-text bold-text' }, [`#${idx + 1}`]),
            el('td', {}, [
              el('strong', {}, [c.name]),
              el('div', { class: 'sub-id mono-text' }, [c.phoneNumber])
            ]),
            el('td', { class: 'mono-text bold-text' }, [String(c.totalCalls)]),
            el('td', {}, [
              el('div', { class: 'direction-breakdown' }, [
                el('span', { class: 'dir-pill dir-in', title: 'Incoming' }, [`↓ ${c.incomingCalls}`]),
                el('span', { class: 'dir-pill dir-out', title: 'Outgoing' }, [`↑ ${c.outgoingCalls}`]),
                c.smsCount > 0 ? el('span', { class: 'dir-pill dir-sms', title: 'SMS' }, [`✉ ${c.smsCount}`]) : null
              ])
            ]),
            el('td', { class: 'mono-text' }, [c.totalDurationFormatted]),
            el('td', {}, [
              el('span', { class: `nocturnal-ratio ${c.nocturnalRatio >= 35 ? 'text-danger' : ''}` }, [
                `${c.nocturnalRatio}% (${c.nocturnalCalls} calls)`
              ])
            ]),
            el('td', { class: 'text-muted sub-id' }, [
              c.towersList.slice(0, 2).join(', ') || '-'
            ]),
            el('td', {}, [
              c.risk === 'High'
                ? el('span', { class: 'risk-pill pill-red' }, ['HIGH RISK'])
                : (c.risk === 'Medium'
                    ? el('span', { class: 'risk-pill pill-amber' }, ['MEDIUM'])
                    : el('span', { class: 'risk-pill pill-gray' }, ['LOW']))
            ]),
            el('td', {}, [
              el('button', {
                class: 'btn-action-sm',
                onclick: () => {
                  injectCDRIntoGraph(records, c.phoneNumber);
                  showToast(`Injected ${c.name} into Network Graph`, 'success');
                }
              }, [icon('network'), ' View on Graph'])
            ])
          ])))
        ])
      ])
    ])
  ]);
}

// ---------------- TAB 4: TOWER CO-LOCATION & LEGAL SECTION 91 NOTICE ----------------
function renderTowerPreservationTab(records, towerAnalysis) {
  const noticeText = generateSection91PreservationNotice({
    targetNumber: noticeFormState.targetNumber,
    imei: noticeFormState.imei,
    imsi: noticeFormState.imsi,
    tspName: noticeFormState.tspName,
    caseNumber: noticeFormState.caseNumber,
    policeStation: noticeFormState.policeStation,
    officerName: noticeFormState.officerName
  });

  return el('div', { class: 'cdr-tab-pane cdr-tower-pane-grid' }, [
    el('div', { class: 'cdr-tower-col' }, [
      el('div', { class: 'cdr-table-card' }, [
        el('div', { class: 'table-header-row' }, [
          el('h3', { class: 'card-heading' }, ['Cell Tower Triangulation & Dwell Analysis']),
          el('span', { class: 'table-badge' }, [`${towerAnalysis.length} Sites`])
        ]),
        el('div', { class: 'table-responsive' }, [
          el('table', { class: 'cdr-table' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', {}, ['Tower Site & Sector']),
                el('th', {}, ['Cell ID']),
                el('th', {}, ['Pings']),
                el('th', {}, ['Night Dwell %']),
                el('th', {}, ['Coordinates'])
              ])
            ]),
            el('tbody', {}, towerAnalysis.map(tower => el('tr', {}, [
              el('td', {}, [
                el('strong', {}, [tower.towerName]),
                el('div', { class: 'sub-id' }, [`Sector: ${tower.sector}`])
              ]),
              el('td', { class: 'mono-text' }, [tower.cellId]),
              el('td', { class: 'mono-text bold-text' }, [String(tower.totalPings)]),
              el('td', {}, [
                el('div', { class: 'dwell-bar-wrapper' }, [
                  el('div', { class: 'dwell-bar-fill', style: `width: ${tower.nightDwellScore}%;` }),
                  el('span', { class: 'dwell-text' }, [`${tower.nightDwellScore}%`])
                ])
              ]),
              el('td', { class: 'mono-text text-muted' }, [`${tower.lat.toFixed(4)}, ${tower.lng.toFixed(4)}`])
            ])))
          ])
        ])
      ])
    ]),

    el('div', { class: 'cdr-notice-col' }, [
      el('div', { class: 'cdr-notice-card' }, [
        el('div', { class: 'notice-card-header' }, [
          el('div', {}, [
            el('h3', { class: 'card-heading' }, ['Section 91 CrPC / Section 94 BNSS Legal Preservation Notice']),
            el('p', { class: 'card-subtext' }, [
              'Generate an official statutory evidence preservation requisition to Telecom Service Providers.'
            ])
          ]),
          el('div', { class: 'notice-header-actions' }, [
            el('button', {
              class: 'btn-secondary-sm',
              onclick: () => {
                navigator.clipboard.writeText(noticeText);
                showToast('Section 91 / 94 BNSS Preservation notice copied to clipboard!', 'success');
              }
            }, ['📋 Copy Notice']),
            el('button', {
              class: 'btn-primary-sm',
              onclick: () => {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`<pre style="font-family: monospace; padding: 24px; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(noticeText)}</pre>`);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
              }
            }, ['🖨️ Print / Save PDF'])
          ])
        ]),

        el('div', { class: 'notice-form-grid' }, [
          el('div', { class: 'form-group' }, [
            el('label', { class: 'field-label' }, ['Target MSISDN / Phone:']),
            el('input', {
              type: 'text',
              class: 'cdr-input',
              value: noticeFormState.targetNumber,
              oninput: (e) => {
                noticeFormState.targetNumber = e.target.value;
                notifyStateChange();
              }
            })
          ]),
          el('div', { class: 'form-group' }, [
            el('label', { class: 'field-label' }, ['Target Handset IMEI:']),
            el('input', {
              type: 'text',
              class: 'cdr-input',
              value: noticeFormState.imei,
              oninput: (e) => {
                noticeFormState.imei = e.target.value;
                notifyStateChange();
              }
            })
          ]),
          el('div', { class: 'form-group' }, [
            el('label', { class: 'field-label' }, ['Case FIR Ref Number:']),
            el('input', {
              type: 'text',
              class: 'cdr-input',
              value: noticeFormState.caseNumber,
              oninput: (e) => {
                noticeFormState.caseNumber = e.target.value;
                notifyStateChange();
              }
            })
          ]),
          el('div', { class: 'form-group' }, [
            el('label', { class: 'field-label' }, ['Telecom Service Provider (TSP):']),
            el('input', {
              type: 'text',
              class: 'cdr-input',
              value: noticeFormState.tspName,
              oninput: (e) => {
                noticeFormState.tspName = e.target.value;
                notifyStateChange();
              }
            })
          ])
        ]),

        el('div', { class: 'notice-preview-box' }, [
          el('pre', { class: 'notice-pre-content' }, [noticeText])
        ])
      ])
    ])
  ]);
}
