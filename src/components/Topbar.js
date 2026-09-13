import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, getActiveOfficer, signOutOfficer, entities, notifyStateChange } from '../state.js';
import { langPicker } from './LanguagePicker.js';


export function updateSearchSuggestions(input) {
  const box = input.closest('.global-search');
  if (!box) return;
  box.querySelector('.search-suggestions')?.remove();
  const query = input.value.trim().toLowerCase();
  if (!query) return;
  const matches = entities.filter(entity => [entity.name, entity.local, entity.type, entity.city, entity.phone].some(value => String(value || '').toLowerCase().includes(query))).slice(0, 7);
  const list = el('div', { class: 'search-suggestions' }, matches.length ? matches.map(entity => el('button', {
    class: 'search-suggestion',
    type: 'button',
    onclick: () => {
      state.selected = entity.id;
      state.query = '';
      state.view = 'network';
      notifyStateChange();
    }
  }, [
    el('span', { class: 'search-suggestion-name' }, [entity.name]),
    el('span', { class: 'search-suggestion-meta' }, [`${entity.type} • ${entity.city}`])
  ])) : [el('div', { class: 'search-empty' }, [t('noResults')])]);
  box.append(list);
}

export function renderTopbar() {
  const activeOfficer = getActiveOfficer();

  const searchInput = el('input', { placeholder: t('search'), value: state.query });
  searchInput.oninput = (e) => {
    state.query = e.target.value;
    updateSearchSuggestions(searchInput);
  };
  searchInput.onfocus = () => updateSearchSuggestions(searchInput);
  searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      state.view = 'network';
      notifyStateChange();
    }
  };
  searchInput.onblur = () => setTimeout(() => searchInput.closest('.global-search')?.querySelector('.search-suggestions')?.remove(), 160);

  const topbar = el('header', { class: 'topbar' }, [
    el('div', { class: 'topbar-brand' }, [
      el('div', { class: 'topbar-mark' }, [icon('shield')]),
      el('div', {}, [
        el('strong', {}, [t('product')]),
        el('span', {}, [t('productSub')])
      ])
    ]),
    el('div', { class: 'global-search' }, [
      icon('search'),
      searchInput
    ]),
    el('div', { class: 'top-actions' }, [
      langPicker(),
      el('div', { class: 'topbar-officer' }, [
        el('div', { class: 'avatar' }, [activeOfficer.initials]),
        el('div', {}, [
          el('strong', {}, [activeOfficer.name]),
          el('span', {}, [activeOfficer.role])
        ])
      ]),
      el('button', { class: 'topbar-btn', onclick: signOutOfficer }, [t('logout')])
    ])
  ]);

  return topbar;
}
