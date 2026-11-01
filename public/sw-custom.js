// Amanhecer PWA - Service Worker Engine for Web Push, Local Notifications & Autonomous Schedule
const STATE_CACHE_NAME = 'amanhecer-notification-state-v1';
const STATE_CACHE_KEY = '/__amanhecer_notification_state__.json';

async function readScheduleState() {
  try {
    const cache = await caches.open(STATE_CACHE_NAME);
    const res = await cache.match(STATE_CACHE_KEY);
    if (res) {
      return await res.json();
    }
  } catch (err) {
    // ignore cache read errors
  }
  return null;
}

async function writeScheduleState(state) {
  try {
    const cache = await caches.open(STATE_CACHE_NAME);
    await cache.put(
      STATE_CACHE_KEY,
      new Response(JSON.stringify(state), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch (err) {
    // ignore cache write errors
  }
}

function getSaoPauloNow() {
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
  const map = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const hour = parseInt(map.hour || '0', 10);
  const minute = parseInt(map.minute || '0', 10);
  return { dateStr, hour, minute, totalMinutes: hour * 60 + minute };
}

async function checkAndDispatchDueNotifications() {
  const state = await readScheduleState();
  if (!state || !state.notificationsEnabled) return;

  const { dateStr, totalMinutes } = getSaoPauloNow();
  let mutated = false;

  // Reset daily tracking if date changed
  if (state.trackingDate !== dateStr) {
    state.trackingDate = dateStr;
    state.notifiedSlotsToday = [];
    mutated = true;
  }

  state.notifiedSlotsToday = state.notifiedSlotsToday || [];

  // 1. Check 06:06 Daily Verse (between 06:06 and 10:59 if not sent today)
  if (
    state.dailyVerseEnabled &&
    totalMinutes >= 6 * 60 + 6 &&
    state.lastVerseSentDate !== dateStr
  ) {
    const verseRef = state.verseReference || 'Provérbios 3:5-6';
    const verseText =
      state.verseText ||
      'Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento.';

    await self.registration.showNotification('☀️ Versículo do Dia — Amanhecer', {
      body: `${verseRef} — "${verseText.slice(0, 120)}${verseText.length > 120 ? '...' : ''}"`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `amanhecer-verse-${dateStr}`,
      renotify: false,
      vibrate: [100, 50, 100],
      data: { url: `/?date=${dateStr}&source=sw-daily-verse` },
    });

    state.lastVerseSentDate = dateStr;
    mutated = true;
  }

  // 2. Check Reading Reminders (stop immediately if today's devotional is completed)
  if (state.reminderEnabled && state.lastReadDate !== dateStr) {
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
      if (slot.skipIfDailyVerse && state.dailyVerseEnabled) continue;
      const slotKey = `${dateStr}_${slot.id}`;
      if (
        totalMinutes >= slot.start &&
        totalMinutes <= slot.end &&
        !state.notifiedSlotsToday.includes(slotKey)
      ) {
        await self.registration.showNotification(slot.title, {
          body: slot.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `amanhecer-reminder-${slotKey}`,
          renotify: false,
          vibrate: [100, 50, 100],
          data: { url: `/?date=${dateStr}&source=sw-reminder-${slot.id}` },
        });
        state.notifiedSlotsToday.push(slotKey);
        mutated = true;
      }
    }
  }

  if (mutated) {
    await writeScheduleState(state);
  }
}

// 1. Web Push Event Listener
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: 'Amanhecer • Devocional Diário',
        body: event.data.text() || 'Um momento com Deus para hoje.',
      };
    }
  }

  const title = data.title || 'Amanhecer • Devocional Diário';
  const options = {
    body: data.body || 'Um momento com Deus para hoje.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    tag: data.tag || `amanhecer-push-${Date.now()}`,
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: 'Ler Devocional' },
      { action: 'dismiss', title: 'Fechar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. Client Message Listener (Immediate Notification & Schedule Sync)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'Amanhecer', {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        ...(options || {}),
      })
    );
    return;
  }

  if (event.data.type === 'SYNC_NOTIFICATION_SCHEDULE') {
    const incoming = event.data.payload || {};
    event.waitUntil(
      (async () => {
        const existing = (await readScheduleState()) || {};
        const merged = {
          ...existing,
          ...incoming,
          lastVerseSentDate:
            incoming.lastVerseSentDate || existing.lastVerseSentDate || null,
          notifiedSlotsToday:
            incoming.notifiedSlotsToday || existing.notifiedSlotsToday || [],
        };
        await writeScheduleState(merged);
        await checkAndDispatchDueNotifications();
      })()
    );
  }
});

// 4. Periodic Background Sync & Sync Listeners
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'amanhecer-daily-check') {
    event.waitUntil(checkAndDispatchDueNotifications());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'amanhecer-daily-check') {
    event.waitUntil(checkAndDispatchDueNotifications());
  }
});
