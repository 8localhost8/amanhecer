import { saveUserPreferences, loadUserPreferences } from '../../storage/preferences';
import { getCompletion, markCompletionSynced } from '../../storage/db';
import { selectDailyVerse, getSaoPauloDateString } from '../daily-verse/selection-engine';

export interface PushStatus {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  mode?: 'web-push' | 'local-sw' | 'none';
}

export const DEFAULT_VAPID_PUBLIC_KEY =
  'BL-tTNbq9Aie-CPWNHJbseDn8QmCEUaO5tpsJRo_6bcvOuBg9b4dmIZIe1gvmiebzNiaWfYtFI3RHoTy5ZwLvRk';

const LOCAL_NOTIF_STATE_KEY = 'amanhecer_local_notif_state_v1';

interface LocalNotifTrackingState {
  trackingDate: string;
  lastVerseSentDate?: string;
  notifiedSlotsToday: string[];
}

function loadLocalNotifState(todayStr: string): LocalNotifTrackingState {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalNotifTrackingState;
      if (parsed.trackingDate === todayStr) {
        return {
          trackingDate: todayStr,
          lastVerseSentDate: parsed.lastVerseSentDate,
          notifiedSlotsToday: Array.isArray(parsed.notifiedSlotsToday) ? parsed.notifiedSlotsToday : [],
        };
      }
      return {
        trackingDate: todayStr,
        lastVerseSentDate: parsed.lastVerseSentDate,
        notifiedSlotsToday: [],
      };
    }
  } catch {
    // ignore storage errors
  }
  return { trackingDate: todayStr, notifiedSlotsToday: [] };
}

function saveLocalNotifState(state: LocalNotifTrackingState): void {
  try {
    localStorage.setItem(LOCAL_NOTIF_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

/**
 * Checks if Notifications API exists in this browser/device
 */
export function checkPushSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Safely requests OS notification permission supporting both Promise and callback
 */
export async function requestOSNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!checkPushSupport()) return 'unsupported';
  try {
    const result = Notification.requestPermission();
    if (result && typeof (result as any).then === 'function') {
      return await result;
    }
    return Notification.permission;
  } catch {
    return Notification.permission || 'default';
  }
}

/**
 * Dispatches a REAL system notification in the Android/iOS/Desktop notification bar
 * via ServiceWorkerRegistration.showNotification. Returns false if OS permission is not granted.
 */
export async function showAppNotification(
  title: string,
  options?: NotificationOptions & { vibrate?: number[]; renotify?: boolean; actions?: any[] }
): Promise<boolean> {
  if (!checkPushSupport() || Notification.permission !== 'granted') {
    return false;
  }

  const finalOptions: any = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    ...options,
  };

  // 1. ServiceWorkerRegistration.showNotification (Required on Android Chrome/Brave/Samsung & PWAs)
  if ('serviceWorker' in navigator) {
    try {
      const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.ready);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, finalOptions);
        return true;
      }
    } catch {
      // fallback below
    }

    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: finalOptions,
        });
        return true;
      }
    } catch {
      // fallback below
    }
  }

  // 2. Desktop fallback
  try {
    new Notification(title, finalOptions);
    return true;
  } catch {
    return false;
  }
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
      mode: 'none',
    };
  }

  const permission = Notification.permission;
  const prefs = loadUserPreferences();
  let hasWebPushSub = false;

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        hasWebPushSub = !!sub;
      }
    } catch {
      // ignore
    }
  }

  const isSubscribed = permission === 'granted' && (hasWebPushSub || prefs.notificationsEnabled);

  return {
    isSupported: true,
    permission,
    isSubscribed,
    mode: hasWebPushSub ? 'web-push' : isSubscribed ? 'local-sw' : 'none',
  };
}

/**
 * Sanitizes and decodes a VAPID public key, falling back to DEFAULT_VAPID_PUBLIC_KEY
 */
