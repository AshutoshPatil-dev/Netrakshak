import { el, icon } from '../lib/dom.js';
import { t } from '../i18n/index.js';
import { state, getActiveOfficer, saveOfficers, recordAudit, notifyStateChange, loadSupabaseData } from '../state.js';
import { supabase, supabaseConfigured, createOfficerAccount } from '../lib/supabase.js';
import { showToast } from '../components/Toast.js';

export function renderOfficers(c) {
  c.innerHTML = '';
  if (supabaseConfigured && !c._hasSyncedOfficers) {
    c._hasSyncedOfficers = true;
    loadSupabaseData().catch(() => {});
  }
  const activeOfficer = getActiveOfficer();
  const isAdmin = activeOfficer ? (activeOfficer.isAdmin !== false) : true;

  const editingOfficer = state.editingOfficerId ? state.officers.find(o => o.id === state.editingOfficerId) : null;

  const isDrawerOpen = !!(state.isOfficerDrawerOpen || state.editingOfficerId);

  const headerActions = isAdmin ? [
    el('button', {
      class: 'primary-btn',
      onclick: () => {
        state.isOfficerDrawerOpen = true;
        state.editingOfficerId = null;
        state.officerFormRole = 'case-officer';
        notifyStateChange();
      }
    }, [icon('plus'), t('addOfficer')])
  ] : [];

  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('h1', {}, [t('officers')]),
      el('p', { class: 'muted' }, [t('officersSubtitle')])
    ]),
    ...headerActions
  ]);

  let listArea;
  if (state.officers.length === 0) {
    listArea = el('div', { class: 'officers-empty-shell' }, [
      el('div', { class: 'empty-shell-icon' }, [icon('users')]),
      el('h3', {}, ['No Registered Officers']),
      el('p', { class: 'muted' }, ['No officer profiles are loaded yet. Profiles are linked directly to central authentication. As officers log in or are added via the console, they will appear here grouped by district.'])
    ]);
  } else {
    // Group officers by District
    const districtGroups = {};
    state.officers.forEach(o => {
      const dist = o.district || 'General';
      if (!districtGroups[dist]) districtGroups[dist] = [];
      districtGroups[dist].push(o);
    });

    listArea = el('div', { class: 'officers-list-area' }, Object.entries(districtGroups).map(([district, officers]) => {
      return el('div', { class: 'officer-district-group' }, [
        el('div', { class: 'district-group-header' }, [`${district.toUpperCase()} · ${officers.length} ${officers.length === 1 ? 'OFFICER' : 'OFFICERS'}`]),
        el('div', { class: 'officers-grid' }, officers.map(officer => {
          const initials = (officer.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const roleClass = officer.role === 'admin' ? 'admin' : officer.role === 'analyst' ? 'analyst' : 'case-officer';

          const actions = [];
          if (isAdmin) {
            actions.push(el('button', {
              class: 'officer-btn',
              onclick: () => {
                state.isOfficerDrawerOpen = true;
                state.editingOfficerId = officer.id;
                state.officerFormRole = officer.role || 'case-officer';
                notifyStateChange();
              }
            }, ['Edit']));

            if (!officer.isYou) {
              actions.push(el('button', {
                class: 'officer-btn delete',
                onclick: () => {
                  if (confirm(`Remove officer profile for ${officer.name}?`)) {
                    if (supabaseConfigured && officer.id && !officer.id.startsWith('off_')) {
                      supabase.from('profiles').delete().eq('id', officer.id).then(() => {});
                    }
                    state.officers = state.officers.filter(o => o.id !== officer.id);
                    saveOfficers();
                    recordAudit('Officer deleted', `Officer ${officer.name} (${officer.district}) profile removed.`, 'warning', 'officer');
                    showToast(t('officerDeleted'));
                    notifyStateChange();
                  }
                }
              }, ['Delete']));
            }
          }

          return el('div', { class: 'officer-card' }, [
            el('div', { class: 'officer-card-top' }, [
              el('div', { class: 'officer-avatar' }, [initials]),
              el('div', { class: 'officer-meta' }, [
                el('div', { class: 'officer-name-row' }, [
                  el('strong', {}, [officer.name]),
                  officer.isYou ? el('span', { class: 'officer-you-tag' }, ['YOU']) : null
                ]),
                el('span', {}, [`${officer.rank || 'Officer'} · ${officer.district || 'Maharashtra'}`])
              ]),
              el('span', { class: `officer-role-pill ${roleClass}` }, [officer.role || 'case-officer'])
            ]),
            el('div', { class: 'officer-fields' }, [
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['District']),
                el('span', { class: 'field-val' }, [`${officer.district || '-'}, ${officer.state || ''}`])
              ]),
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['Email address']),
                el('span', { class: 'field-val' }, [officer.email || '-'])
              ]),
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['Phone']),
                el('span', { class: 'field-val' }, [officer.phone || '-'])
              ])
            ]),
            actions.length > 0 ? el('div', { class: 'officer-card-actions' }, actions) : null
          ]);
        }))
      ]);
    }));
  }

  let drawerElement = null;
  if (isAdmin && isDrawerOpen) {
    const form = el('form', { class: 'officer-form' }, [
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('fullName') + ' *']),
        el('input', { name: 'fullName', required: true, placeholder: 'e.g. Officer Name', value: editingOfficer ? editingOfficer.name : '' })
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('rank')]),
          el('select', { name: 'rank' }, [
            'Director General of Police', 'Inspector General', 'Deputy Inspector General',
            'Superintendent of Police', 'Assistant Commissioner of Police', 'Inspector',
            'Sub-Inspector', 'Assistant Sub-Inspector', 'Head Constable', 'Constable'
          ].map(r => {
            const opt = el('option', { value: r }, [r]);
            if (editingOfficer && editingOfficer.rank === r) opt.selected = true;
            else if (!editingOfficer && r === 'Sub-Inspector') opt.selected = true;
            return opt;
          }))
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('district') + ' *']),
          el('input', { name: 'district', required: true, placeholder: 'Pune City', value: editingOfficer ? editingOfficer.district : '' })
        ])
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('state')]),
          el('input', { name: 'state', placeholder: 'Maharashtra', value: editingOfficer ? editingOfficer.state : 'Maharashtra' })
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('emailAddress') + ' *']),
          el('input', { name: 'email', type: 'email', required: true, placeholder: 'officer@police.gov.in', value: editingOfficer ? editingOfficer.email : '' })
        ])
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, ['Badge / Service No']),
          el('input', { name: 'badgeNo', placeholder: 'e.g. MH-IPS-042', value: editingOfficer ? (editingOfficer.badge_no || '') : '' })
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('phone')]),
          el('input', { name: 'phone', type: 'tel', placeholder: '+91-…', value: editingOfficer ? editingOfficer.phone : '' })
        ])
      ]),
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('initialPassword') + ' *']),
        el('input', { name: 'password', type: 'password', placeholder: '••••••••', value: editingOfficer ? '********' : '' }),
        el('span', { class: 'form-hint' }, [t('passwordHelp')])
      ]),
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('rolePermissions')]),
        editingOfficer && editingOfficer.isYou
          ? el('div', { class: 'role-pill-group' }, [
              el('div', { class: 'admin-notice-box', style: 'margin:0;padding:8px 10px;' }, [
                el('strong', {}, ['Role locked']),
                el('span', {}, ['You cannot change your own role. Ask another admin to do this.'])
              ])
            ])
          : el('div', { class: 'role-pill-group' }, ['case-officer', 'analyst', 'admin'].map(role => {
              const active = (state.officerFormRole || 'case-officer') === role;
              const btn = el('button', {
                type: 'button',
                class: `role-pill-btn ${active ? 'active' : ''}`,
                onclick: (e) => {
                  state.officerFormRole = role;
                  const group = e.target.closest('.role-pill-group');
                  if (group) {
                    group.querySelectorAll('.role-pill-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                  }
                }
              }, [role]);
              return btn;
            }))
      ]),
      el('div', { class: 'form-actions' }, [
        el('button', { class: 'primary-btn', type: 'submit' }, [
          icon('check'),
          editingOfficer ? t('saveChanges') : t('addOfficer')
        ]),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => {
            state.isOfficerDrawerOpen = false;
            state.editingOfficerId = null;
            state.officerFormRole = 'case-officer';
            notifyStateChange();
          }
        }, ['Cancel'])
      ])
    ]);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="fullName"]').value.trim();
      const rank = form.querySelector('[name="rank"]').value;
      const district = form.querySelector('[name="district"]').value.trim();
      const stateVal = form.querySelector('[name="state"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const badgeNo = form.querySelector('[name="badgeNo"]')?.value?.trim() || '';
      const phone = form.querySelector('[name="phone"]').value.trim();
      const password = form.querySelector('[name="password"]')?.value?.trim() || '';
      const role = state.officerFormRole || 'case-officer';

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';
      }

      try {
        if (editingOfficer) {
          editingOfficer.name = name;
          editingOfficer.rank = rank;
          editingOfficer.district = district;
          editingOfficer.state = stateVal;
          editingOfficer.email = email;
          editingOfficer.phone = phone;
          editingOfficer.badge_no = badgeNo;
          if (password && password !== '********') {
            editingOfficer.password = password;
          }
          if (!editingOfficer.isYou) editingOfficer.role = role;
          saveOfficers();
          recordAudit('Officer updated', `Officer profile updated: ${name} (${rank}, ${district}).`, 'info', 'officer');
          if (supabaseConfigured && editingOfficer.id && !editingOfficer.id.startsWith('off_')) {
            await supabase.from('profiles').update({
              display_name: name,
              rank,
              district,
              unit_name: district || 'Maharashtra Police',
              state: stateVal,
              email,
              phone,
              badge_no: badgeNo,
              role_name: role
            }).eq('id', editingOfficer.id);
          }
          showToast(t('officerUpdated'));
          state.editingOfficerId = null;
          state.isOfficerDrawerOpen = false;
        } else {
          let newId = 'off_' + Date.now();
          if (supabaseConfigured) {
            try {
              const createdId = await createOfficerAccount({
                email,
                password,
                name,
                rank,
                district,
                state: stateVal,
                phone,
                role,
                badge_no: badgeNo
              });
              if (createdId) newId = createdId;
              await loadSupabaseData();
            } catch (authErr) {
              console.error('Supabase officer registration error:', authErr);
              showToast(`Error: ${authErr.message || 'Could not register in Supabase'}`);
              throw authErr;
            }
          }

          const newOff = {
            id: newId,
            name,
            rank,
            district,
            state: stateVal || 'Maharashtra',
            email,
            phone,
            badge_no: badgeNo,
            role,
            isYou: false
          };
          if (!state.officers.some(o => o.id === newId || (o.email && o.email.toLowerCase() === email.toLowerCase()))) {
            state.officers.push(newOff);
          }
          saveOfficers();
          recordAudit('Officer added', `New officer profile created: ${name} (${rank}, ${district}).`, 'info', 'officer');
          showToast(t('officerAdded'));
          form.reset();
          state.isOfficerDrawerOpen = false;
        }
      } catch (err) {
        console.error('Officer save error:', err);
        showToast(`Failed: ${err.message || 'Failed to save officer'}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingOfficer ? t('saveChanges') : t('addOfficer');
        }
        notifyStateChange();
      }
    };

    drawerElement = el('div', {
      class: 'officer-drawer-overlay',
      onclick: (e) => {
        if (e.target.classList.contains('officer-drawer-overlay')) {
          state.isOfficerDrawerOpen = false;
          state.editingOfficerId = null;
          notifyStateChange();
        }
      }
    }, [
      el('div', { class: 'officer-drawer-panel' }, [
        el('div', { class: 'officer-drawer-header' }, [
          el('div', {}, [
            el('h3', {}, [editingOfficer ? t('editOfficer') : t('addOfficer')]),
            el('p', {}, [t('officersSubtitle')])
          ]),
          el('button', {
            class: 'officer-drawer-close',
            onclick: () => {
              state.isOfficerDrawerOpen = false;
              state.editingOfficerId = null;
              notifyStateChange();
            }
          }, ['✕'])
        ]),
        el('div', { class: 'officer-drawer-body' }, [form])
      ])
    ]);
  }

  const layout = el('div', { class: 'officers-layout' }, [listArea]);
  c.append(header, layout);
  if (drawerElement) {
    c.append(drawerElement);
  }
}

