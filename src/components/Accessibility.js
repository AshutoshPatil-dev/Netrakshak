import { el } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state } from '../state.js';
import { showToast } from './Toast.js';

export function setTextScale(delta, reset = false) {
  state.fontScale = reset ? 1 : Math.min(1.25, Math.max(0.85, Math.round((state.fontScale + delta) * 100) / 100));
  localStorage.setItem('font_scale', String(state.fontScale));
  document.documentElement.style.setProperty('--text-scale', String(state.fontScale));
  document.documentElement.style.fontSize = `${state.fontScale * 14}px`;
  showToast(`Text size: ${Math.round(state.fontScale * 100)}%`);
}

export function accessibilityControls() {
  const wrap = el('div', { class: 'accessibility-controls' }, [
    el('button', { class: 'a11y-btn', title: t('decreaseText'), onclick: () => setTextScale(-0.1) }, ['A-']),
    el('button', { class: 'a11y-btn', title: t('resetText'), onclick: () => setTextScale(0, true) }, ['A']),
    el('button', { class: 'a11y-btn', title: t('increaseText'), onclick: () => setTextScale(0.1) }, ['A+'])
  ]);
  return wrap;
}