function getValidVapidUint8Array(customKey?: string): Uint8Array {
  const rawEnvKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY;
  const candidates = [customKey, rawEnvKey, DEFAULT_VAPID_PUBLIC_KEY].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const cleaned = candidate.replace(/["'\s]/g, '').trim();
      if (!cleaned) continue;
      const arr = urlBase64ToUint8Array(cleaned);
      // Uncompressed P-256 public key must be 65 bytes starting with 0x04
      if (arr.length === 65 && arr[0] === 0x04) {
        return arr;
      }
    } catch {
      // try next candidate
    }
  }

  return urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
}

/**
 * Requests OS notification permission and subscribes the user.
 * If notifications are disabled in the default browser or Android system settings,
 * returns success: false so the UI can guide the user to enable them in their default browser.
 */
export async function requestAndSubscribePush(
  vapidPublicKey?: string,
  forceRefresh = false,
  preRequestedPermission?: NotificationPermission | 'unsupported'
): Promise<{
  success: boolean;
  permission?: NotificationPermission | 'unsupported';
  mode?: 'web-push' | 'local-sw';
  error?: string;
}> {
  if (!checkPushSupport()) {
    return {
      success: false,
      permission: 'unsupported',
      error: 'Este navegador não suporta notificações do sistema.',
    };
  }

  try {
    const permission = preRequestedPermission || (await requestOSNotificationPermission());

    if (permission !== 'granted') {
      saveUserPreferences({ notificationsEnabled: false });
      return {
        success: false,
        permission,
        error:
          'As notificações do seu navegador padrão estão desativadas no celular. Ative as notificações do navegador padrão nas configurações do aparelho para receber os avisos.',
      };
    }

    // Permission is genuinely granted by the OS/Browser!
    const prefs = saveUserPreferences({
      notificationsEnabled: true,
      dailyVerseEnabled: true,
      reminderEnabled: true,
      notifBugfixV23Seen: true,
      notifBugfixV24Seen: true,
      notifBugfixV25Seen: true,
    });

    let subscription: PushSubscription | null = null;

    // Attempt Web Push subscription if supported by the browser
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        subscription = await reg.pushManager.getSubscription();

        if (subscription && forceRefresh) {
          await subscription.unsubscribe().catch(() => {});
          subscription = null;
        }

        if (!subscription) {
          const convertedVapidKey = getValidVapidUint8Array(vapidPublicKey);
          try {
            subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey as any,
            });
          } catch {
            // If a stale/corrupted subscription existed, clear and retry once with default key
            const existing = await reg.pushManager.getSubscription();
            if (existing) {
              await existing.unsubscribe().catch(() => {});
            }
            const fallbackKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
            subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: fallbackKey as any,
            });
          }
        }
      } catch (pushErr) {
        console.info(
          'Usando notificações nativas via Service Worker (Push Service externo bloqueado pelo navegador).',
          pushErr
        );
      }
    }

    // If Web Push subscription succeeded, register anonymously with backend
    if (subscription) {
      const subData = subscription.toJSON();
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
        // Offline or backend unreachable; Service Worker notification engine still active
      }
    }

    // Sync schedule with Service Worker & register Periodic Background Sync if available
    await syncNotificationScheduleWithSW();

    // Dispatch a REAL OS notification in the Android/iOS/Desktop status bar
    await showAppNotification('☀️ Notificações Ativadas — Amanhecer', {
      body: 'Tudo pronto! Você receberá o Versículo do Dia às 06:06 e seus lembretes diários.',
      tag: 'amanhecer-welcome-notif',
    });

    return {
      success: true,
      permission: 'granted',
      mode: subscription ? 'web-push' : 'local-sw',
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        'Não foi possível ativar. Verifique se as notificações do seu navegador padrão estão ligadas.',
    };
  }
}

/**
 * Sends an immediate REAL system test notification in the device's notification bar
 */
