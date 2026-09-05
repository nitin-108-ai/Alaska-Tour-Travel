/**
 * profile.js — Universal Profile Dropdown
 * Include this script on ANY page that has a navbar.
 * It auto-injects the profile avatar or Sign In button
 * into the element with id="profile-slot"
 */
(function () {
  // Inject CSS once
  if (!document.getElementById('profile-style')) {
    const style = document.createElement('style');
    style.id = 'profile-style';
    style.textContent = `
      /* ===== PROFILE SLOT ===== */
      #profile-slot { position: relative; display: flex; align-items: center; }

      .btn-signin-nav {
        background: linear-gradient(135deg, #13b8a8, #0d8a7d);
        color: #fff;
        border: none;
        padding: 9px 22px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 14px rgba(19,184,168,0.35);
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-family: inherit;
      }
      .btn-signin-nav:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(19,184,168,0.45); }

      .profile-trigger-nav {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 6px 14px 6px 6px;
        border-radius: 50px;
        background: rgba(255,255,255,0.08);
        border: 1.5px solid rgba(19,184,168,0.4);
        transition: background 0.2s, border-color 0.2s;
        user-select: none;
      }
      .profile-trigger-nav:hover { background: rgba(19,184,168,0.15); border-color: #13b8a8; }

      .profile-avatar-nav {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #13b8a8, #0d5c75);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 14px; color: #fff;
        text-transform: uppercase;
        box-shadow: 0 2px 8px rgba(19,184,168,0.4);
        flex-shrink: 0;
      }
      .profile-name-nav {
        font-size: 14px; font-weight: 600; color: #fff;
        max-width: 110px; overflow: hidden;
        text-overflow: ellipsis; white-space: nowrap;
      }
      .profile-chevron-nav {
        font-size: 11px; color: #13b8a8;
        transition: transform 0.25s;
      }
      #profile-slot.open .profile-chevron-nav { transform: rotate(180deg); }

      /* Dropdown panel */
      .profile-dropdown-nav {
        position: absolute;
        top: calc(100% + 14px);
        right: 0;
        width: 270px;
        background: #0d1b2a;
        border: 1px solid rgba(19,184,168,0.25);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.55);
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
        z-index: 99999;
      }
      #profile-slot.open .profile-dropdown-nav {
        opacity: 1; transform: translateY(0); pointer-events: all;
      }

      /* Header in dropdown */
      .pdn-header {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 10px 14px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        margin-bottom: 6px;
      }
      .pdn-avatar-lg {
        width: 44px; height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #13b8a8, #0d5c75);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 16px; color: #fff;
        text-transform: uppercase;
        box-shadow: 0 2px 10px rgba(19,184,168,0.4);
        flex-shrink: 0;
      }
      .pdn-name  { font-size: 14px; font-weight: 700; color: #fff; }
      .pdn-email { font-size: 13px; color: #8a9db5; margin-top: 2px; word-break: break-all; }

      /* Bookings section */
      .pdn-section-title {
        font-size: 11px; font-weight: 800; color: #8a9db5;
        text-transform: uppercase; letter-spacing: 0.8px;
        padding: 8px 10px 4px;
      }
      .pdn-booking-card {
        background: rgba(19,184,168,0.07);
        border: 1px solid rgba(19,184,168,0.15);
        border-radius: 10px; padding: 10px 12px; margin: 6px 0;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: block;
      }
      .pdn-booking-card:hover {
        background: rgba(19,184,168,0.18);
        border-color: #13b8a8;
        transform: translateX(3px);
      }
      .pdn-bc-route {
        font-size: 13px; font-weight: 700; color: #fff;
        display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
      }
      .pdn-bc-route i { color: #13b8a8; font-size: 11px; }
      .pdn-bc-meta { display: flex; justify-content: space-between; align-items: center; }
      .pdn-bc-meta span { font-size: 12px; color: #8a9db5; }
      .pdn-bc-amt { font-size: 13px; font-weight: 700; color: #13b8a8 !important; }
      .pdn-bc-badge {
        display: inline-block; font-size: 10px; font-weight: 700;
        padding: 2px 8px; border-radius: 20px;
        background: rgba(0,200,150,0.15); color: #00c896;
      }
      .pdn-no-booking { font-size: 13px; color: #5a7a82; padding: 6px 10px; font-style: italic; }

      /* Menu items */
      .pdn-item {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; border-radius: 10px;
        color: #cfe0ee; font-size: 14px; font-weight: 500;
        text-decoration: none; cursor: pointer;
        transition: background 0.18s, color 0.18s;
        border: none; background: none; width: 100%; text-align: left;
        font-family: inherit;
      }
      .pdn-item i { font-size: 14px; width: 18px; color: #13b8a8; }
      .pdn-item:hover { background: rgba(19,184,168,0.12); color: #fff; }
      .pdn-item.pdn-logout { color: #ff7070; }
      .pdn-item.pdn-logout i { color: #ff7070; }
      .pdn-item.pdn-logout:hover { background: rgba(255,100,100,0.1); color: #ff5555; }

      .pdn-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }
    `;
    document.head.appendChild(style);
  }

  function getBookingsHTML(bookings) {
    if (!bookings || bookings.length === 0) {
      return `<div class="pdn-no-booking">No confirmed bookings yet.</div>`;
    }
    const cards = bookings.slice(0, 3).map(b => {
      const id = b.id || b.bookingId || '';
      const from = b.from || '—';
      const to = b.to || '—';
      const date = b.travelDate || b.date || '—';
      const cls = b.flightClass || b.class || 'Economy';
      const amt = Number(b.totalPrice || b.amount || b.price || 0);

      return `
        <a href="profile.html?bookingId=${encodeURIComponent(id)}" class="pdn-booking-card" title="Click to open ticket & details">
          <div class="pdn-bc-route">
            <i class="fas fa-plane"></i>
            ${from} → ${to}
          </div>
          <div class="pdn-bc-meta">
            <span>${date} · ${cls}</span>
            <span class="pdn-bc-amt">₹${amt.toLocaleString('en-IN')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 11px; color: #38efdb; font-weight: 600;"><i class="fa-solid fa-ticket"></i> Open Ticket</span>
            <span class="pdn-bc-badge">✅ Confirmed</span>
          </div>
        </a>`;
    }).join('');

    const viewAll = bookings.length > 3
      ? `<a href="profile.html" style="font-size: 11px; color: #13b8a8; text-decoration: underline; display: block; text-align: right; padding: 4px 6px;">View All (${bookings.length}) Trips →</a>`
      : '';

    return cards + viewAll;
  }

  function renderProfile() {
    const slot = document.getElementById('profile-slot');
    if (!slot) return;

    const token = localStorage.getItem('alaskaToken');
    const name  = localStorage.getItem('alaskaUserName')  || '';
    const email = localStorage.getItem('alaskaUserEmail') || '';

    // ── GUEST ──
    if (!token || !name) {
      slot.innerHTML = `
        <a href="logintravel.html" class="btn-signin-nav">
          <i class="fa-regular fa-user"></i> Sign In
        </a>`;
      return;
    }

    // ── LOGGED IN ──
    const initials = name.trim().split(' ')
      .map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const bookings = JSON.parse(localStorage.getItem('alaskaBookings') || '[]');

    slot.innerHTML = `
      <div class="profile-trigger-nav" id="profileTriggerNav">
        <div class="profile-avatar-nav">${initials}</div>
        <span class="profile-name-nav">${name.split(' ')[0]}</span>
        <i class="fas fa-chevron-down profile-chevron-nav"></i>
      </div>

      <div class="profile-dropdown-nav" id="profileDropdownNav">
        <div class="pdn-header">
          <div class="pdn-avatar-lg">${initials}</div>
          <div>
            <div class="pdn-name">${name}</div>
            <div class="pdn-email">${email}</div>
          </div>
        </div>

        ${localStorage.getItem('alaskaUserRole') === 'admin' ? `
        <a href="admin.html" class="pdn-item" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.45)); color: #34d399; font-weight: 700; margin-bottom: 8px; border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
          <i class="fas fa-shield-halved" style="color: #34d399;"></i> 🛡️ Admin Dashboard
        </a>` : ''}

        <a href="profile.html" class="pdn-item" style="background: rgba(19,184,168,0.14); color: #38efdb; font-weight: 700; margin-bottom: 6px;">
          <i class="fas fa-id-badge"></i> My Profile &amp; Bookings
        </a>

        <div class="pdn-section-title">✈ Recent Bookings</div>
        <div id="pdnBookingsList">${getBookingsHTML(bookings)}</div>
        <div class="pdn-divider"></div>

        <a href="index.html" class="pdn-item">
          <i class="fas fa-house"></i> Home
        </a>
        <a href="tour.html" class="pdn-item">
          <i class="fas fa-compass"></i> Explore Tours
        </a>
        <a href="bookti.html" class="pdn-item">
          <i class="fas fa-plus-circle"></i> Book Flights
        </a>
        <div class="pdn-divider"></div>
        <button class="pdn-item pdn-logout" id="profileLogoutBtn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>`;

    // Sync with backend bookings in background
    if (window.API && API.token && API.token()) {
      API.getBookings().then(serverBookings => {
        if (Array.isArray(serverBookings) && serverBookings.length > 0) {
          const local = JSON.parse(localStorage.getItem('alaskaBookings') || '[]');
          const map = new Map();
          [...serverBookings, ...local].forEach(b => {
            const id = b.id || b.bookingId;
            if (id && !map.has(id)) map.set(id, b);
          });
          const merged = Array.from(map.values());
          localStorage.setItem('alaskaBookings', JSON.stringify(merged));
          const listEl = document.getElementById('pdnBookingsList');
          if (listEl) listEl.innerHTML = getBookingsHTML(merged);
        }
      }).catch(() => {});
    }

    // Events
    document.getElementById('profileTriggerNav').addEventListener('click', e => {
      e.stopPropagation();
      slot.classList.toggle('open');
    });
    document.addEventListener('click', () => slot.classList.remove('open'));
    document.getElementById('profileDropdownNav').addEventListener('click', e => e.stopPropagation());
    document.getElementById('profileLogoutBtn').addEventListener('click', () => {
      ['alaskaToken', 'alaskaUserName', 'alaskaUserEmail', 'alaskaUserId', 'alaskaUserRole'].forEach(k => localStorage.removeItem(k));
      location.href = 'logintravel.html';
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProfile);
  } else {
    renderProfile();
  }
})();
