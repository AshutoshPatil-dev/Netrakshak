import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { getActiveOfficer } from '../state.js';
import { supabaseConfigured } from '../lib/supabase.js';
import { langPicker } from '../components/LanguagePicker.js';

export function renderSettings(c) {
  c.innerHTML = '';
  const officer = getActiveOfficer();
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
    el('div', { class: 'setting-row' }, ['Default language', langPicker()]),
    el('div', { class: 'setting-row' }, ['Data environment', el('span', { class: 'secure-pill' }, [supabaseConfigured ? 'National Police Cloud' : 'Local Sandbox'])])
  ]);
  const controls = [
    ['Human review required', 'Enabled for OCR, entity merges, and alerts'],
    ['Evidence provenance', 'Shown on every extracted field'],
    ['Model confidence threshold', '0.78 minimum for suggestions'],
    ['Sensitive export approval', 'Two-person review']
  ].map(([a, b]) => el('div', { class: 'toggle-row' }, [
    el('div', {}, [
      el('strong', {}, [a]),
      el('span', {}, [b])
    ]),
    el('span', { class: 'toggle on' }, ['✓'])
  ]));
  const guardrails = el('section', { class: 'panel' }, [
    el('h3', {}, ['Responsible AI controls']),
    ...controls
  ]);
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['ADMINISTRATION']),
        el('h1', {}, [t('settings')]),
        el('p', { class: 'muted' }, ['Investigator profile and system guardrails.'])
      ])
    ]),
    el('div', { class: 'settings-grid' }, [profile, guardrails])
  );
}
