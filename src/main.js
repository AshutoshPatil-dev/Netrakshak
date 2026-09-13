import './styles.css';
import { state, registerRender, bootstrapAuth } from './state.js';
import { renderAppShell } from './components/AppShell.js';
import { renderLogin, renderLoadingSplash } from './views/LoginView.js';
import { renderOverview } from './views/DashboardView.js';
import { renderNetwork } from './views/NetworkGraphView.js';
import { renderFIR } from './views/FIRView.js';
import { renderOfficers } from './views/OfficersView.js';
import { renderAuditLogs } from './views/AuditLogsView.js';
import { renderSources } from './views/DataIntegrityView.js';
import { renderSettings } from './views/SettingsView.js';
import { setTextScale } from './components/Accessibility.js';

// Apply persisted font scale before first paint
if (state.fontScale && state.fontScale !== 1) {
  document.documentElement.style.setProperty('--text-scale', String(state.fontScale));
  document.documentElement.style.fontSize = `${state.fontScale * 14}px`;
}

function getViewRenderer() {
  switch (state.view) {
    case 'overview':   return renderOverview;
    case 'network':    return renderNetwork;
    case 'fir':        return renderFIR;
    case 'officers':   return renderOfficers;
    case 'audit_logs': return renderAuditLogs;
    case 'sources':    return renderSources;
    case 'settings':   return renderSettings;
    default:           return renderOverview;
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
