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
        border-radius: 10px; padding: 10px 12px; margin: 4px 0;
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
        display: inline-block; font-size: 11px; font-weight: 700;
        padding: 2px 8px; border-radius: 20px; margin-top: 5px;
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
    let bookingsHTML = bookings.length === 0
      ? `<div class="pdn-no-booking">No confirmed bookings yet.</div>`
      : bookings.slice(0, 3).map(b => `
          <div class="pdn-booking-card">
            <div class="pdn-bc-route">
              <i class="fas fa-plane"></i>
              ${b.from || '—'} → ${b.to || '—'}
            </div>
            <div class="pdn-bc-meta">
              <span>${b.date || '—'} · ${b.flightClass || 'Economy'}</span>
              <span class="pdn-bc-amt">₹${Number(b.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div><span class="pdn-bc-badge">✅ Confirmed</span></div>
          </div>`).join('');

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

        <div class="pdn-section-title">✈ Recent Bookings</div>
        ${bookingsHTML}
        <div class="pdn-divider"></div>

        <a href="index.html" class="pdn-item">
          <i class="fas fa-house"></i> Home
        </a>
        <a href="bookti.html" class="pdn-item">
          <i class="fas fa-plus-circle"></i> Book New Trip
        </a>
        <a href="paymen.html" class="pdn-item">
          <i class="fas fa-credit-card"></i> Payments
        </a>
        <div class="pdn-divider"></div>
        <button class="pdn-item pdn-logout" id="profileLogoutBtn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>`;

    // Events
    document.getElementById('profileTriggerNav').addEventListener('click', e => {
      e.stopPropagation();
      slot.classList.toggle('open');
    });
    document.addEventListener('click', () => slot.classList.remove('open'));
    document.getElementById('profileDropdownNav').addEventListener('click', e => e.stopPropagation());
    document.getElementById('profileLogoutBtn').addEventListener('click', () => {
      ['alaskaToken', 'alaskaUserName', 'alaskaUserEmail'].forEach(k => localStorage.removeItem(k));
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
