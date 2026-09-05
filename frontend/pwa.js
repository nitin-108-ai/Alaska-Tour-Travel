/**
 * Alaska Tour & Travel — PWA Runtime Client & Install Manager
 * Handles Service Worker registration, install prompt UX, and offline detection.
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Determine relative service worker path
      const swPath = './sw.js';
      navigator.serviceWorker
        .register(swPath, { scope: './' })
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);

          // Check for worker updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New update available.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 2. Capture Install Prompt (Chrome, Edge, Android)
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent default mini-infobar from appearing on mobile
    event.preventDefault();
    deferredInstallPrompt = event;

    // Reveal install UI if not running in standalone mode
    if (!isStandalone) {
      showInstallBanner();
      updateInstallButtons(true);
    }
  });

  // 3. Track App Installed Event
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Alaska Tour & Travel PWA was installed successfully!');
    deferredInstallPrompt = null;
    hideInstallBanner();
    updateInstallButtons(false);

    // Notify backend app download counter
    try {
      if (window.API && typeof window.API.request === 'function') {
        window.API.request('/app-download', {
          method: 'POST',
          body: JSON.stringify({ platform: 'pwa' })
        }).catch(() => {});
      }
    } catch (e) {}
  });

  // 4. Global Trigger to Install App
  window.installAlaskaApp = async function () {
    if (!deferredInstallPrompt) {
      // For iOS Safari or unsupported browsers, show helpful install guidance
      showIosInstallGuide();
      return;
    }

    try {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      console.log('[PWA] User choice:', choiceResult.outcome);
      if (choiceResult.outcome === 'accepted') {
        hideInstallBanner();
        updateInstallButtons(false);
      }
      deferredInstallPrompt = null;
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
  };

  // 5. Update existing install buttons on the page
  function updateInstallButtons(available) {
    const installBtns = document.querySelectorAll('.pwa-install-btn, [data-pwa-install]');
    installBtns.forEach((btn) => {
      if (available && !isStandalone) {
        btn.style.display = 'inline-flex';
        btn.onclick = window.installAlaskaApp;
      } else {
        btn.style.display = 'none';
      }
    });
  }

  // 6. Floating Install Banner UI
  function showInstallBanner() {
    if (document.getElementById('alaska-pwa-banner') || isStandalone) return;

    // Avoid annoying user if previously dismissed in this session
    if (sessionStorage.getItem('alaska_pwa_dismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'alaska-pwa-banner';
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#13b8a8,#0879d1);color:white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(19,184,168,0.4);flex-shrink:0;">
          <i class="fa-solid fa-plane-departure"></i>
        </div>
        <div style="text-align:left;">
          <strong style="font-size:14px;font-weight:800;color:#ffffff;display:block;line-height:1.2;">Alaska Tour App</strong>
          <span style="font-size:11px;color:#94b8d7;display:block;">Install on your home screen for quick offline booking</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button id="pwa-banner-install-btn" style="background:linear-gradient(135deg,#13b8a8,#0879d1);color:white;border:none;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(19,184,168,0.35);">
          <i class="fa-solid fa-download"></i> Install
        </button>
        <button id="pwa-banner-close-btn" style="background:transparent;color:#94a3b8;border:none;padding:6px;font-size:16px;cursor:pointer;" aria-label="Dismiss banner">
          &times;
        </button>
      </div>
    `;

    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '480px',
      background: 'rgba(4, 26, 50, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(19, 184, 168, 0.4)',
      borderRadius: '16px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      zIndex: '99999',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
      animation: 'pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    document.body.appendChild(banner);

    document.getElementById('pwa-banner-install-btn').onclick = window.installAlaskaApp;
    document.getElementById('pwa-banner-close-btn').onclick = () => {
      sessionStorage.setItem('alaska_pwa_dismissed', 'true');
      hideInstallBanner();
    };
  }

  function hideInstallBanner() {
    const banner = document.getElementById('alaska-pwa-banner');
    if (banner) banner.remove();
  }

  // 7. iOS Safari Install Guide Modal
  function showIosInstallGuide() {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (!isIos) {
      alert('To install Alaska Tour & Travel:\nClick the Install icon in your browser address bar (top right on Chrome/Edge/Desktop).');
      return;
    }

    let modal = document.getElementById('alaska-ios-guide-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'alaska-ios-guide-modal';
      modal.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:flex-end;justify-content:center;padding:16px;">
          <div style="background:#041a32;border:1px solid rgba(19,184,168,0.4);border-radius:24px;width:100%;max-width:420px;padding:26px 20px;color:white;text-align:center;box-shadow:0 -10px 40px rgba(0,0,0,0.5);">
            <div style="width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#13b8a8,#0879d1);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;box-shadow:0 4px 15px rgba(19,184,168,0.4);">
              <i class="fa-solid fa-plane-departure"></i>
            </div>
            <h3 style="font-size:18px;font-weight:800;margin-bottom:8px;">Install on iPhone / iPad</h3>
            <p style="font-size:13px;color:#94b8d7;line-height:1.6;margin-bottom:18px;">
              1. Tap the <strong>Share</strong> button <i class="fa-solid fa-arrow-up-from-bracket"></i> in Safari toolbar.<br>
              2. Scroll down and tap <strong>Add to Home Screen</strong> <i class="fa-regular fa-square-plus"></i>.<br>
              3. Tap <strong>Add</strong> to start using the full-screen app!
            </p>
            <button id="close-ios-guide-btn" style="background:#13b8a8;color:white;border:none;padding:10px 24px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;width:100%;">
              Got it!
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('close-ios-guide-btn').onclick = () => modal.remove();
    }
  }

  // 8. Online / Offline Connectivity Detection
  function handleNetworkChange() {
    const isOnline = navigator.onLine;
    let toast = document.getElementById('alaska-offline-toast');

    if (!isOnline) {
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'alaska-offline-toast';
        toast.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> You are offline. Browsing cached pages; ticket bookings & payments require internet.';
        Object.assign(toast.style, {
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '30px',
          fontSize: '12.5px',
          fontWeight: '700',
          zIndex: '999999',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        });
        document.body.appendChild(toast);
      }
    } else if (toast) {
      toast.style.background = '#10b981';
      toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connection restored. You are back online!';
      setTimeout(() => {
        if (toast) toast.remove();
      }, 3000);
    }
  }

  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);

  // Check on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    updateInstallButtons(!!deferredInstallPrompt);
  });
})();
