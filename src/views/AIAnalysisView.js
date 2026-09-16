import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, entities, edges, firCases, recordAudit, notifyStateChange, openEntityProfile } from '../state.js';
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
        text: `### Netrakshak AI Intelligence Active
I am your specialized criminal intelligence assistant grounded in live FIR dossiers, CDR records, financial transaction trails, and syndicate linkage graphs.

**How I can assist your investigation:**
- **Suspect & Syndicate Profiling**: Inquire about any suspect name, alias, phone number, vehicle plate, or bank account.
- **Procedural Drafting**: Request formal *Section 91 CrPC Bank Freeze Notices* or *ANPR BOLO alerts*.
- **Interrogation Strategy**: Ask for tactical cross-examination points based on timeline and cell tower discrepancies.
- **Cross-Case Link Discovery**: Detect overlapping accused across police stations.

*Type your question below or click a quick inquiry from the right panel.*`,
        actions: []
      }
    ],
    actionedLeadIds: new Set()
  };
}

if (!state.aiAnalysis.activeTab) state.aiAnalysis.activeTab = 'copilot';
if (!state.aiAnalysis.copilotMessages) state.aiAnalysis.copilotMessages = [];
if (!state.aiAnalysis.actionedLeadIds) state.aiAnalysis.actionedLeadIds = new Set();

export const copilotSuggestions = [
  'Analyze Sameer Khan & ShadowFlow syndicate',
  'Draft Section 91 CrPC notice for HDFC mule account',
  'Give me interrogation strategy for Sameer Khan',
  'Show all high-risk bank accounts and money trails',
  'Summarize Swargate extortion and hawala ring',
  'Show all active syndicates and threat levels'
];

/**
 * Executes scanner query directly against live database
 */
export function performAIAnalysis(queryText, streamType = 'all') {
  const q = (queryText || '').trim();
  if (!q) {
    showToast('Please enter an identifier, phone, vehicle, person or bank account.');
    return null;
  }

  const result = searchIntelligence(q, streamType);
  if (!result) return null;

  state.aiAnalysis.activeResult = result;
  recordAudit('AI Intelligence Search', `Cross-record query executed for "${q}"`, 'info', 'analysis').catch(() => {});

  return result;
}

/**
 * Main View Renderer
 */
