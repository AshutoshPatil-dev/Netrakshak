import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, firCases, recordAudit, notifyStateChange, openEntityProfile } from '../state.js';
import { showToast } from '../components/Toast.js';
import {
  SEED_SYNDICATES,
  buildIntelligenceIndex,
  generateTacticalLeads,
  searchIntelligence,
  processCopilotMessage,
  generateCaseExecutiveSummary
} from '../lib/aiEngine.js';

// Initialize AI analysis state if needed
if (!state.aiAnalysis) {
  state.aiAnalysis = {
    activeTab: 'copilot', // 'copilot', 'scanner', 'leads', 'summarizer'
    query: '+91 98811 55421',
    streamType: 'all',
    activeResult: null,
    leadsFilter: 'all', // 'all', 'urgent', 'high', 'medium'
    categoryFilter: 'all',
    selectedFirId: '',
    copilotMessages: [
      {
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### Netrakshak AI Crime Copilot Active
I am your specialized tactical intelligence assistant grounded in live FIR dossiers, CDR records, financial transaction trails, and syndicate linkage graphs.

**How I can assist your investigation:**
- **Suspect & Syndicate Profiling**: Inquire about any suspect name, alias, phone number, vehicle plate, or bank account.
- **Procedural Drafting**: Request formal *Section 91 CrPC Bank Freeze Notices* or *ANPR BOLO alerts*.
- **Interrogation Strategy**: Ask for tactical cross-examination points based on timeline and cell tower discrepancies.
- **Cross-Case Link Discovery**: Detect overlapping accused across police stations.

*Select a quick query below or type your investigation question.*`,
        actions: []
      }
    ],
    actionedLeadIds: new Set()
  };
}

if (!state.aiAnalysis.activeTab) state.aiAnalysis.activeTab = 'copilot';
if (!state.aiAnalysis.copilotMessages) state.aiAnalysis.copilotMessages = [];
if (!state.aiAnalysis.actionedLeadIds) state.aiAnalysis.actionedLeadIds = new Set();

export const sampleQueries = [
  { label: 'Phone: +91 98811 55421', query: '+91 98811 55421', type: 'phone', desc: 'Active suspect phone linked to cyber syndicate' },
  { label: 'Vehicle: MH-12-PQ-9081', query: 'MH-12-PQ-9081', type: 'vehicle', desc: 'White Swift linked to FC Road FIR' },
  { label: 'Bank: HDFC-50100492817291', query: 'HDFC-50100492817291', type: 'bank', desc: 'Layering mule account diverting INR 14.5L' },
  { label: 'Person: Sameer Khan', query: 'Sameer Khan', type: 'person', desc: 'Known syndicate operator with 3 aliases' },
  { label: 'Clean Test: +91 99999 00000', query: '+91 99999 00000', type: 'clean', desc: 'Unregistered clean number (no syndicate)' }
];

export const copilotSuggestions = [
  'Analyze Sameer Khan & ShadowFlow syndicate',
  'Draft Section 91 CrPC notice for HDFC mule account',
  'Give me interrogation strategy for Sameer Khan',
  'Show all high-risk bank accounts and money trails',
  'Summarize Swargate extortion and hawala ring',
  'Show all active syndicates and threat levels'
];

/**
 * Executes scanner query
 */
export function performAIAnalysis(queryText, streamType = 'all') {
  const q = (queryText || '').trim();
  if (!q) {
    showToast('Please enter an identifier, phone, vehicle, person or bank account.');
    return null;
  }

  const result = searchIntelligence(q, streamType);
  if (!result) return null;

  let formattedResult = null;
  if (result.found) {
    const syn = result.syndicate;
    formattedResult = {
      query: q,
      streamType,
      status: 'syndicate_detected',
      verdictTitle: `Intelligence Match: ${syn.name}`,
      threatLevel: syn.threat || 'HIGH',
      confidence: syn.confidence || 85,
      racketType: syn.type || 'Organized Syndicate',
      modusOperandi: syn.modusOperandi || '',
      nodes: syn.nodes || [],
      firs: syn.firs || [],
      cdrEvidence: syn.cdrEvidence || null,
      financialTrail: syn.financialTrail || [],
      actions: syn.actions || [],
      timestamp: new Date().toLocaleString()
    };
  } else {
    formattedResult = {
      query: q,
      streamType,
      status: 'clean',
      verdictTitle: 'No Active Organized Syndicates or Overlaps Found',
      threatLevel: 'CLEAN',
      confidence: 10,
      racketType: 'Isolated Identifier / No Cross-Case Overlap',
      modusOperandi: result.message,
      nodes: [
        { name: q, role: 'Queried Subject / Identifier', category: 'unknown', risk: 'low', link: 'Zero co-conspirator or cross-case linkages detected.' }
      ],
      firs: [],
      cdrEvidence: null,
      financialTrail: [],
      actions: [
        { id: 'act_clean1', title: 'Continuous Watchlist Monitoring', desc: 'No coercive action required. Identifier logged for passive anomaly monitoring.', priority: 'medium', category: 'legal' }
      ],
      timestamp: new Date().toLocaleString()
    };
  }

  state.aiAnalysis.activeResult = formattedResult;
  recordAudit('AI Linkage Analysis', `AI pattern scan executed for query "${q}" (Verdict: ${formattedResult.threatLevel} - ${formattedResult.racketType}).`, formattedResult.threatLevel === 'CRITICAL' ? 'critical' : 'info', 'analysis').catch(() => {});

  return formattedResult;
}

/**
 * Main View Renderer
 */
export function renderAIAnalysis(c) {
  const container = c || document.querySelector('main.content');
  if (container) container.innerHTML = '';

  const index = buildIntelligenceIndex();
  const leads = generateTacticalLeads();

  // 1. Page Heading (Consistent with AppShell & Dashboard style)
  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['INTELLIGENCE & INVESTIGATION WORKSPACE']),
      el('h1', {}, ['AI Crime Intelligence & Tactical Command']),
      el('p', { class: 'muted' }, [
        'Multi-source intelligence fusion across FIR cases, CDR telecommunication towers, financial layering trails, and tactical CrPC actions.'
      ])
    ]),
    el('div', { class: 'header-actions', style: 'display: flex; gap: 8px;' }, [
      el('button', {
        class: 'btn-secondary',
        onclick: () => {
          const exportText = generateFullExportReport(index, leads);
          const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Netrakshak_AI_Intelligence_Docket_${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('✓ AI Intelligence Dossier exported successfully.');
        }
      }, [icon('file'), ' Export Intelligence Docket'])
    ])
  ]);

  // 2. Metric Telemetry Cards (Matching Dashboard style)
  const metricsRow = el('div', { class: 'metric-grid' }, [
    el('div', { class: 'metric-card' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['AI Engine Status']),
        el('span', { class: 'ai-live-indicator' }, [
          el('span', { class: 'dot-live' }),
          ' Active'
        ])
      ]),
      el('strong', { class: 'metric-value', style: 'font-size: 20px;' }, ['Netrakshak V2']),
      el('span', { class: 'metric-foot' }, ['Proprietary law enforcement model'])
    ]),
    el('div', { class: 'metric-card' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Monitored Syndicates']),
        el('span', { class: 'metric-spark' }, [icon('shield')])
      ]),
      el('strong', { class: 'metric-value' }, [String(index.syndicates.length)]),
      el('span', { class: 'metric-foot' }, ['ShadowFlow & Swargate rings'])
    ]),
    el('div', { class: 'metric-card' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Indexed Entities']),
        el('span', { class: 'metric-spark' }, [icon('user')])
      ]),
      el('strong', { class: 'metric-value' }, [String(index.entities.length)]),
      el('span', { class: 'metric-foot' }, ['Suspects, phones, accounts, vehicles'])
    ]),
    el('div', { class: 'metric-card' }, [
      el('div', { class: 'metric-top' }, [
        el('span', { class: 'metric-label' }, ['Tactical Leads']),
        el('span', { class: 'metric-spark red' }, [icon('alert')])
      ]),
      el('strong', { class: 'metric-value', style: 'color: var(--app-high, #DC2626);' }, [String(leads.length)]),
      el('span', { class: 'metric-foot' }, ['Requires officer procedural action'])
    ])
  ]);

  // 3. Sub-Navigation Tabs
  const currentTab = state.aiAnalysis.activeTab || 'copilot';
  const navTabs = el('div', { class: 'ai-subnav-tabs' }, [
    el('button', {
      class: `ai-tab-btn ${currentTab === 'copilot' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'copilot';
        renderAIAnalysis(container);
      }
    }, [icon('sparkle'), el('span', {}, ['Tactical Copilot (Chat & Q&A)'])]),
    el('button', {
      class: `ai-tab-btn ${currentTab === 'scanner' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'scanner';
        renderAIAnalysis(container);
      }
    }, [icon('pulse'), el('span', {}, ['Linkage Scanner (Deep-Dive)'])]),
    el('button', {
      class: `ai-tab-btn ${currentTab === 'leads' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'leads';
        renderAIAnalysis(container);
      }
    }, [
      icon('grid'),
      el('span', {}, ['Tactical Leads & CrPC Actions']),
      el('span', { class: 'tab-badge' }, [String(leads.length)])
    ]),
    el('button', {
      class: `ai-tab-btn ${currentTab === 'summarizer' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'summarizer';
        renderAIAnalysis(container);
      }
    }, [icon('file'), el('span', {}, ['Case & Dossier Summarizer'])])
  ]);

  // 4. Content Area
  let tabContent = null;
  if (currentTab === 'copilot') {
    tabContent = renderCopilotTab();
  } else if (currentTab === 'scanner') {
    tabContent = renderScannerTab();
  } else if (currentTab === 'leads') {
    tabContent = renderLeadsTab(leads);
  } else if (currentTab === 'summarizer') {
    tabContent = renderSummarizerTab(index);
  }

  const mainLayout = el('div', { class: 'ai-analysis-container' }, [
    header,
    metricsRow,
    navTabs,
    tabContent
  ]);

  if (container) {
    container.append(mainLayout);
  }

  return mainLayout;
}

/**
 * Tab 1: Tactical AI Copilot (Interactive Chat & Q&A)
 */
function renderCopilotTab() {
  const chatMessages = el('div', { class: 'copilot-chat-feed', id: 'copilot-chat-feed' });

  function renderMessages() {
    chatMessages.innerHTML = '';
    state.aiAnalysis.copilotMessages.forEach(msg => {
      const isUser = msg.sender === 'user';
      const bubble = el('div', { class: `copilot-msg-row ${isUser ? 'user-row' : 'ai-row'}` }, [
        el('div', { class: 'msg-avatar' }, [
          isUser ? icon('user') : icon('sparkle')
        ]),
        el('div', { class: 'msg-content-box' }, [
          el('div', { class: 'msg-header' }, [
            el('strong', { class: 'msg-author' }, [isUser ? 'Investigating Officer' : 'Netrakshak AI Copilot']),
            el('span', { class: 'msg-time' }, [msg.time || ''])
          ]),
          el('div', { class: 'msg-body markdown-rendered' }, [formatMarkdownToDom(msg.text)]),
          msg.actions && msg.actions.length > 0 ? el('div', { class: 'msg-actions-tray' }, [
            el('div', { class: 'msg-actions-title' }, ['Recommended Action Triggers:']),
            ...msg.actions.map(act => el('button', {
              class: 'btn-action-trigger',
              onclick: () => {
                if (act.title.toLowerCase().includes('notice') || act.title.toLowerCase().includes('freeze')) {
                  const noticeText = getSection91NoticeText();
                  navigator.clipboard.writeText(noticeText).then(() => {
                    showToast('✓ Formal Section 91 CrPC Notice copied to clipboard!');
                  }).catch(() => {
                    showToast('Notice drafted in console.');
                  });
                } else if (act.category === 'mobility' || act.title.toLowerCase().includes('anpr')) {
                  showToast('✓ ANPR BOLO Broadcast issued across Maharashtra traffic grid.');
                } else {
                  showToast(`✓ Action initiated: ${act.title}`);
                }
              }
            }, [icon('check'), ` ${act.title}`]))
          ]) : null
        ])
      ]);
      chatMessages.appendChild(bubble);
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }

  renderMessages();

  // Chat Input Box
  const inputEl = el('textarea', {
    class: 'copilot-input-field',
    placeholder: 'Ask Netrakshak AI Copilot about suspects, phone towers, bank trails, interrogation points, or CrPC legal drafting...',
    rows: '2'
  });

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';

    // Add user message
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.aiAnalysis.copilotMessages.push({
      sender: 'user',
      time: timeStr,
      text
    });

    renderMessages();

    // Show simulated AI thinking
    const thinkingRow = el('div', { class: 'copilot-msg-row ai-row typing-row' }, [
      el('div', { class: 'msg-avatar' }, [icon('sparkle')]),
      el('div', { class: 'msg-content-box' }, [
        el('div', { class: 'typing-indicator' }, [
          el('span', {}),
          el('span', {}),
          el('span', {}),
          el('em', {}, [' Synthesizing criminal intelligence records...'])
        ])
      ])
    ]);
    chatMessages.appendChild(thinkingRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const response = processCopilotMessage(text, state.aiAnalysis.copilotMessages);
      state.aiAnalysis.copilotMessages.push({
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.text,
        actions: response.actions
      });
      renderMessages();
      recordAudit('AI Copilot Inquiry', `Investigator query: "${text}"`, 'info', 'copilot').catch(() => {});
    }, 450);
  }

  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendBtn = el('button', {
    class: 'primary-btn copilot-send-btn',
    onclick: handleSend
  }, [icon('sparkle'), ' Send Query']);

  const clearBtn = el('button', {
    class: 'btn-secondary btn-sm',
    onclick: () => {
      state.aiAnalysis.copilotMessages = [
        {
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Conversation cleared. Netrakshak AI Copilot ready for fresh investigation inquiries.',
          actions: []
        }
      ];
      renderMessages();
      showToast('Conversation history reset.');
    }
  }, [icon('reset'), ' Clear Chat']);

  // Quick Suggestion Chips
  const suggestionsBox = el('div', { class: 'copilot-suggestions-bar' }, [
    el('span', { class: 'suggestions-label' }, ['Recommended Inquiries:']),
    ...copilotSuggestions.map(s => el('button', {
      class: 'copilot-suggest-chip',
      onclick: () => {
        inputEl.value = s;
        handleSend();
      }
    }, [s]))
  ]);

  const inputContainer = el('div', { class: 'copilot-input-container' }, [
    suggestionsBox,
    el('div', { class: 'copilot-input-row' }, [
      inputEl,
      el('div', { class: 'copilot-btn-group' }, [
        sendBtn,
        clearBtn
      ])
    ])
  ]);

  return el('div', { class: 'panel copilot-workspace-panel' }, [
    chatMessages,
    inputContainer
  ]);
}

/**
 * Tab 2: Linkage Scanner (Deep-Dive Search)
 */
function renderScannerTab() {
  if (!state.aiAnalysis.activeResult && state.aiAnalysis.query) {
    performAIAnalysis(state.aiAnalysis.query, state.aiAnalysis.streamType);
  }
  const activeResult = state.aiAnalysis.activeResult;

  const searchInput = el('input', {
    type: 'text',
    class: 'ai-search-input',
    placeholder: t('aiSearchPlaceholder'),
    value: state.aiAnalysis.query || ''
  });

  const streamSelect = el('select', { class: 'ai-stream-select' }, [
    el('option', { value: 'all', selected: state.aiAnalysis.streamType === 'all' }, [t('allIntelligenceStreams')]),
    el('option', { value: 'phone', selected: state.aiAnalysis.streamType === 'phone' }, [t('phoneCDRTriangulation')]),
    el('option', { value: 'vehicle', selected: state.aiAnalysis.streamType === 'vehicle' }, [t('vehicleMobility')]),
    el('option', { value: 'bank', selected: state.aiAnalysis.streamType === 'bank' }, [t('bankMuleAccounts')]),
    el('option', { value: 'person', selected: state.aiAnalysis.streamType === 'person' }, [t('personSuspectAliases')]),
    el('option', { value: 'narrative', selected: state.aiAnalysis.streamType === 'narrative' }, [t('unstructuredLeadNarrative')])
  ]);

  const searchBtn = el('button', {
    class: 'primary-btn ai-analyze-btn',
    onclick: () => {
      const q = searchInput.value.trim();
      state.aiAnalysis.query = q;
      state.aiAnalysis.streamType = streamSelect.value;
      performAIAnalysis(q, streamSelect.value);
      notifyStateChange();
    }
  }, [
    icon('sparkle'),
    el('span', {}, [t('runAILinkageScan')])
  ]);

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') searchBtn.click();
  };

  const sampleChips = el('div', { class: 'ai-sample-chips' }, [
    el('span', { class: 'chips-label' }, [t('quickScanPresets')]),
    ...sampleQueries.map(sq => {
      let iconName = 'sparkle';
      if (sq.type === 'phone') iconName = 'pulse';
      if (sq.type === 'vehicle') iconName = 'grid';
      if (sq.type === 'bank') iconName = 'database';
      if (sq.type === 'person') iconName = 'user';
      if (sq.type === 'clean') iconName = 'check';

      return el('button', {
        class: `ai-sample-chip ${state.aiAnalysis.query === sq.query ? 'active' : ''}`,
        title: sq.desc,
        onclick: () => {
          searchInput.value = sq.query;
          state.aiAnalysis.query = sq.query;
          state.aiAnalysis.streamType = 'all';
          streamSelect.value = 'all';
          performAIAnalysis(sq.query, 'all');
          notifyStateChange();
        }
      }, [icon(iconName), el('span', {}, [sq.label])]);
    })
  ]);

  const searchBox = el('div', { class: 'panel ai-search-card' }, [
    el('div', { class: 'ai-search-top' }, [
      searchInput,
      streamSelect,
      searchBtn
    ]),
    sampleChips
  ]);

  let resultView = null;
  if (activeResult) {
    const isCritical = activeResult.threatLevel === 'CRITICAL';
    const isHigh = activeResult.threatLevel === 'HIGH' || activeResult.threatLevel === 'ELEVATED';
    const bannerClass = isCritical ? 'verdict-critical' : (isHigh ? 'verdict-elevated' : 'verdict-clean');

    const verdictCard = el('div', { class: `ai-verdict-card ${bannerClass}` }, [
      el('div', { class: 'verdict-header' }, [
        el('div', { class: 'verdict-title-box' }, [
          el('div', { class: 'verdict-badge-row' }, [
            el('span', { class: `threat-tag threat-${activeResult.threatLevel.toLowerCase()}` }, [`RISK RATING: ${activeResult.threatLevel}`]),
            el('span', { class: 'confidence-tag' }, [`Match Confidence: ${activeResult.confidence}%`]),
            el('span', { class: 'racket-tag' }, [activeResult.racketType])
          ]),
          el('h2', { class: 'verdict-title' }, [activeResult.verdictTitle])
        ]),
        el('div', { class: 'verdict-gauge' }, [
          el('div', { class: 'gauge-val' }, [`${activeResult.confidence}%`]),
          el('div', { class: 'gauge-label' }, ['Pattern Probability'])
        ])
      ]),
      el('div', { class: 'verdict-narrative' }, [
        el('strong', {}, ['Modus Operandi & Syndicate Pattern: ']),
        el('span', {}, [activeResult.modusOperandi])
      ])
    ]);

    const nodesSection = el('div', { class: 'panel ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Discovered Co-Conspirators & Multi-Hop Linkages (', String(activeResult.nodes.length), ')']),
        el('span', { class: 'muted' }, ['Correlated across CDR towers, FIRs, bank transfers, and suspect records'])
      ]),
      el('div', { class: 'ai-nodes-grid' }, activeResult.nodes.map(n => {
        let catIcon = 'user';
        if (n.category === 'phone') catIcon = 'pulse';
        if (n.category === 'vehicle') catIcon = 'grid';
        if (n.category === 'bank') catIcon = 'database';
        if (n.category === 'fir') catIcon = 'file';

        return el('div', { class: `ai-node-card risk-${n.risk || 'low'}` }, [
          el('div', { class: 'node-card-top' }, [
            el('div', { class: 'node-icon-box' }, [icon(catIcon)]),
            el('div', { class: 'node-info' }, [
              el('strong', { class: 'node-name' }, [n.name]),
              el('span', { class: 'node-role' }, [n.role])
            ]),
            el('span', { class: `node-risk-pill ${n.risk || 'low'}` }, [(n.risk || 'LOW').toUpperCase()])
          ]),
          el('div', { class: 'node-link-desc' }, [
            el('span', { class: 'link-arrow' }, ['↳ ']),
            el('span', {}, [n.link])
          ])
        ]);
      }))
    ]);

    const firsSection = activeResult.firs.length > 0 ? el('div', { class: 'panel ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Cross-District FIR Matches & Charge-Sheet Overlaps (', String(activeResult.firs.length), ')']),
        el('span', { class: 'muted' }, ['Common accused, modus operandi, and seized property'])
      ]),
      el('div', { class: 'ai-firs-list' }, activeResult.firs.map(f => el('div', { class: 'ai-fir-item' }, [
        el('div', { class: 'fir-badge' }, [icon('file'), el('strong', {}, [f.firNo])]),
        el('div', { class: 'fir-details' }, [
          el('div', { class: 'fir-ps' }, [f.station]),
          el('div', { class: 'fir-sections' }, [f.sections]),
          el('div', { class: 'fir-meta' }, [`Date: ${f.date} · Status: ${f.status}`])
        ]),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.view = 'fir';
            notifyStateChange();
            showToast(`Opened FIR View for case ${f.firNo}`);
          }
        }, ['View Case Dossier →'])
      ])))
    ]) : null;

    const cdrSection = activeResult.cdrEvidence ? el('div', { class: 'panel ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['CDR Telecommunications & Tower Triangulation']),
        el('span', { class: 'muted' }, ['Call frequency, nocturnal activity, and co-location tower matches'])
      ]),
      el('div', { class: 'cdr-stats-grid' }, [
        el('div', { class: 'cdr-stat-box' }, [
          el('span', { class: 'stat-label' }, ['Total Correlated Calls']),
          el('strong', { class: 'stat-val' }, [String(activeResult.cdrEvidence.totalCalls)]),
          el('span', { class: 'stat-sub' }, ['Across identified burner cluster'])
        ]),
        el('div', { class: 'cdr-stat-box' }, [
          el('span', { class: 'stat-label' }, ['Nocturnal / Suspicious Calls']),
          el('strong', { class: 'stat-val red' }, [String(activeResult.cdrEvidence.suspiciousNightCalls)]),
          el('span', { class: 'stat-sub' }, ['Between 23:00 and 04:30 IST'])
        ]),
        el('div', { class: 'cdr-stat-box wide' }, [
          el('span', { class: 'stat-label' }, ['Dominant Cell Tower Sector']),
          el('strong', { class: 'stat-val blue' }, [activeResult.cdrEvidence.commonTower]),
          el('span', { class: 'stat-sub' }, [`IMEI Overlap: ${activeResult.cdrEvidence.imeiOverlap}`])
        ])
      ])
    ]) : null;

    const finSection = activeResult.financialTrail.length > 0 ? el('div', { class: 'panel ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Financial Layering Trail & Mule Route']),
        el('span', { class: 'muted' }, ['Tracing fraud fund dissipation across intermediary bank accounts and ATM cash-outs'])
      ]),
      el('div', { class: 'financial-trail-chain' }, activeResult.financialTrail.map((ft) => el('div', { class: 'fin-step-card' }, [
        el('div', { class: 'fin-step-num' }, [`0${ft.step}`]),
        el('div', { class: 'fin-step-body' }, [
          el('div', { class: 'fin-flow' }, [
            el('span', { class: 'fin-from' }, [ft.flow]),
            el('span', { class: 'fin-arrow' }, [' → ']),
            el('span', { class: 'fin-to' }, [ft.target])
          ]),
          el('div', { class: 'fin-note' }, [ft.note])
        ]),
        el('div', { class: 'fin-amount' }, [ft.amount])
      ])))
    ]) : null;

    const actionsSection = el('div', { class: 'panel ai-section-panel' }, [
      el('div', { class: 'panel-head' }, [
        el('h3', {}, ['Recommended Law Enforcement Action Steps']),
        el('span', { class: 'muted' }, ['Standard Operating Procedures (SOP) based on discovered pattern and threat level'])
      ]),
      el('div', { class: 'actions-list' }, activeResult.actions.map(act => el('div', { class: `action-item priority-${act.priority}` }, [
        el('div', { class: 'action-priority-badge' }, [act.priority.toUpperCase()]),
        el('div', { class: 'action-main' }, [
          el('strong', { class: 'action-title' }, [act.title]),
          el('p', { class: 'action-desc' }, [act.desc])
        ]),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            showToast(`✓ Action initiated: ${act.title}`);
            recordAudit('Investigative Action Initiated', `Officer initiated: ${act.title} for query ${activeResult.query}`, 'info', 'action').catch(() => {});
          }
        }, ['Initiate SOP →'])
      ])))
    ]);

    resultView = el('div', { class: 'ai-results-wrapper' }, [
      verdictCard,
      nodesSection,
      cdrSection,
      finSection,
      firsSection,
      actionsSection
    ]);
  } else {
    resultView = el('div', { class: 'panel ai-empty-state' }, [
      el('div', { class: 'empty-icon-box' }, [icon('sparkle')]),
      el('h3', {}, ['Ready for AI Linkage & Pattern Analysis']),
      el('p', {}, ['Enter any identifier above (phone, vehicle plate, bank account, person name) or click a quick preset to analyze cross-case syndicates.'])
    ]);
  }

  return el('div', { class: 'scanner-workspace-panel' }, [
    searchBox,
    resultView
  ]);
}

/**
 * Tab 3: Tactical Leads & CrPC Actions Board
 */
function renderLeadsTab(leads) {
  const currentFilter = state.aiAnalysis.leadsFilter || 'all';

  const filterChips = el('div', { class: 'leads-filter-bar' }, [
    el('span', { class: 'filter-bar-label' }, ['Urgency Filter:']),
    ...['all', 'urgent', 'high', 'medium'].map(f => el('button', {
      class: `filter-chip-btn ${currentFilter === f ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.leadsFilter = f;
        renderAIAnalysis();
      }
    }, [f.toUpperCase()]))
  ]);

  const filteredLeads = leads.filter(lead => {
    if (currentFilter !== 'all' && lead.priority !== currentFilter) return false;
    return true;
  });

  const leadsGrid = el('div', { class: 'leads-action-grid' }, filteredLeads.map(lead => {
    const isActioned = state.aiAnalysis.actionedLeadIds.has(lead.id);

    return el('div', { class: `lead-card priority-${lead.priority} ${isActioned ? 'actioned' : ''}` }, [
      el('div', { class: 'lead-card-header' }, [
        el('div', { class: 'lead-badge-group' }, [
          el('span', { class: `lead-urgency-tag ${lead.priority}` }, [lead.priority.toUpperCase()]),
          el('span', { class: 'lead-category-tag' }, [lead.category.toUpperCase()]),
          el('span', { class: 'lead-syndicate-tag' }, [lead.syndicateName])
        ]),
        isActioned ? el('span', { class: 'actioned-pill' }, ['✓ COMPLETED']) : null
      ]),
      el('h3', { class: 'lead-title' }, [lead.title]),
      el('p', { class: 'lead-desc' }, [lead.desc]),
      lead.firList && lead.firList.length > 0 ? el('div', { class: 'lead-firs-row' }, [
        el('span', { class: 'fir-label' }, ['Linked FIRs: ']),
        ...lead.firList.map(f => el('span', { class: 'fir-code-tag' }, [f]))
      ]) : null,
      el('div', { class: 'lead-card-footer' }, [
        el('button', {
          class: 'primary-btn small',
          onclick: () => {
            if (lead.category === 'banking' || lead.title.toLowerCase().includes('notice')) {
              const noticeText = getSection91NoticeText();
              navigator.clipboard.writeText(noticeText).then(() => {
                showToast('✓ Formal Section 91 CrPC Notice copied to clipboard!');
              }).catch(() => {
                showToast('Notice prepared.');
              });
            } else if (lead.category === 'mobility') {
              showToast('✓ ANPR Camera Watchlist updated with BOLO alert.');
            } else {
              showToast(`✓ Procedural action executed: ${lead.title}`);
            }
            state.aiAnalysis.actionedLeadIds.add(lead.id);
            renderAIAnalysis();
          }
        }, [icon('check'), isActioned ? ' Re-send Order' : ' Execute SOP Action']),
        el('button', {
          class: 'btn-secondary small',
          onclick: () => {
            state.view = 'network';
            notifyStateChange();
            showToast('Navigated to Tactical Network Graph.');
          }
        }, [icon('grid'), ' View in Graph'])
      ])
    ]);
  }));

  return el('div', { class: 'leads-workspace-panel' }, [
    filterChips,
    leadsGrid
  ]);
}

