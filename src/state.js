import { supabase, supabaseConfigured } from './lib/supabase.js';
import { hashText } from './lib/crypto.js';

let renderCallback = null;

export function registerRender(cb) {
  renderCallback = cb;
}

export function notifyStateChange() {
  if (typeof renderCallback === 'function') {
    renderCallback();
  }
}

export function loadSavedOfficers() {
  try {
    const raw = localStorage.getItem('netrakshak_officers');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function loadSavedAuditLogs() {
  try {
    const raw = localStorage.getItem('netrakshak_audit_logs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export let entities = [];
export function setEntities(val) {
  entities = val;
}

export let edges = [];
export function setEdges(val) {
  edges = val;
}

export let firCases = [];
export function setFirCases(val) {
  firCases = val;
}

export const riskColor = { high: '#DC2626', medium: '#F59E0B', low: '#16A34A' };

export const state = {
  authChecking: true,
  locale: localStorage.getItem('locale') || 'en',
  loggedIn: false,
  view: 'overview',
  query: '',
  sort: 'risk',
  type: 'all',
  selected: null,
  file: null,
  fileHash: '',
  filePath: '',
  graphFullscreen: false,
  sidebarCollapsed: false,
  fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
  firMode: 'upload',
  manualEvidence: [],
  officers: loadSavedOfficers(),
  editingOfficerId: null,
  officerFormRole: 'case-officer',
  auditLogs: loadSavedAuditLogs(),
  auditLevelFilter: 'all',
  auditSearchQuery: '',
  auditActorFilter: 'all',
  auditActionFilter: 'all',
  loginError: '',
  loginEmail: '',
  previewModalFile: null
};

export function getActiveOfficer() {
  const you = state.officers.find(o => o.isYou);
  if (you) {
    const initials = (you.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'OF';
    return {
      id: you.id,
      name: you.name,
      initials,
      role: `${you.rank || 'Officer'} · ${you.district || 'Command'}`,
      rawRole: you.role || 'case-officer',
      isAdmin: you.role === 'admin'
    };
  }
  return {
    id: null,
    name: 'Investigator',
    initials: 'IN',
    role: 'Case Officer',
    rawRole: 'case-officer',
    isAdmin: false
  };
}

export function saveOfficers() {
  try {
    localStorage.setItem('netrakshak_officers', JSON.stringify(state.officers));
  } catch (e) {}
}

export async function recordAudit(action, summary, level = 'info', actionType = 'system', customActor = null) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const selfOfficer = state.officers.find(o => o.isYou);
  const actorName = customActor || selfOfficer?.name || 'Officer';
  const actorInitials = selfOfficer ? selfOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OF';
  const entry = {
    id: 'log_' + Date.now(),
    time: timeStr,
    actor: actorName,
    actorInitials: actorInitials,
    level,
    action,
    actionType,
    summary
  };
  state.auditLogs.unshift(entry);
  try {
    localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
  } catch (e) {}

  if (supabaseConfigured) {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const payload = JSON.stringify({ action, summary, level, at: now.toISOString() });
          const hash = await hashText(payload);
          await supabase.from('audit_events').insert({
            actor_id: user.id,
            action,
            resource_type: actionType,
            change_summary: { summary, level },
            event_hash: hash
          });
        }
      } catch (err) {
        console.warn('Supabase audit insert:', err);
      }
    })();
  }
}

export async function loadSupabaseData() {
  if (!supabaseConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return;

    // Load all data concurrently in parallel
    const [
      { data: events },
      { data: dbProfiles },
      { data: dbEntities },
      { data: dbRels },
      { data: dbCases }
    ] = await Promise.all([
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('entities').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('fir_cases').select('*').order('created_at', { ascending: false })
    ]);

    if (events && events.length > 0) {
      state.auditLogs = events.map(e => {
        const d = new Date(e.created_at);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const isSelf = e.actor_id === user.id;
        const actorName = isSelf ? (user.user_metadata?.display_name || user.email?.split('@')[0] || 'Officer') : 'Officer';
        const actorInitials = isSelf ? (actorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) : 'OF';
        return {
          id: e.id,
          time: timeStr,
          actor: actorName,
          actorInitials: actorInitials,
          level: e.change_summary?.level || 'info',
          action: e.action || 'Audit event',
          actionType: e.resource_type || 'system',
          summary: e.change_summary?.summary || e.action || 'Event recorded'
        };
      });
      try {
        localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
      } catch (e) {}
    }

    if (dbProfiles && dbProfiles.length > 0) {
      state.officers = dbProfiles.map(p => ({
        id: p.id,
        name: p.display_name || p.email?.split('@')[0] || 'Officer',
        rank: p.rank || 'Inspector',
        badge: p.badge_no || '',
        district: p.district || '',
        state: p.state || 'Maharashtra',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role_name || 'case-officer',
        isYou: user.id === p.id || user.email === p.email
      }));
      saveOfficers();
    }

    if (dbEntities) {
      entities = dbEntities.map((e, idx) => ({
        id: e.id,
        name: e.display_name,
        local: e.aliases?.[0] || e.display_name,
        type: e.entity_type ? e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1) : 'Entity',
        risk: e.risk_level || 'low',
        city: e.identifiers?.city || e.identifiers?.address || '',
        phone: e.identifiers?.phone || e.identifiers?.bank || e.identifiers?.vehicle || '',
        events: 0,
        recent: 50,
        x: 350 + Math.cos(idx) * 160,
        y: 250 + Math.sin(idx) * 160
      }));
      if (entities.length > 0 && (!state.selected || !entities.some(x => x.id === state.selected))) {
        state.selected = entities[0].id;
      }
    }

    if (dbRels) {
      edges = dbRels.map(r => [r.source_entity_id, r.target_entity_id]);
    }

    if (dbCases) {
      firCases = dbCases;
    }

    notifyStateChange();
  } catch (err) {
    console.warn('Supabase load error:', err);
  }
}

