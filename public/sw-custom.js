// Amanhecer PWA - Custom Service Worker Logic for Push Notifications and Offline Caching

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Amanhecer • Devocional Diário';
    const options = {
      body: data.body || 'Um momento com Deus para hoje.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || { url: '/' },
      actions: [
        { action: 'open', title: 'Ler Devocional' },
        { action: 'dismiss', title: 'Fechar' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Erro ao processar evento de push:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