/**
 * Tab 4: FIR & Case Dossier Executive Summarizer
 */
function renderSummarizerTab(index) {
  const cases = index.cases;
  const selectedFir = state.aiAnalysis.selectedFirId || (cases[0]?.firNumber || cases[0]?.fir_number || '');

  const selectEl = el('select', {
    class: 'case-picker-select',
    onchange: (e) => {
      state.aiAnalysis.selectedFirId = e.target.value;
      renderAIAnalysis();
    }
  }, cases.map(c => {
    const num = c.firNumber || c.fir_number || 'FIR';
    const subj = c.subjectName || c.subject_name || 'Accused';
    return el('option', { value: num, selected: num === selectedFir }, [`${num} - ${subj} (${c.policeStation || c.police_station || 'PS'})`]);
  }));

  const summary = generateCaseExecutiveSummary(selectedFir);

  const summaryCard = el('div', { class: 'panel case-executive-summary-card' }, [
    el('div', { class: 'summary-header' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow red' }, ['EXECUTIVE INTELLIGENCE DOSSIER']),
        el('h2', {}, [summary.title]),
        el('div', { class: 'summary-meta' }, [
          el('span', {}, [`Police Station: ${summary.policeStation}`]),
          el('span', {}, [`Accused: ${summary.accused}`]),
          el('span', {}, [`Sections: ${summary.sections}`])
        ])
      ]),
      el('div', { class: 'summary-badge-box' }, [
        el('span', { class: 'threat-tag threat-high' }, [`THREAT: ${summary.threatLevel}`])
      ])
    ]),
    el('div', { class: 'summary-body-section' }, [
      el('h4', {}, ['Incident Synopsis & Modus Operandi']),
      el('p', {}, [summary.synopsis])
    ]),
    el('div', { class: 'summary-body-section' }, [
      el('h4', {}, ['Recommended Bharatiya Nyaya Sanhita (BNS) Legal Mapping']),
      el('p', { class: 'bns-box' }, [summary.recommendedBNSSections])
    ]),
    el('div', { class: 'summary-body-section' }, [
      el('h4', {}, ['Tactical Investigation SOP Checklist']),
      el('ul', { class: 'sop-checklist' }, summary.actionChecklist.map(item => el('li', {}, [
        icon('check'),
        el('span', {}, [` ${item}`])
      ])))
    ]),
    el('div', { class: 'summary-footer' }, [
      el('button', {
        class: 'primary-btn small',
        onclick: () => {
          const exportText = `NETRAKSHAK EXECUTIVE CASE BRIEF\n\nTitle: ${summary.title}\nPolice Station: ${summary.policeStation}\nAccused: ${summary.accused}\nSections: ${summary.sections}\nBNS Legal Mapping: ${summary.recommendedBNSSections}\n\nSynopsis:\n${summary.synopsis}\n\nAction Checklist:\n${summary.actionChecklist.map(a => `[ ] ${a}`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
          const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Case_Summary_${selectedFir.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('✓ Case Executive Summary exported.');
        }
      }, [icon('file'), ' Export Case Summary']),
      el('button', {
        class: 'btn-secondary small',
        onclick: () => {
          state.view = 'fir';
          notifyStateChange();
        }
      }, ['Open FIR Management →'])
    ])
  ]);

  return el('div', { class: 'summarizer-workspace-panel' }, [
    el('div', { class: 'case-picker-bar' }, [
      el('label', { class: 'picker-label' }, ['Select FIR Case for Executive Intelligence Breakdown:']),
      selectEl
    ]),
    summaryCard
  ]);
}

/**
 * Helper: Converts markdown-like text to DOM nodes
 */
function formatMarkdownToDom(text) {
  const lines = (text || '').split('\n');
  const frag = document.createDocumentFragment();

  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const pre = el('pre', { class: 'code-block' }, [
          el('code', {}, [codeBuffer.join('\n')])
        ]);
        frag.appendChild(pre);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith('### ')) {
      frag.appendChild(el('h3', { class: 'md-h3' }, [line.replace('### ', '')]));
    } else if (line.startsWith('#### ')) {
      frag.appendChild(el('h4', { class: 'md-h4' }, [line.replace('#### ', '')]));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const item = el('div', { class: 'md-list-item' }, [
        el('span', { class: 'bullet' }, ['• ']),
        renderInlineFormatting(line.substring(2))
      ]);
      frag.appendChild(item);
    } else if (line.match(/^\d+\.\s/)) {
      const numMatch = line.match(/^(\d+\.)\s(.*)$/);
      const item = el('div', { class: 'md-list-item' }, [
        el('strong', { class: 'list-num' }, [numMatch[1] + ' ']),
        renderInlineFormatting(numMatch[2])
      ]);
      frag.appendChild(item);
    } else if (line.trim() === '') {
      frag.appendChild(el('div', { style: 'height: 6px;' }));
    } else {
      frag.appendChild(el('p', { class: 'md-p' }, [renderInlineFormatting(line)]));
    }
  });

  return frag;
}

function renderInlineFormatting(raw) {
  const span = document.createElement('span');
  let text = raw;

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  span.innerHTML = text;
  return span;
}

function getSection91NoticeText() {
  return `OFFICE OF THE INVESTIGATING OFFICER
CYBER CRIME POLICE STATION, PUNE CITY
NOTICE UNDER SECTION 91 CODE OF CRIMINAL PROCEDURE (CrPC) / BNS EQUIVALENT

To:
The Nodal Officer / Fraud Risk Management (FRM)
HDFC Bank Ltd. / ICICI Bank Ltd. / Bank of Maharashtra

Subject: Immediate Lien / Freeze on Fraudulent Account No: 50100492817291 & BOM-60129948102
Ref: Investigation in FIR No. FIR-MH-2026-4821 u/s 420, 468, 471 IPC & Sec 66D IT Act

Whereas it has been made to appear to me that an offense of Cyber Fraud / Financial Extortion has been committed, you are hereby directed to:
1. Immediately place total debit-freeze / lien on the aforementioned account(s).
2. Furnish complete Account Opening Forms (AOF), KYC documents, IP login logs, and statement of accounts from 01-01-2026 to date within 24 hours.
3. Reversal of fraudulent proceeds of INR 14,50,000 to the cyber escrow holding account.

Failure to comply shall attract penal action under Section 175/176 IPC.

(Investigating Officer)
Cyber Crime Police Station, Pune`;
}

function generateFullExportReport(index, leads) {
  return `=====================================================
NETRAKSHAK · CRIMINAL NETWORK COMMAND
AI CRIME INTELLIGENCE & TACTICAL DOCKET
Generated: ${new Date().toLocaleString()}
=====================================================

1. EXECUTIVE SUMMARY
- Monitored Syndicates: ${index.syndicates.length}
- Indexed Suspect Entities: ${index.entities.length}
- Active FIR Dossiers: ${index.cases.length}
- High-Priority Tactical Leads: ${leads.length}

2. MONITORED SYNDICATES & THREAT RATINGS
${index.syndicates.map(s => `
[${s.threat}] ${s.name} (Confidence: ${s.confidence}%)
- Type: ${s.type}
- Lead Officer: ${s.leadOfficer}
- Modus Operandi: ${s.modusOperandi}
- Linked FIRs: ${s.firs.map(f => f.firNo).join(', ')}
`).join('\n')}

3. PRIORITY TACTICAL LEADS & CrPC ACTION ORDERS
${leads.map((l, idx) => `
[Lead #${idx + 1}] ${l.title} (${l.priority.toUpperCase()} - ${l.category.toUpperCase()})
- Syndicate: ${l.syndicateName}
- Description: ${l.desc}
- Linked FIRs: ${l.firList ? l.firList.join(', ') : 'None'}
`).join('\n')}

4. EVIDENCE INTEGRITY & CHAIN OF CUSTODY
- Cryptographic Engine: Web Crypto SHA-256
- Database Backend: PostgreSQL 15+ with Row Level Security (RLS)
=====================================================
CONFIDENTIAL · FOR LAW ENFORCEMENT USE ONLY
`;
}
