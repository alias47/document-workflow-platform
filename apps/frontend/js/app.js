/**
 * app.js – EduFlow shared application utilities
 *
 * Provides: sidebar rendering, active-link detection, modal helpers,
 * dropdown helpers, and stub data layer (replace with API calls later).
 */

/* ── Session helpers ──────────────────────────────────────── */

const Session = {
  get role()  { return sessionStorage.getItem('eduflow_role'); },
  get token() { return sessionStorage.getItem('eduflow_token'); },
  get name()  { return sessionStorage.getItem('eduflow_name') || 'Sarah Mitchell'; },
  get email() { return sessionStorage.getItem('eduflow_email') || 'sarah@educonsult.com'; },

  isAuthenticated() { return !!this.token; },

  logout() {
    sessionStorage.removeItem('eduflow_token');
    sessionStorage.removeItem('eduflow_role');
    sessionStorage.removeItem('eduflow_name');
    sessionStorage.removeItem('eduflow_email');
    window.location.href = '/login.html';
  },
};


/* ── Admin sidebar nav definition ────────────────────────── */

const ADMIN_NAV = [
  {
    label: 'Main',
    items: [
      { icon: icons.home,      label: 'Dashboard',  href: 'dashboard.html' },
      { icon: icons.users,     label: 'Students',   href: 'students.html',  badge: '12' },
      { icon: icons.fileText,  label: 'Documents',  href: 'documents.html' },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: icons.activity, label: 'Timeline',    href: 'timeline.html' },
      { icon: icons.bell,     label: 'Notifications', href: 'notifications.html', badge: '3' },
      { icon: icons.settings, label: 'Settings',    href: 'settings.html' },
    ],
  },
];

const PORTAL_NAV = [
  {
    label: 'My Application',
    items: [
      { icon: icons.home,      label: 'Overview',   href: 'dashboard.html' },
      { icon: icons.upload,    label: 'Documents',  href: 'documents.html' },
      { icon: icons.clock,     label: 'Timeline',   href: 'timeline.html' },
    ],
  },
];


/* ── SVG icon set ─────────────────────────────────────────── */

const icons = {
  home:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  fileText:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  activity:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  bell:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  settings:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  upload:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  clock:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  logOut:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  search:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  filter:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  moreVert:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  check:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:         `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  download:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  eye:       `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  alertCircle: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  user:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  mail:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  phone:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.93 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mapPin:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  edit:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  archive:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  messageSquare: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  refreshCw: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
};


/* ── Avatar color assignment ──────────────────────────────── */

const AVATAR_COLORS = ['blue','green','amber','red','violet','teal'];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function renderAvatar(name, size = 'md') {
  const color = avatarColor(name);
  const ini = initials(name);
  return `<div class="avatar avatar-${size}" data-color="${color}" aria-label="${name}">${ini}</div>`;
}


/* ── Sidebar renderer ─────────────────────────────────────── */

function renderSidebar({ navDef, portalMode = false, pageDir = '' }) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const portalClass  = portalMode ? 'portal-sidebar' : '';

  const navHTML = navDef.map(section => {
    const itemsHTML = section.items.map(item => {
      const href     = pageDir ? `${pageDir}${item.href}` : item.href;
      const isActive = currentPage === item.href;
      const badge    = item.badge
        ? `<span class="sidebar-link__badge">${item.badge}</span>`
        : '';
      return `
        <a class="sidebar-link${isActive ? ' active' : ''}" href="${href}">
          <span class="sidebar-link__icon">${item.icon}</span>
          <span>${item.label}</span>
          ${badge}
        </a>`;
    }).join('');

    return `
      <div class="sidebar-section-label">${section.label}</div>
      ${itemsHTML}`;
  }).join('');

  const userColor = portalMode ? 'blue' : 'green';
  const userName  = Session.name;
  const userRole  = portalMode ? 'Applicant Portal' : 'Admin · EduFlow';

  return `
    <aside class="sidebar ${portalClass}" id="sidebar">
      <a class="sidebar-logo" href="${pageDir}dashboard.html">
        <div class="sidebar-logo__icon">
          <svg width="17" height="17" viewBox="0 0 19 19" fill="none">
            <path d="M3.5 5h12M3.5 9.5h8M3.5 14h10" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="sidebar-logo__name">EduFlow</span>
      </a>
      <nav class="sidebar-nav" aria-label="Main navigation">
        ${navHTML}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user-btn" role="button" tabindex="0" aria-haspopup="true">
          ${renderAvatar(userName, 'sm')}
          <div style="flex:1; min-width:0;">
            <div class="sidebar-user__name truncate">${userName}</div>
            <div class="sidebar-user__role">${userRole}</div>
          </div>
          <span class="sidebar-user__chevron">${icons.chevronDown}</span>
        </div>
      </div>
    </aside>`;
}