export async function sendTestNotification(): Promise<{ success: boolean; error?: string }> {
  if (!checkPushSupport()) {
    return { success: false, error: 'Este navegador não suporta notificações.' };
  }

  if (Notification.permission !== 'granted') {
    const res = await requestAndSubscribePush();
    if (!res.success) return res;
  }

  const todayStr = getSaoPauloDateString();
  const verse = selectDailyVerse(todayStr);

  // 1. Show real system notification via Service Worker
  const shown = await showAppNotification('☀️ Versículo do Dia — Amanhecer', {
    body: `${verse.reference} — "${verse.text.slice(0, 120)}${verse.text.length > 120 ? '...' : ''}"`,
    tag: `amanhecer-test-${Date.now()}`,
  });

  // 2. Also trigger Web Push test if an endpoint subscription is active and local SW didn't show
  if (!shown && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const subData = sub.toJSON();
        await fetch('/api/push/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subData.endpoint,
            keys: subData.keys,
          }),
        });
        return { success: true };
      }
    } catch {
      // ignore
    }
  }

  if (!shown) {
    return {
      success: false,
      error:
        'As notificações do seu navegador padrão estão desativadas nas configurações do Android. Ative-as para receber os avisos na barra do celular.',
    };
  }

  return { success: true };
}

/**
 * Unsubscribes from push notifications
 */
export async function unsubscribePush(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe().catch(() => {});

        fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {});
      }
    }

    saveUserPreferences({
      notificationsEnabled: false,
      pushSubscriptionToken: null,
    });
    await syncNotificationScheduleWithSW();
    return true;
  } catch {
    saveUserPreferences({
      notificationsEnabled: false,
      pushSubscriptionToken: null,
    });
    return false;
  }
}

/**
 * Synchronizes completion with backend AND Service Worker so reminders stop immediately
 */
export async function syncCompletionWithPushServer(dateStr: string): Promise<void> {
  await syncNotificationScheduleWithSW();

  const prefs = loadUserPreferences();
  const completion = await getCompletion(dateStr);

  if (!completion || completion.syncedWithPush) return;

  try {
    let endpoint = prefs.pushSubscriptionToken;
    if (!endpoint && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
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

/**
 * Synchronizes user notification preferences, today's verse, and reading completion state
 * with the Service Worker and checks if any scheduled notification is due right now.
 */
export async function syncNotificationScheduleWithSW(): Promise<void> {
  if (!checkPushSupport()) return;

  const prefs = loadUserPreferences();
  const todayStr = getSaoPauloDateString();
  const verse = selectDailyVerse(todayStr);
  const completion = await getCompletion(todayStr);
  const localState = loadLocalNotifState(todayStr);

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.active) {
        reg.active.postMessage({
          type: 'SYNC_NOTIFICATION_SCHEDULE',
          payload: {
            notificationsEnabled: prefs.notificationsEnabled && Notification.permission === 'granted',
            dailyVerseEnabled: prefs.dailyVerseEnabled,
            reminderEnabled: prefs.reminderEnabled,
            lastReadDate: completion ? todayStr : null,
            verseReference: verse.reference,
            verseText: verse.text,
            trackingDate: todayStr,
            lastVerseSentDate: localState.lastVerseSentDate,
            notifiedSlotsToday: localState.notifiedSlotsToday,
          },
        });
      }

      // Register Periodic Background Sync if browser supports it
      if (reg && 'periodicSync' in reg) {
        try {
          await (reg as any).periodicSync.register('amanhecer-daily-check', {
            minInterval: 30 * 60 * 1000, // 30 minutes
          });
        } catch {
          // Periodic background sync optional
        }
      }
    } catch {
      // ignore SW sync errors
    }
  }

  await checkAndTriggerLocalScheduledNotifications();
}

function getSaoPauloTimeParts(): { dateStr: string; totalMinutes: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const hour = parseInt(map.hour || '0', 10);
  const minute = parseInt(map.minute || '0', 10);
  return { dateStr, totalMinutes: hour * 60 + minute };
}

