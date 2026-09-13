import { el } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, notifyStateChange } from '../state.js';
import { showToast } from './Toast.js';

export function setTextScale(delta, reset = false) {
  state.fontScale = reset ? 1 : Math.min(1.3, Math.max(0.8, Math.round((state.fontScale + delta) * 100) / 100));
  localStorage.setItem('font_scale', String(state.fontScale));
  // zoom scales everything (px, em, rem, images) - the only reliable approach
  // when CSS uses hard-coded px values throughout
  document.body.style.zoom = state.fontScale;
  document.documentElement.style.setProperty('--text-scale', String(state.fontScale));
  showToast(`Text size: ${Math.round(state.fontScale * 100)}%`);
  notifyStateChange();
}

export function accessibilityControls() {
  const scale = state.fontScale || 1;
  const wrap = el('div', { class: 'accessibility-controls' }, [
    el('span', { class: 'accessibility-label' }, ['Text']),
    el('button', {
      class: `a11y-btn${scale <= 0.85 ? ' a11y-active' : ''}`,
      title: t('decreaseText'),
      onclick: () => setTextScale(-0.1)
    }, ['A-']),
    el('button', {
      class: `a11y-btn${scale === 1 ? ' a11y-active' : ''}`,
      title: t('resetText'),
      onclick: () => setTextScale(0, true)
    }, ['A']),
    el('button', {
      class: `a11y-btn${scale >= 1.25 ? ' a11y-active' : ''}`,
      title: t('increaseText'),
      onclick: () => setTextScale(0.1)
    }, ['A+'])
  ]);
  return wrap;
}