/* ── Topbar renderer ──────────────────────────────────────── */

function renderTopbar(title) {
  return `
    <header class="topbar">
      <h1 class="topbar-title">${title}</h1>
      <div class="topbar-actions">
        <button class="topbar-icon-btn" aria-label="Notifications" title="Notifications">
          ${icons.bell}
          <span class="notif-dot"></span>
        </button>
        ${renderAvatar(Session.name, 'sm')}
      </div>
    </header>`;
}


/* ── Shell builder ────────────────────────────────────────── */

function buildShell({ title, portalMode = false, pageDir = '' }) {
  const navDef = portalMode ? PORTAL_NAV : ADMIN_NAV;

  document.getElementById('sidebar-slot').outerHTML =
    renderSidebar({ navDef, portalMode, pageDir });

  document.getElementById('topbar-slot').outerHTML =
    renderTopbar(title);

  // Logout handler
  document.addEventListener('click', e => {
    const btn = e.target.closest('#sidebar-user-btn');
    if (!btn) return;
    const existing = document.getElementById('user-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'user-menu';
    menu.className = 'dropdown-menu';
    menu.style.cssText = 'position:fixed; bottom:68px; left:16px; width:210px; z-index:999';
    menu.innerHTML = `
      <div style="padding:10px 12px; border-bottom:1px solid var(--color-neutral-100);">
        <div style="font-size:13px; font-weight:600; color:var(--color-neutral-900)">${Session.name}</div>
        <div style="font-size:11px; color:var(--color-neutral-500); margin-top:1px">${Session.email}</div>
      </div>
      <button class="dropdown-item" id="btn-logout" style="width:100%">
        ${icons.logOut} Sign out
      </button>`;
    document.body.appendChild(menu);

    document.getElementById('btn-logout').addEventListener('click', () => Session.logout());
    setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 10);
  });
}


/* ── Modal helpers ────────────────────────────────────────── */

const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.removeAttribute('hidden'); el.style.display = 'flex'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.setAttribute('hidden', ''); el.style.display = 'none'; }
  },
  closeOnBackdrop(id) {
    document.getElementById(id)?.addEventListener('click', e => {
      if (e.target === e.currentTarget) Modal.close(id);
    });
  },
};


/* ── Toast notifications ──────────────────────────────────── */

let toastContainer;

function toast(message, type = 'success', duration = 3500) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;`;
    document.body.appendChild(toastContainer);
  }

  const colors = {
    success: { bg: 'var(--color-success-600)', icon: '✓' },
    error:   { bg: 'var(--color-danger-600)',  icon: '✕' },
    info:    { bg: 'var(--color-brand-600)',   icon: 'ℹ' },
    warning: { bg: 'var(--color-warning-600)', icon: '!' },
  };
  const { bg, icon } = colors[type] || colors.info;

  const el = document.createElement('div');
  el.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: var(--color-neutral-900); color: white;
    padding: 12px 16px; border-radius: 10px;
    box-shadow: var(--shadow-lg); font-size: 13.5px;
    animation: fadeUp 0.2s ease; max-width: 320px;`;
  el.innerHTML = `
    <span style="width:20px; height:20px; border-radius:50%; background:${bg};
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; flex-shrink:0;">${icon}</span>
    <span>${message}</span>`;

  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), duration);
}


/* ── Format helpers ───────────────────────────────────────── */

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(dateStr);
}

function fileIcon(mime) {
  if (mime?.includes('pdf'))   return '📄';
  if (mime?.includes('image')) return '🖼️';
  if (mime?.includes('word') || mime?.includes('document')) return '📝';
  return '📎';
}

function fileSize(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}
