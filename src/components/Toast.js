import { el, icon } from '../lib/dom.js';

export function showToast(message) {
  document.querySelector('.app-toast')?.remove();
  const toast = el('div', { class: 'app-toast' }, [icon('check'), ' ' + message]);
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2800);
}
