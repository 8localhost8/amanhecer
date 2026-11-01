/**
 * Active PWA Auto-Updater
 * Ensures installed PWAs (Android, iOS, Desktop) automatically detect, activate,
 * and apply new deployments without ever requiring the user to uninstall/reinstall.
 */
export function initPWAUpdater(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  let isRefreshing = false;

  // When a new Service Worker takes control, reload immediately to serve fresh assets
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isRefreshing) return;
    isRefreshing = true;
    window.location.reload();
  });

  const checkForUpdates = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      // If there's already a waiting worker, tell it to activate immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        return;
      }

      // Listen for newly discovered workers
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Force network check for a newer sw.js
      await registration.update();
    } catch (err) {
      // Ignore offline errors during update check
      console.debug('[PWA Updater] Verificação silenciosa de atualização:', err);
    }
  };

  // 1. Check on initial load
  if (document.readyState === 'complete') {
    checkForUpdates();
  } else {
    window.addEventListener('load', checkForUpdates, { once: true });
  }

  // 2. Check every time the user brings the installed PWA to the foreground
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  });

  // 3. Check when network connection is restored
  window.addEventListener('online', () => {
    checkForUpdates();
  });

  // 4. Periodic background check every 3 minutes while open
  setInterval(checkForUpdates, 3 * 60 * 1000);
}
