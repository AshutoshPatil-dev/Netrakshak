import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, signInOfficer, clearLoginInlineError } from '../state.js';
import { langPicker } from '../components/LanguagePicker.js';

function logo() {
  return el('div', { class: 'brand' }, [
    el('div', { class: 'brand-mark' }, [icon('shield')]),
    el('div', {}, [
      el('strong', {}, [t('product')]),
      el('span', {}, [t('productSub')])
    ])
  ]);
}

export function renderLoadingSplash() {
  const root = document.querySelector('#app');
  root.innerHTML = '';
  const splash = el('div', { class: 'loading-splash' }, [
    el('div', { class: 'splash-card' }, [
      el('div', { class: 'splash-mark' }, [icon('shield')]),
      el('div', { class: 'splash-text' }, [
        el('strong', {}, [t('product')]),
        el('span', {}, [t('productSub')])
      ]),
      el('div', { class: 'splash-spinner' }),
      el('p', { class: 'splash-status' }, ['Verifying security credentials…'])
    ])
  ]);
  root.append(splash);
}

export function renderLogin() {
  const root = document.querySelector('#app');
  root.innerHTML = '';

  const emailInput = el('input', {
    type: 'email',
    placeholder: 'officer@police.gov.in',
    required: true,
    value: state.loginEmail || '',
    class: state.loginError ? 'input-error' : ''
  });

  const passInput = el('input', {
    type: 'password',
    placeholder: '••••••••',
    required: true,
    class: state.loginError ? 'input-error' : ''
  });

  const handleInputEdit = () => {
    if (state.loginError) {
      clearLoginInlineError();
    }
  };

  emailInput.addEventListener('input', handleInputEdit);
  passInput.addEventListener('input', handleInputEdit);

  const errorBlock = state.loginError
    ? el('div', { class: 'login-inline-error', role: 'alert' }, [
        el('span', { class: 'error-icon' }, ['⚠']),
        el('span', { class: 'error-text' }, [state.loginError])
      ])
    : null;

  const loginCard = el('section', { class: 'login-card' }, [
    el('div', { class: 'login-card-top' }, [
      logo(),
      langPicker()
    ]),
    el('div', { style: 'margin: 18px 0 6px;' }, [
      el('h2', {}, [t('signInTitle')]),
      el('p', { class: 'muted' }, [t('signInBody')])
    ]),
    el('form', { class: 'login-form' }, [
      el('label', {}, [
        t('email'),
        emailInput
      ]),
      el('label', {}, [
        t('password'),
        passInput
      ]),
      ...(errorBlock ? [errorBlock] : []),
      el('button', { class: 'primary-btn', type: 'submit' }, [
        t('signIn'),
        el('span', {}, [icon('arrow')])
      ])
    ])
  ]);

  const page = el('main', { class: 'login-page' }, [loginCard]);

  root.append(page);
  page.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    signInOfficer(e.currentTarget);
  };
}