export async function verifyOfficerAuthorization(user) {
  if (!user) return { authorized: false, reason: 'Authentication required' };
  try {
    let profile = null;
    const { data: byId, error: errId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (byId) {
      profile = byId;
    } else {
      const { data: byEmail, error: errEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email || '')
        .maybeSingle();

      if (byEmail) {
        profile = byEmail;
      } else if (errId || errEmail) {
        const errMsg = errId?.message || errEmail?.message || 'Unknown database error';
        console.warn('Profile authorization error:', errId || errEmail);
        return { authorized: false, reason: `Database error: ${errMsg}` };
      }
    }

    if (!profile) {
      return { authorized: false, reason: `Account "${user.email}" is not registered in the Law Enforcement Officer Directory.` };
    }
    if (profile.is_active === false) {
      return { authorized: false, reason: 'Officer credentials have been deactivated by system administrator.' };
    }
    return { authorized: true, profile };
  } catch (err) {
    return { authorized: false, reason: err.message || 'Authorization check failed.' };
  }
}

export let isAuthActionInProgress = false;

export function setLoginInlineError(message) {
  state.loginError = message;
  const form = document.querySelector('.login-form');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passInput = form.querySelector('input[type="password"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (emailInput) emailInput.classList.add('input-error');
  if (passInput) passInput.classList.add('input-error');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }

  let errorEl = form.querySelector('.login-inline-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'login-inline-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.innerHTML = `<span class="error-icon">⚠</span><span class="error-text">${message}</span>`;
    const passLabel = passInput ? passInput.closest('label') : null;
    if (passLabel && passLabel.nextSibling) {
      form.insertBefore(errorEl, passLabel.nextSibling);
    } else if (submitBtn) {
      form.insertBefore(errorEl, submitBtn);
    } else {
      form.appendChild(errorEl);
    }
  } else {
    const textSpan = errorEl.querySelector('.error-text') || errorEl.querySelector('span:last-child');
    if (textSpan) textSpan.textContent = message;
    errorEl.style.display = 'flex';
  }
}

export function clearLoginInlineError() {
  state.loginError = '';
  const form = document.querySelector('.login-form');
  if (!form) return;
  const errorEl = form.querySelector('.login-inline-error');
  if (errorEl) errorEl.remove();
  const inputs = form.querySelectorAll('input');
  inputs.forEach(inp => inp.classList.remove('input-error'));
}

export async function signInOfficer(form) {
  if (isAuthActionInProgress) return;
  isAuthActionInProgress = true;

  const email = form.querySelector('input[type="email"]')?.value?.trim() || '';
  const password = form.querySelector('input[type="password"]')?.value || '';
  state.loginEmail = email;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Verifying…</span>`;
  }

  try {
    if (supabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData?.user) {
        setLoginInlineError('Invalid email address or password. Please verify your credentials.');
        return;
      }

      const check = await verifyOfficerAuthorization(authData.user);
      if (!check.authorized) {
        supabase.auth.signOut().catch(() => {});
        state.loggedIn = false;
        setLoginInlineError(`Access Denied: ${check.reason}`);
        return;
      }

      state.loggedIn = true;
      state.loginError = '';
      notifyStateChange();
      recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
      loadSupabaseData();
      return;
    }

    localStorage.setItem('demoSession', 'true');
    state.loggedIn = true;
    state.loginError = '';
    notifyStateChange();
    recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
  } catch (err) {
    setLoginInlineError('An error occurred during authentication. Please try again.');
  } finally {
    isAuthActionInProgress = false;
    if (submitBtn && !state.loggedIn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Sign in <span>→</span>`;
    }
  }
}

export async function signOutOfficer() {
  recordAudit('Logoff event', 'Signed out of session.', 'info', 'logoff').catch(() => {});
  localStorage.removeItem('demoSession');
  state.loggedIn = false;
  state.loginError = '';
  notifyStateChange();
  if (supabaseConfigured) {
    supabase.auth.signOut().catch(() => {});
  }
}

export async function bootstrapAuth() {
  try {
    if (supabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const check = await verifyOfficerAuthorization(data.session.user);
        if (check.authorized) {
          state.loggedIn = true;
          await loadSupabaseData();
        } else {
          await supabase.auth.signOut().catch(() => {});
          state.loggedIn = false;
          if (check.reason) state.loginError = check.reason;
        }
      } else {
        state.loggedIn = false;
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (isAuthActionInProgress) return;

        if (session?.user) {
          const check = await verifyOfficerAuthorization(session.user);
          if (!check.authorized) {
            await supabase.auth.signOut().catch(() => {});
            if (state.loggedIn) {
              state.loggedIn = false;
              setLoginInlineError(`Access Denied: ${check.reason}`);
            }
            return;
          }
          if (!state.loggedIn) {
            state.loggedIn = true;
            state.loginError = '';
            await loadSupabaseData();
            notifyStateChange();
          }
        } else {
          if (state.loggedIn) {
            state.loggedIn = false;
            notifyStateChange();
          }
        }
      });
    } else if (localStorage.getItem('demoSession') === 'true') {
      state.loggedIn = true;
    } else {
      state.loggedIn = false;
    }
  } catch (err) {
    console.warn('Auth bootstrap error:', err);
    state.loggedIn = false;
  } finally {
    state.authChecking = false;
    notifyStateChange();
  }
}
