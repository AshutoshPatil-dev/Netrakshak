import { el } from '../lib/dom.js';
import { state } from '../state.js';
import { renderTopbar } from './Topbar.js';
import { renderSidebar } from './Sidebar.js';

let lastRenderedLocale = null;

export function renderAppShell(renderCurrentView) {
  const root = document.querySelector('#app');
  let shell = root.querySelector('.app-shell');

  // Ensure any leftover floating widget is cleaned up
  document.querySelector('.a11y-floating')?.remove();

  const localeChanged = lastRenderedLocale !== state.locale;
  lastRenderedLocale = state.locale;

  if (!shell || localeChanged) {
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
    shell.setAttribute('data-active-view', state.view);
    root.append(shell);
    if (typeof renderCurrentView === 'function') {
      renderCurrentView(content);
    }
    return;
  }

  shell.className = `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`;
  
  // Update active navigation state in sidebar without tearing down DOM
  const existingSidebar = shell.querySelector('.sidebar');
  if (existingSidebar) {
    existingSidebar.querySelectorAll('.nav-item').forEach(item => {
      const viewAttr = item.getAttribute('data-view');
      if (viewAttr) {
        item.classList.toggle('active', viewAttr === state.view);
      }
    });
    const toggleIcon = existingSidebar.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.textContent = state.sidebarCollapsed ? '▶' : '◀';
    }
  }

  const lastActiveView = shell.getAttribute('data-active-view');
  const viewChanged = lastActiveView !== state.view;
  shell.setAttribute('data-active-view', state.view);

  const content = shell.querySelector('.main-area > .content');
  if (content) {
    content.className = `content ${state.view === 'network' ? 'network-mode' : ''}`;
    if (viewChanged) {
      content.innerHTML = '';
    }
    if (typeof renderCurrentView === 'function') {
      renderCurrentView(content);
    }
  }
}


