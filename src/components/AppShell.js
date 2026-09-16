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

  const isCanvasActive = state.view === 'network' && state.graphExploration?.active;

  if (!shell || localeChanged) {
    root.innerHTML = '';
    const topbar = renderTopbar();
    const sidebar = renderSidebar();
    const content = el('main', { class: `content ${isCanvasActive ? 'network-mode' : ''}` }, []);
    const mobileBackdrop = el('div', {
      class: `mobile-sidebar-backdrop ${state.mobileSidebarOpen ? 'active' : ''}`,
      onclick: () => {
        state.mobileSidebarOpen = false;
        notifyStateChange();
      }
    });

    shell = el('div', { class: `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''} ${state.mobileSidebarOpen ? 'mobile-sidebar-open' : ''}` }, [
      topbar,
      mobileBackdrop,
      el('div', { class: 'workspace' }, [
        sidebar,
        el('div', { class: 'main-area' }, [content])
      ])
    ]);
    shell.setAttribute('data-active-view', state.view);
    root.append(shell);
    if (typeof renderCurrentView === 'function') {
      const res = renderCurrentView(content);
      if (res && res instanceof Node && !content.contains(res)) {
        content.append(res);
      }
    }
    return;
  }

  shell.className = `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''} ${state.mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`;
  
  // Update or sync mobile backdrop
  let backdrop = shell.querySelector('.mobile-sidebar-backdrop');
  if (!backdrop) {
    backdrop = el('div', {
      class: `mobile-sidebar-backdrop ${state.mobileSidebarOpen ? 'active' : ''}`,
      onclick: () => {
        state.mobileSidebarOpen = false;
        notifyStateChange();
      }
    });
    shell.insertBefore(backdrop, shell.querySelector('.workspace'));
  } else {
    backdrop.classList.toggle('active', !!state.mobileSidebarOpen);
  }

  // Update active navigation state in sidebar without tearing down DOM
  const existingSidebar = shell.querySelector('.sidebar');
  if (existingSidebar) {
    existingSidebar.classList.toggle('mobile-open', !!state.mobileSidebarOpen);
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
    content.className = `content ${isCanvasActive ? 'network-mode' : ''}`;
    if (viewChanged) {
      content.innerHTML = '';
    }
    if (typeof renderCurrentView === 'function') {
      const res = renderCurrentView(content);
      if (res && res instanceof Node && !content.contains(res)) {
        content.append(res);
      }
    }
  }
}


