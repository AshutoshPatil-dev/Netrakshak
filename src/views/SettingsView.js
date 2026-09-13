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
  ]);

  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['ADMINISTRATION']),
        el('h1', {}, [t('settings')]),
        el('p', { class: 'muted' }, ['Your investigator profile and preferences.'])
      ])
    ]),
    profile
  );
}

