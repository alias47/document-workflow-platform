/**
 * auth.js – EduFlow authentication logic
 *
 * Wired to login.html. Handles form submission, basic client-side
 * validation, and the stub API call. Replace `loginUser()` body
 * with a real fetch() call once the backend is ready.
 */

/* ── API stub ──────────────────────────────────────────────── */

/**
 * Authenticate a user against the backend.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ role: 'admin' | 'student', token: string }>}
 */
async function loginUser(email, password) {
  // TODO: replace with real API call, e.g.:
  //
  // const res = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) throw new Error('Invalid credentials');
  // return res.json();  // expects { role, token }

  // Temporary stub: simulate network delay and return a role
  await new Promise(r => setTimeout(r, 800));

  const stubs = {
    'admin@educonsult.com': { role: 'admin',   token: 'stub-admin-token' },
    'student@eduflow.com':  { role: 'student', token: 'stub-student-token' },
  };

  const result = stubs[email.toLowerCase()];
  if (!result) throw new Error('Invalid email or password');
  return result;
}


/* ── Routing helpers ──────────────────────────────────────── */

/**
 * Redirect the user to the correct dashboard after login.
 * @param {'admin' | 'student'} role
 */
function redirectAfterLogin(role) {
  // TODO: update paths when dashboard pages are created
  window.location.href = role === 'admin' ? 'dashboard.html' : 'portal/dashboard.html';
}


/* ── Form logic ───────────────────────────────────────────── */

function showError(message) {
  const el = document.getElementById('login-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function hideError() {
  const el = document.getElementById('login-error');
  if (el) el.classList.remove('visible');
}

function setLoading(loading) {
  const btn = document.getElementById('btn-submit');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Signing in…' : 'Sign in to EduFlow';
}

function validateForm(email, password) {
  if (!email) return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  if (!password) return 'Please enter your password.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  hideError();

  const email    = document.getElementById('email')?.value.trim() ?? '';
  const password = document.getElementById('password')?.value ?? '';

  const validationError = validateForm(email, password);
  if (validationError) {
    showError(validationError);
    return;
  }

  setLoading(true);
  try {
    const { role, token } = await loginUser(email, password);

    // Persist session (swap for httpOnly cookie / secure storage in production)
    sessionStorage.setItem('eduflow_token', token);
    sessionStorage.setItem('eduflow_role', role);

    redirectAfterLogin(role);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}


/* ── Demo-access shortcuts ────────────────────────────────── */

function demoLogin(role) {
  sessionStorage.setItem('eduflow_token', `stub-${role}-token`);
  sessionStorage.setItem('eduflow_role', role);
  redirectAfterLogin(role);
}


/* ── Init ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form')
    ?.addEventListener('submit', handleLoginSubmit);

  document.getElementById('btn-demo-admin')
    ?.addEventListener('click', () => demoLogin('admin'));

  document.getElementById('btn-demo-student')
    ?.addEventListener('click', () => demoLogin('student'));
});
