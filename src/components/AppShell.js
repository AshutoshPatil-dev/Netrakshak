import { el } from '../lib/dom.js';
import { state } from '../state.js';
import { renderTopbar } from './Topbar.js';
import { renderSidebar } from './Sidebar.js';

export function renderAppShell(renderCurrentView) {
  const root = document.querySelector('#app');
  root.innerHTML = '';

  // Ensure any leftover floating widget is cleaned up
  document.querySelector('.a11y-floating')?.remove();

  const topbar = renderTopbar();
  const sidebar = renderSidebar();

  const content = el('main', { class: `content ${state.view === 'network' ? 'network-mode' : ''}` }, []);
  const shell = el('div', { class: `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}` }, [
    topbar,
    el('div', { class: 'workspace' }, [
      sidebar,
      el('div', { class: 'main-area' }, [content])
    ])
  ]);

  root.append(shell);

  if (typeof renderCurrentView === 'function') {
    renderCurrentView(content);
  }
}

