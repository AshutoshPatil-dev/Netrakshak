import './styles.css';
import { state, registerRender, bootstrapAuth } from './state.js';
import { renderAppShell } from './components/AppShell.js';
import { renderLogin, renderLoadingSplash } from './views/LoginView.js';
import { renderOverview } from './views/DashboardView.js';
import { renderNetwork } from './views/NetworkGraphView.js';
import { renderPatternsAnomalies } from './views/PatternsAnomaliesView.js';
import { renderFIR } from './views/FIRView.js';
import { renderOfficers } from './views/OfficersView.js';
import { renderAuditLogs } from './views/AuditLogsView.js';
import { renderSources } from './views/DataIntegrityView.js';
import { renderAIAnalysis } from './views/AIAnalysisView.js';
import { renderEntityProfile } from './views/EntityProfileView.js';
import { renderEntities } from './views/EntitiesView.js';
import { renderTimeline } from './views/TimelineView.js';

// Ensure zoom is normalized
document.body.style.zoom = '1';


function getViewRenderer() {
  switch (state.view) {
    case 'overview':       return renderOverview;
    case 'entities':       return renderEntities;
    case 'network':        return renderNetwork;
    case 'patterns':       return renderPatternsAnomalies;
    case 'timeline':       return renderTimeline;
    case 'entity_profile': return renderEntityProfile;
    case 'fir':            return renderFIR;
    case 'ai_analysis':    return renderAIAnalysis;
    case 'officers':       return renderOfficers;
    case 'audit_logs':     return renderAuditLogs;
    case 'sources':        return renderSources;

    default:               return renderOverview;
  }
}

function render() {
  if (state.authChecking) {
    renderLoadingSplash();
  } else if (state.loggedIn) {
    renderAppShell(getViewRenderer());
  } else {
    renderLogin();
  }
}

// Wire the reactive state callback
registerRender(render);

// Boot
render();
bootstrapAuth();

// Fullscreen change sync
document.addEventListener('fullscreenchange', () => {
  const isFs = Boolean(document.fullscreenElement);
  if (!isFs && state.graphFullscreen) {
    state.graphFullscreen = false;
    document.body.classList.remove('fullscreen-active');
    render();
  }
});

// Escape exits fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.graphFullscreen) {
    state.graphFullscreen = false;
    document.body.classList.remove('fullscreen-active');
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    render();
  }
});
