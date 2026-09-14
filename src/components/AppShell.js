import { el } from '../lib/dom.js';
import { state } from '../state.js';
import { renderTopbar } from './Topbar.js';
import { renderSidebar } from './Sidebar.js';

export function renderAppShell(renderCurrentView) {
  const root = document.querySelector('#app');
  let shell = root.querySelector('.app-shell');

  // Ensure any leftover floating widget is cleaned up
  document.querySelector('.a11y-floating')?.remove();

  if (!shell) {
    root.innerHTML = '';
    const topbar = renderTopbar();
    const sidebar = renderSidebar();
    const content = el('main', { class: `content ${state.view === 'network' ? 'network-mode' : ''}` }, []);
    shell = el('div', { class: `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}` }, [
      topbar,
      el('div', { class: 'workspace' }, [
        sidebar,
        el('div', { class: 'main-area' }, [content])
      ])
    ]);
    root.append(shell);
  } else {
    shell.className = `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`;
    
    // Update active navigation state in sidebar and topbar
    const existingSidebar = shell.querySelector('.sidebar');
    if (existingSidebar) {
      existingSidebar.replaceWith(renderSidebar());
    }

    const existingTopbar = shell.querySelector('.topbar');
    if (existingTopbar) {
      existingTopbar.replaceWith(renderTopbar());
    }
  }

  const content = shell.querySelector('.main-area > .content');
  if (content) {
    content.className = `content ${state.view === 'network' ? 'network-mode' : ''}`;
    if (typeof renderCurrentView === 'function') {
      renderCurrentView(content);
    }
  }
}


