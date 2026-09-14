import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { getActiveOfficer, state } from '../state.js';
import { langPicker } from '../components/LanguagePicker.js';

export function renderSettings(c) {
  c.innerHTML = '';
  const officer = getActiveOfficer();
  const myOfficer = state.officers.find(o => o.isYou) || {};

  const profile = el('section', { class: 'panel' }, [
    el('h3', {}, ['Investigator profile']),
    el('div', { class: 'profile-large' }, [
      el('div', { class: 'avatar big' }, [officer.initials]),
      el('div', {}, [
        el('strong', {}, [officer.name]),
        el('span', {}, [officer.role]),
        el('span', { class: 'verified-text' }, [icon('check'), ' Authenticated'])
      ])
    ]),
    myOfficer.email ? el('div', { class: 'setting-row' }, [
      'Email address',
      el('span', { style: 'font-size:12px;color:var(--app-text);' }, [myOfficer.email])
    ]) : null,
    myOfficer.phone ? el('div', { class: 'setting-row' }, [
      'Phone',
      el('span', { style: 'font-size:12px;color:var(--app-text);' }, [myOfficer.phone])
    ]) : null,
    myOfficer.district ? el('div', { class: 'setting-row' }, [
      'District',
      el('span', { style: 'font-size:12px;color:var(--app-text);' }, [`${myOfficer.district}, ${myOfficer.state || ''}`])
    ]) : null,
    el('div', { class: 'setting-row' }, ['Display language', langPicker()])
  const geminiKey = localStorage.getItem('netrakshak_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';

  const aiConfig = el('section', { class: 'panel', style: 'margin-top: 16px;' }, [
    el('h3', {}, ['Document Intelligence & Vision OCR']),
    el('p', { class: 'muted', style: 'font-size: 13px; margin-bottom: 14px;' }, [
      'Configure Google Gemini Vision API to enable real-time OCR extraction from scanned and handwritten FIRs (multilingual Devanagari Hindi/Marathi & English).'
    ]),
    el('div', { class: 'setting-row', style: 'flex-direction: column; align-items: stretch; gap: 8px;' }, [
      el('div', { style: 'display: flex; justify-content: space-between; align-items: center;' }, [
        el('label', { style: 'font-size: 12px; font-weight: 600;' }, ['Google Gemini API Key (Free Tier)']),
        el('a', {
          href: 'https://aistudio.google.com/app/apikey',
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'font-size: 11px; color: var(--primary-accent, #2563EB); text-decoration: underline;'
        }, ['Get Free API Key ↗'])
      ]),
      el('div', { style: 'display: flex; gap: 8px;' }, [
        el('input', {
          type: 'password',
          id: 'settings-gemini-key-input',
          value: geminiKey,
          placeholder: 'AIzaSy...',
          style: 'flex: 1; padding: 8px 12px; border: 1px solid var(--border-color, #E2E8F0); border-radius: 6px; font-family: monospace; font-size: 13px; background: var(--bg-card, #FFFFFF); color: var(--app-text);'
        }),
        el('button', {
          class: 'primary-btn small',
          type: 'button',
          onclick: () => {
            const input = document.getElementById('settings-gemini-key-input');
            const val = (input?.value || '').trim();
            if (val) {
              localStorage.setItem('netrakshak_gemini_key', val);
              import('../state.js').then(m => m.showToast('✓ Gemini API Key saved. Vision OCR is now live!'));
            } else {
              localStorage.removeItem('netrakshak_gemini_key');
              import('../state.js').then(m => m.showToast('API Key cleared. Using offline mode.'));
            }
          }
        }, ['Save Key'])
      ]),
      el('span', { style: 'font-size: 11px; color: var(--text-muted, #64748B);' }, [
        geminiKey ? '● Vision OCR status: Active (Live AI Connected)' : '○ Vision OCR status: Offline Mode (Default mock parser active)'
      ])
    ])
  ]);

  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['ADMINISTRATION']),
        el('h1', {}, [t('settings')]),
        el('p', { class: 'muted' }, ['Your investigator profile and preferences.'])
      ])
    ]),
    profile,
    aiConfig
  );
}


