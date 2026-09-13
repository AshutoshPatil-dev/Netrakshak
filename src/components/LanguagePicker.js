import { el } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, notifyStateChange } from '../state.js';

export function langPicker() {
  const select = el('select', { class: 'language-select', 'aria-label': t('language') });
  [['en', 'English'], ['hi', 'हिन्दी'], ['mr', 'मराठी'], ['gu', 'ગુજરાતી']].forEach(([v, l]) => {
    const o = el('option', { value: v }, [l]);
    if (v === state.locale) o.selected = true;
    select.append(o);
  });
  select.onchange = () => {
    state.locale = select.value;
    localStorage.setItem('locale', state.locale);
    notifyStateChange();
  };
  return select;
}