/**
 * Checks in-app / background timer if 06:06 Daily Verse or 11:00/16:00/21:00 Reminder is due
 */
export async function checkAndTriggerLocalScheduledNotifications(): Promise<void> {
  if (!checkPushSupport() || Notification.permission !== 'granted') return;

  const prefs = loadUserPreferences();
  if (!prefs.notificationsEnabled) return;

  const { dateStr, totalMinutes } = getSaoPauloTimeParts();
  const state = loadLocalNotifState(dateStr);
  const verse = selectDailyVerse(dateStr);
  const completion = await getCompletion(dateStr);
  let mutated = false;

  // 1. 06:06 Daily Verse
  if (
    prefs.dailyVerseEnabled &&
    totalMinutes >= 6 * 60 + 6 &&
    state.lastVerseSentDate !== dateStr
  ) {
    const sent = await showAppNotification('☀️ Versículo do Dia — Amanhecer', {
      body: `${verse.reference} — "${verse.text.slice(0, 120)}${verse.text.length > 120 ? '...' : ''}"`,
      tag: `amanhecer-verse-${dateStr}`,
      renotify: false,
    });
    if (sent) {
      state.lastVerseSentDate = dateStr;
      mutated = true;
    }
  }

  // 2. Reading Reminders (06:00, 11:00, 16:00, 21:00) if today's devotional is not read
  if (prefs.reminderEnabled && !completion) {
    const slots = [
      {
        id: '06:00',
        start: 6 * 60,
        end: 10 * 60 + 59,
        skipIfDailyVerse: true,
        title: 'Amanhecer • Bom dia!',
        body: 'Inicie seu dia na presença de Deus. Seu devocional matinal já está disponível.',
      },
      {
        id: '11:00',
        start: 11 * 60,
        end: 15 * 60 + 59,
        skipIfDailyVerse: false,
        title: 'Amanhecer • Pausa do Meio-Dia',
        body: 'Uma pausa serena no meio das tarefas. Reserve alguns minutos para a Palavra e oração.',
      },
      {
        id: '16:00',
        start: 16 * 60,
        end: 20 * 60 + 59,
        skipIfDailyVerse: false,
        title: 'Amanhecer • Fim de Tarde',
        body: 'Refrigere a sua alma neste fim de tarde com uma reflexão bíblica edificante.',
      },
      {
        id: '21:00',
        start: 21 * 60,
        end: 23 * 60 + 59,
        skipIfDailyVerse: false,
        title: 'Amanhecer • Oração da Noite',
        body: 'Entregue as lutas de hoje e descanse na fidelidade de Deus antes de dormir.',
      },
    ];

    for (const slot of slots) {
      if (slot.skipIfDailyVerse && prefs.dailyVerseEnabled) continue;
      const slotKey = `${dateStr}_${slot.id}`;
      if (
        totalMinutes >= slot.start &&
        totalMinutes <= slot.end &&
        !state.notifiedSlotsToday.includes(slotKey)
      ) {
        const sent = await showAppNotification(slot.title, {
          body: slot.body,
          tag: `amanhecer-reminder-${slotKey}`,
          renotify: false,
        });
        if (sent) {
          state.notifiedSlotsToday.push(slotKey);
          mutated = true;
        }
      }
    }
  }

  if (mutated) {
    saveLocalNotifState(state);
  }
}

let schedulerInitialized = false;

/**
 * Initializes the autonomous notification scheduler loop on the client
 */
export function initLocalNotificationScheduler(): void {
  if (typeof window === 'undefined' || schedulerInitialized) return;
  schedulerInitialized = true;

  // Initial sync after load
  setTimeout(() => {
    syncNotificationScheduleWithSW();
  }, 2000);

  // Check every 45 seconds while app is open or in background memory
  setInterval(() => {
    checkAndTriggerLocalScheduledNotifications();
  }, 45 * 1000);

  // Check when user returns to app or reconnects
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncNotificationScheduleWithSW();
    }
  });
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