export function renderAIAnalysis(c) {
  const container = c || document.querySelector('main.content');
  if (container) container.innerHTML = '';

  const index = buildIntelligenceIndex();
  const leads = generateTacticalLeads();
  const currentTab = state.aiAnalysis.activeTab || 'copilot';

  // 1. Clean, Minimalist Header
  const header = el('div', { class: 'page-heading compact ai-header-row' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['INTELLIGENCE & INVESTIGATION WORKSPACE']),
      el('h1', { class: 'ai-view-title' }, ['Netrakshak AI Intelligence']),
      el('p', { class: 'muted ai-view-sub' }, [
        'Multi-source data fusion across FIR dossiers, CDR telecommunications, financial layering, and tactical CrPC actions.'
      ])
    ]),
    el('div', { class: 'header-actions', style: 'display: flex; gap: 8px;' }, [
      el('button', {
        class: 'btn-secondary btn-sm',
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

  // 2. Sub-Navigation Tabs
  const navTabs = el('div', { class: 'ai-subnav-tabs' }, [
    el('button', {
      class: `ai-tab-btn ${currentTab === 'copilot' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'copilot';
        renderAIAnalysis(container);
      }
    }, [icon('sparkle'), el('span', {}, ['Netrakshak AI'])]),
    el('button', {
      class: `ai-tab-btn ${currentTab === 'scanner' ? 'active' : ''}`,
      onclick: () => {
        state.aiAnalysis.activeTab = 'scanner';
        renderAIAnalysis(container);
      }
    }, [icon('search'), el('span', {}, ['Cross-Record Intelligence Search'])]),
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

  // 3. Content Area
  let tabContent = null;
  if (currentTab === 'copilot') {
    tabContent = renderCopilotTab(index, leads);
  } else if (currentTab === 'scanner') {
    tabContent = renderScannerTab(index);
  } else if (currentTab === 'leads') {
    tabContent = renderLeadsTab(leads);
  } else if (currentTab === 'summarizer') {
    tabContent = renderSummarizerTab(index);
  }

  const mainLayout = el('div', { class: 'ai-analysis-container' }, [
    header,
    navTabs,
    tabContent
  ]);

  if (container) {
    container.append(mainLayout);
  }

  return mainLayout;
}

/**
 * Tab 1: Netrakshak AI (Zero-Scroll 2-Column Chat)
 */
function renderCopilotTab(index, leads) {
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
            el('strong', { class: 'msg-author' }, [isUser ? 'Investigating Officer' : 'Netrakshak AI']),
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
    }, 40);
  }

  renderMessages();

  // Chat Input Box
  const inputEl = el('textarea', {
    class: 'copilot-input-field',
    placeholder: 'Ask Netrakshak AI about suspects, phone towers, bank trails, interrogation points, or CrPC drafting...',
    rows: '1'
  });

  function handleSend(overrideQuery) {
    const text = (overrideQuery || inputEl.value).trim();
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
          el('em', {}, [' Analyzing criminal records...'])
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
      recordAudit('AI Inquiry', `Investigator query: "${text}"`, 'info', 'ai').catch(() => {});
    }, 350);
  }

  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendBtn = el('button', {
    class: 'primary-btn copilot-send-btn',
    onclick: () => handleSend()
  }, [icon('sparkle'), ' Send']);

  const clearBtn = el('button', {
    class: 'btn-secondary btn-sm',
    onclick: () => {
      state.aiAnalysis.copilotMessages = [
        {
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Conversation cleared. Netrakshak AI ready for fresh investigation inquiries.',
          actions: []
        }
      ];
      renderMessages();
      showToast('Conversation history reset.');
    }
  }, [icon('reset'), ' Clear']);

  const inputContainer = el('div', { class: 'copilot-input-container' }, [
    el('div', { class: 'copilot-input-row' }, [
      inputEl,
      sendBtn,
      clearBtn
    ])
  ]);

  // Main chat column
  const chatColumn = el('div', { class: 'copilot-chat-column' }, [
    chatMessages,
    inputContainer
  ]);

  // Right-hand Tactical Quick Panel
  const sidebarColumn = el('div', { class: 'copilot-tactical-sidebar' }, [
    el('div', { class: 'sidebar-box' }, [
      el('h4', { class: 'sidebar-box-title' }, [icon('sparkle'), ' Quick Inquiries']),
      el('div', { class: 'quick-queries-list' }, copilotSuggestions.map(s => el('button', {
        class: 'quick-query-btn',
        onclick: () => handleSend(s)
      }, [icon('arrow'), el('span', {}, [s])])))
    ]),
    el('div', { class: 'sidebar-box' }, [
      el('h4', { class: 'sidebar-box-title' }, [icon('shield'), ' Active Syndicates']),
      ...SEED_SYNDICATES.map(syn => el('div', { class: 'syn-mini-card' }, [
        el('div', { class: 'syn-mini-head' }, [
          el('strong', {}, [syn.name]),
          el('span', { class: `threat-tag threat-${syn.threat.toLowerCase()}` }, [syn.threat])
        ]),
        el('p', { class: 'syn-mini-mo' }, [syn.modusOperandi.slice(0, 95) + '...']),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => handleSend(`Analyze ${syn.name} syndicate`)
        }, ['Ask AI →'])
      ]))
    ])
  ]);

  return el('div', { class: 'panel copilot-workspace-panel' }, [
    chatColumn,
    sidebarColumn
  ]);
}

/**
 * Tab 2: Cross-Record Intelligence Search (Authoritative live DB cross-matcher)
 */
function renderScannerTab(index) {
  if (!state.aiAnalysis.activeResult && state.aiAnalysis.query) {
    performAIAnalysis(state.aiAnalysis.query, state.aiAnalysis.streamType);
  }
  const activeResult = state.aiAnalysis.activeResult;

  const searchInput = el('input', {
    type: 'text',
    class: 'ai-search-input',
    placeholder: 'Search across all suspect names, phone numbers, vehicles, bank accounts, or FIR numbers...',
    value: state.aiAnalysis.query || ''
  });

  const streamSelect = el('select', { class: 'ai-stream-select' }, [
    el('option', { value: 'all', selected: state.aiAnalysis.streamType === 'all' }, ['All Intelligence Categories']),
    el('option', { value: 'person', selected: state.aiAnalysis.streamType === 'person' }, ['Suspects & Persons']),
    el('option', { value: 'phone', selected: state.aiAnalysis.streamType === 'phone' }, ['Phone Numbers & Burner SIMs']),
    el('option', { value: 'vehicle', selected: state.aiAnalysis.streamType === 'vehicle' }, ['Vehicles & ANPR']),
    el('option', { value: 'bank', selected: state.aiAnalysis.streamType === 'bank' }, ['Bank & Mule Accounts'])
  ]);

  const searchBtn = el('button', {
    class: 'primary-btn',
    onclick: () => {
      const q = searchInput.value.trim();
      state.aiAnalysis.query = q;
      state.aiAnalysis.streamType = streamSelect.value;
      performAIAnalysis(q, streamSelect.value);
      notifyStateChange();
    }
  }, [
    icon('search'),
    el('span', {}, ['Search Intelligence'])
  ]);

  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') searchBtn.click();
  };

  const searchBox = el('div', { class: 'panel ai-clean-search-card' }, [
    el('div', { class: 'ai-search-top' }, [
      searchInput,
      streamSelect,
      searchBtn
    ])
  ]);

  // Render authoritative matched results
  let resultsContainer = null;

  if (activeResult && activeResult.found) {
    const syn = activeResult.syndicate;
    const liveEntities = activeResult.liveEntities || [];
    const liveCases = activeResult.liveCases || [];

    // 1. Matched Suspects & Entities Table/Grid
    const entitiesSection = el('div', { class: 'panel scanner-results-section' }, [
      el('div', { class: 'scanner-section-head' }, [
        el('h3', {}, [icon('user'), ` Correlated Suspects & Associated Nodes (${syn.nodes ? syn.nodes.length : liveEntities.length})`]),
        el('span', { class: 'muted' }, ['Directly linked in criminal network command graph'])
      ]),
      el('div', { class: 'scanner-entities-grid' }, (syn.nodes || liveEntities).map(n => el('div', { class: 'scanner-entity-card' }, [
        el('div', { class: 'scanner-entity-top' }, [
          el('strong', { class: 'scanner-entity-name' }, [n.name || n.label]),
          el('span', { class: `threat-tag threat-${(n.risk || 'medium').toLowerCase()}` }, [(n.risk || 'MED').toUpperCase()])
        ]),
        el('div', { class: 'scanner-entity-role' }, [n.role || n.type || 'Associated Entity']),
        el('div', { class: 'scanner-entity-link' }, [n.link || `Linked in database records`]),
        el('div', { class: 'scanner-entity-actions' }, [
          el('button', {
            class: 'btn-secondary btn-sm',
            onclick: () => {
              if (n.id) openEntityProfile(n.id);
              else {
                state.view = 'entities';
                notifyStateChange();
              }
            }
          }, ['Inspect Dossier →']),
          el('button', {
            class: 'btn-secondary btn-sm',
            onclick: () => {
              state.view = 'network';
              notifyStateChange();
            }
          }, ['View in Graph'])
        ])
      ])))
    ]);

    // 2. Correlated FIR Police Cases
    const firList = (syn.firs || liveCases);
    const firSection = firList.length > 0 ? el('div', { class: 'panel scanner-results-section' }, [
      el('div', { class: 'scanner-section-head' }, [
        el('h3', {}, [icon('file'), ` Registered Police FIR Overlaps (${firList.length})`]),
        el('span', { class: 'muted' }, ['Cross-district registered police station records'])
      ]),
      el('div', { class: 'scanner-firs-table' }, firList.map(f => el('div', { class: 'scanner-fir-row' }, [
        el('div', { class: 'scanner-fir-code' }, [
          el('strong', {}, [f.firNo || f.firNumber || f.fir_number || 'FIR']),
          el('span', { class: 'scanner-fir-date' }, [f.date || f.incidentDate || '2026'])
        ]),
        el('div', { class: 'scanner-fir-main' }, [
          el('div', { class: 'scanner-fir-station' }, [f.station || f.policeStation || f.police_station || 'Cyber Crime Police Station']),
          el('div', { class: 'scanner-fir-sections' }, [`Sections: ${f.sections || 'IPC 420'}`])
        ]),
        el('button', {
          class: 'btn-secondary btn-sm',
          onclick: () => {
            state.view = 'fir';
            notifyStateChange();
          }
        }, ['Open FIR Dossier →'])
      ])))
    ]) : null;

    // 3. Modus Operandi & Procedural Actions
    const actionSection = syn.actions && syn.actions.length > 0 ? el('div', { class: 'panel scanner-results-section' }, [
      el('div', { class: 'scanner-section-head' }, [
        el('h3', {}, [icon('shield'), ' Syndicate Modus Operandi & Recommended CrPC Actions']),
        el('span', { class: 'muted' }, [`Syndicate: ${syn.name} (${syn.threat || 'HIGH'} Risk)`])
      ]),
      el('p', { class: 'scanner-mo-text' }, [syn.modusOperandi]),
      el('div', { class: 'scanner-actions-grid' }, syn.actions.map(act => el('div', { class: `scanner-action-card priority-${act.priority}` }, [
        el('div', { class: 'scanner-action-header' }, [
          el('span', { class: `lead-urgency-tag ${act.priority}` }, [act.priority.toUpperCase()]),
          el('strong', {}, [act.title])
        ]),
        el('p', {}, [act.desc]),
        el('button', {
          class: 'primary-btn small',
          onclick: () => {
            if (act.title.toLowerCase().includes('notice') || act.title.toLowerCase().includes('freeze')) {
              const noticeText = getSection91NoticeText();
              navigator.clipboard.writeText(noticeText).then(() => {
                showToast('✓ Formal Section 91 CrPC Notice copied to clipboard!');
              }).catch(() => {
                showToast('Notice drafted in console.');
              });
            } else {
              showToast(`✓ Action initiated: ${act.title}`);
            }
          }
        }, [icon('check'), ' Execute Action'])
      ])))
    ]) : null;

    resultsContainer = el('div', { class: 'scanner-results-container' }, [
      entitiesSection,
      firSection,
      actionSection
    ]);
  } else if (activeResult && !activeResult.found) {
    resultsContainer = el('div', { class: 'panel scanner-empty-card' }, [
      el('div', { class: 'scanner-empty-icon' }, [icon('search')]),
      el('h3', {}, [`No Prior Criminal Records Found for "${state.aiAnalysis.query}"`]),
      el('p', { class: 'muted' }, ['The queried identifier is clean or unregistered in the current police intelligence database.'])
    ]);
  } else {
    resultsContainer = el('div', { class: 'panel scanner-empty-card' }, [
      el('div', { class: 'scanner-empty-icon' }, [icon('search')]),
      el('h3', {}, ['Cross-Record Intelligence Search']),
      el('p', { class: 'muted' }, ['Enter any suspect name, mobile number, vehicle registration number, mule bank account, or FIR number to view correlated cross-case records.'])
    ]);
  }

  return el('div', { class: 'scanner-tab-wrapper' }, [
    searchBox,
    resultsContainer
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
