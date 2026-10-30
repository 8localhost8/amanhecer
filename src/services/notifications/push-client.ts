import { saveUserPreferences, loadUserPreferences } from '../../storage/preferences';
import { getCompletion, markCompletionSynced } from '../../storage/db';

export interface PushStatus {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
}

/**
 * Checks if Service Worker and Web Push are supported in this browser
 */
export function checkPushSupport(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Returns current notification permission and status
 */
export async function getPushStatus(): Promise<PushStatus> {
  if (!checkPushSupport()) {
    return {
      isSupported: false,
      permission: 'unsupported',
      isSubscribed: false,
    };
  }

  const permission = Notification.permission;
  let isSubscribed = false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    isSubscribed = !!sub;
  } catch (err) {
    console.warn('Erro ao verificar inscrição push:', err);
  }

  return {
    isSupported: true,
    permission,
    isSubscribed,
  };
}

/**
 * Requests permission and subscribes the user anonymously
 */
export async function requestAndSubscribePush(
  vapidPublicKey?: string
): Promise<{ success: boolean; error?: string }> {
  if (!checkPushSupport()) {
    return { success: false, error: 'Notificações push não são suportadas neste navegador/dispositivo.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      saveUserPreferences({ notificationsEnabled: false });
      return { success: false, error: 'Permissão para notificações foi recusada nas configurações do navegador.' };
    }

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      // Default sample VAPID public key if not configured in environment
      const key = vapidPublicKey || (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      const convertedVapidKey = urlBase64ToUint8Array(key);

      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    const prefs = loadUserPreferences();
    const subData = subscription.toJSON();

    // Register with anonymous backend
    try {
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subData.endpoint,
          keys: subData.keys,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
          dailyVerseEnabled: prefs.dailyVerseEnabled,
          reminderEnabled: prefs.reminderEnabled,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        saveUserPreferences({
          notificationsEnabled: true,
          pushSubscriptionToken: data.token || subData.endpoint,
        });
      }
    } catch {
      // Offline or backend temporarily unreachable; still save local permission
      saveUserPreferences({ notificationsEnabled: true });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao ativar notificações.' };
  }
}

/**
 * Unsubscribes from push notifications
 */
export async function unsubscribePush(): Promise<boolean> {
  if (!checkPushSupport()) return true;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }

    saveUserPreferences({
      notificationsEnabled: false,
      pushSubscriptionToken: null,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Synchronizes completion with backend so reminders stop immediately
 */
export async function syncCompletionWithPushServer(dateStr: string): Promise<void> {
  const prefs = loadUserPreferences();
  const completion = await getCompletion(dateStr);

  if (!completion || completion.syncedWithPush) return;

  try {
    let endpoint = prefs.pushSubscriptionToken;
    if (!endpoint && checkPushSupport()) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) endpoint = sub.endpoint;
    }

    if (endpoint) {
      const res = await fetch('/api/push/sync-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          date: dateStr,
          completedAt: completion.completedAt,
        }),
      });

      if (res.ok) {
        await markCompletionSynced(dateStr);
      }
    }
  } catch {
    // Offline; will retry when online event fires
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
