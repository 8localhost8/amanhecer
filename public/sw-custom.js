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
  const hour = parseInt(map.hour || '0', 10) % 24;
  const minute = parseInt(map.minute || '0', 10);
  return { dateStr, hour, minute, totalMinutes: hour * 60 + minute };
}

/**
 * Fallback local em background (Periodic Sync) apenas para aparelhos sem Web Push ativo
 * e estritamente dentro da janela de 45 minutos de cada horário para jamais atrasar notificações.
 */
async function checkAndDispatchDueNotifications() {
  const state = await readScheduleState();
  if (!state || !state.notificationsEnabled) return;

  // Se o dispositivo possui inscrição Web Push ativa no servidor, o disparo vem via evento 'push'
  if (state.hasWebPushSub) return;

  const { dateStr, totalMinutes } = getSaoPauloNow();
  let mutated = false;

  if (state.trackingDate !== dateStr) {
    state.trackingDate = dateStr;
    state.notifiedSlotsToday = [];
    mutated = true;
  }

  state.notifiedSlotsToday = state.notifiedSlotsToday || [];

  // 1. Check 06:06 Daily Verse (estritamente entre 06:06 e 06:50 BRT)
  if (
    state.dailyVerseEnabled &&
    totalMinutes >= 6 * 60 + 6 &&
    totalMinutes <= 6 * 60 + 50 &&
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

  // 2. Check Reading Reminders (janelas estritas de 45 minutos para nunca disparar Fim de Tarde às 21:00)
  if (state.reminderEnabled && state.lastReadDate !== dateStr) {
    const slots = [
      {
        id: '06:00',
        start: 6 * 60,
        end: 6 * 60 + 45,
        skipIfDailyVerse: true,
        title: 'Amanhecer • Bom dia!',
        body: 'Inicie seu dia na presença de Deus. Seu devocional matinal já está disponível.',
      },
      {
        id: '11:00',
        start: 11 * 60,
        end: 11 * 60 + 45,
        skipIfDailyVerse: false,
        title: 'Amanhecer • Pausa do Meio-Dia',
        body: 'Uma pausa serena no meio das tarefas. Reserve alguns minutos para a Palavra e oração.',
      },
      {
        id: '16:00',
        start: 16 * 60,
        end: 16 * 60 + 45,
        skipIfDailyVerse: false,
        title: 'Amanhecer • Fim de Tarde',
        body: 'Refrigere a sua alma neste fim de tarde com uma reflexão bíblica edificante.',
      },
      {
        id: '21:00',
        start: 21 * 60,
        end: 21 * 60 + 45,
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

// 1. Web Push Event Listener (Recebe notificações da nuvem com o app 100% fechado)
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
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

      const { dateStr } = getSaoPauloNow();
      const notifType = data.data?.type;
      const notifSlot = data.data?.slot;

      // Atualiza imediatamente o estado local do Service Worker para evitar qualquer duplicidade
      try {
        const state = (await readScheduleState()) || {};
        if (state.trackingDate !== dateStr) {
          state.trackingDate = dateStr;
          state.notifiedSlotsToday = [];
        }
        state.notifiedSlotsToday = state.notifiedSlotsToday || [];
        if (notifType === 'daily-verse') {
          state.lastVerseSentDate = dateStr;
        } else if (notifType === 'reading-reminder' && notifSlot) {
          const key = `${dateStr}_${notifSlot}`;
          if (!state.notifiedSlotsToday.includes(key)) {
            state.notifiedSlotsToday.push(key);
          }
        }
        await writeScheduleState(state);
      } catch {
        // ignore state update errors
      }

      const title = data.title || 'Amanhecer • Devocional Diário';
      const targetUrl = data.data?.url || '/';
      const tag =
        data.tag ||
        (notifType === 'daily-verse'
          ? `amanhecer-verse-${dateStr}`
          : notifType === 'reading-reminder' && notifSlot
          ? `amanhecer-reminder-${dateStr}_${notifSlot}`
          : `amanhecer-push-${Date.now()}`);

      const options = {
        body: data.body || 'Um momento com Deus para hoje.',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        tag,
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: targetUrl, timestamp: Date.now() },
        actions: [
          { action: 'open', title: 'Ler Devocional' },
          { action: 'dismiss', title: 'Fechar' },
        ],
      };

      try {
        await self.registration.showNotification(title, options);
      } catch (err) {
        try {
          await self.registration.showNotification(title, {
            body: options.body,
            icon: '/icons/icon-192x192.png',
            tag,
          });
        } catch (fallbackErr) {
          console.error('Erro crítico ao exibir notificação:', fallbackErr);
        }
      }
    })()
  );
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

// 3. Client Message Listener (Salva estado de leitura sem disparar notificação atrasada ao abrir o app!)
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
