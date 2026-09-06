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

  // 1. Register Service Worker & Handle Updates
  let refreshing = false;
  if ('serviceWorker' in navigator) {
    // Reload page when new service worker takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener('load', () => {
      // Determine relative service worker path
      const swPath = './sw.js';
      navigator.serviceWorker
        .register(swPath, { scope: './' })
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);

          // Case A: A new service worker is already waiting to activate
          if (reg.waiting && navigator.serviceWorker.controller) {
            showUpdateNotification(reg.waiting);
          }

          // Case B: A new service worker has been found during install
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New update available.');
                  showUpdateNotification(newWorker);
                }
              });
            }
          });

          // Check for service worker updates when app regains focus or visibility
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          });
          window.addEventListener('focus', () => {
            reg.update().catch(() => {});
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
      // For iOS Safari, Desktop or unsupported browsers, show step-by-step guidance
      showUniversalInstallGuide();
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
      showUniversalInstallGuide();
    }
  };

  // 5. Update existing install buttons on the page
  function updateInstallButtons(available) {
    const installBtns = document.querySelectorAll('.pwa-install-btn, [data-pwa-install], .btn-hero-download');
    installBtns.forEach((btn) => {
      if (!isStandalone) {
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

  // 7. Floating "New Update Available - Tap to Reload" Notification
  function showUpdateNotification(worker) {
    if (document.getElementById('alaska-pwa-update-banner')) return;

    // Inject required styles and keyframes if not already present
    if (!document.getElementById('alaska-pwa-update-styles')) {
      const style = document.createElement('style');
      style.id = 'alaska-pwa-update-styles';
      style.textContent = `
        @keyframes pwaSlideDown {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes pwaSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #pwa-update-reload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(56, 239, 219, 0.45);
        }
        #pwa-update-reload-btn:active {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }

    const banner = document.createElement('div');
    banner.id = 'alaska-pwa-update-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
        <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#38efdb,#0879d1);color:#041a32;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(56,239,219,0.35);flex-shrink:0;">
          <i class="fa-solid fa-arrows-rotate" style="animation: pwaSpinSlow 4s linear infinite;"></i>
        </div>
        <div style="text-align:left;min-width:0;flex:1;">
          <strong style="font-size:13.5px;font-weight:800;color:#ffffff;display:block;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            New Update Available
          </strong>
          <span style="font-size:11px;color:#94b8d7;display:block;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Tap to reload with latest features &amp; fixes
          </span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button id="pwa-update-reload-btn" style="background:linear-gradient(135deg,#38efdb,#0879d1);color:#041a32;border:none;padding:9px 16px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 12px rgba(56,239,219,0.3);white-space:nowrap;font-family:inherit;transition:all 0.2s ease;">
          <i class="fa-solid fa-rotate-right"></i> Tap to Reload
        </button>
        <button id="pwa-update-close-btn" style="background:transparent;color:#94a3b8;border:none;padding:6px 8px;font-size:18px;cursor:pointer;line-height:1;transition:color 0.2s;" aria-label="Dismiss">&times;</button>
      </div>
    `;

    Object.assign(banner.style, {
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)',
      maxWidth: '520px',
      background: 'rgba(4, 26, 50, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(56, 239, 219, 0.5)',
      borderRadius: '16px',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      zIndex: '100000',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 239, 219, 0.2)',
      animation: 'pwaSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    document.body.appendChild(banner);

    const reloadBtn = document.getElementById('pwa-update-reload-btn');
    if (reloadBtn) {
      reloadBtn.onclick = () => {
        reloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
        reloadBtn.style.pointerEvents = 'none';
        try {
          if (worker) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
          }
        } catch (e) {}
        setTimeout(() => {
          window.location.reload();
        }, 300);
      };
    }

    const closeBtn = document.getElementById('pwa-update-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        banner.remove();
      };
    }
  }

  // Allow manual testing from console: window.showAlaskaUpdatePrompt()
  window.showAlaskaUpdatePrompt = () => showUpdateNotification(null);

  // 8. Universal Install Guide Modal (iOS, Android, Desktop)
  function showUniversalInstallGuide() {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isAndroid = /android/.test(window.navigator.userAgent.toLowerCase());

    let modal = document.getElementById('alaska-universal-guide-modal');
    if (modal) modal.remove();

    let stepsHtml = '';
    let platformTitle = 'Install Alaska Tour App';

    if (isIos) {
      platformTitle = 'Install on iPhone / iPad';
      stepsHtml = `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">1</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Tap the <strong>Share</strong> button <i class="fa-solid fa-arrow-up-from-bracket" style="color:#38efdb;"></i> in your Safari toolbar (at bottom or top).</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">2</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Scroll down and tap <strong>Add to Home Screen</strong> <i class="fa-regular fa-square-plus" style="color:#38efdb;"></i>.</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">3</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Tap <strong>Add</strong> in the top right corner. App is now on your home screen!</div>
        </div>
      `;
    } else if (isAndroid) {
      platformTitle = 'Install on Android';
      stepsHtml = `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">1</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Tap the <strong>3 dots (⋮)</strong> menu in the top right corner of Chrome.</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">2</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">3</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Confirm by tapping <strong>Install</strong>. Done!</div>
        </div>
      `;
    } else {
      platformTitle = 'Install on Desktop / Laptop';
      stepsHtml = `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">1</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Look at the right side of your <strong>URL address bar</strong> at the top.</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">2</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Click the <strong>Install App icon <i class="fa-solid fa-download" style="color:#38efdb;"></i></strong> or <strong>(+)</strong>.</div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;text-align:left;">
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(56,239,219,0.2);color:#38efdb;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">3</div>
          <div style="font-size:13px;color:#e2e8f0;line-height:1.5;">Click <strong>Install</strong> to add Alaska Tour to your Desktop &amp; Start menu!</div>
        </div>
      `;
    }

    modal = document.createElement('div');
    modal.id = 'alaska-universal-guide-modal';
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(1,12,20,0.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#041a32;border:1.5px solid rgba(56,239,219,0.5);border-radius:24px;width:100%;max-width:440px;padding:28px 24px;color:white;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:pwaSlideDown 0.3s ease;">
          <div style="width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#13b8a8,#0879d1);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;box-shadow:0 6px 20px rgba(19,184,168,0.45);color:white;">
            <i class="fa-solid fa-plane-departure"></i>
          </div>
          <h3 style="font-size:19px;font-weight:800;margin-bottom:6px;color:#ffffff;">${platformTitle}</h3>
          <p style="font-size:12.5px;color:#94b8d7;margin-bottom:20px;">Follow these easy steps to get the full-screen app:</p>
          ${stepsHtml}
          <button id="close-guide-btn" style="background:linear-gradient(135deg,#13b8a8,#0879d1);color:white;border:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;width:100%;box-shadow:0 4px 15px rgba(19,184,168,0.4);">
            Got It!
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-guide-btn').onclick = () => modal.remove();
  }

  // 9. Online / Offline Connectivity Detection
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

  // Check on DOMContentLoaded: always enable buttons and show bottom banner
  document.addEventListener('DOMContentLoaded', () => {
    updateInstallButtons(!isStandalone);
    if (!isStandalone) {
      setTimeout(showInstallBanner, 1000);
    }
  });
})();
