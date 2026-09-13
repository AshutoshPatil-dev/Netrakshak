import { translations } from './translations.js';
import { state } from '../state.js';

export const t = (key) => (translations[state.locale] || translations.en)[key] || translations.en[key] || key;

export { translations };
