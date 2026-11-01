# Guia Completo: Como Resolver Notificações Web Push em PWA no Android

> Este guia documenta em detalhes todos os problemas ocultos enfrentados no Android e no Google Chrome ao implementar **Web Push Notifications em PWAs (Progressive Web Apps)**, acompanhado das soluções testadas e validadas em produção no projeto **Amanhecer**.

---

## 📌 Sumário
1. [Por que Notificações em PWA quebram no Android?](#1-por-que-notificações-em-pwa-quebram-no-android)
2. [Problema 1: Workbox / VitePWA apagando o Service Worker de Push](#problema-1-workbox--vitepwa-apagando-o-service-worker-de-push)
3. [Problema 2: O erro `Registration failed - push service error` e inscrições zumbis](#problema-2-o-erro-registration-failed---push-service-error-e-inscrições-zumbis)
4. [Problema 3: Conversão e integridade da Chave VAPID (`Uint8Array`)](#problema-3-conversão-e-integridade-da-chave-vapid-uint8array)
5. [Problema 4: Perda do Gesto do Usuário (*User Gesture*) no Android](#problema-4-perda-do-gesto-do-usuário-user-gesture-no-android)
6. [Problema 5: Android 13+ e Notificações bloqueadas nas configurações do celular](#problema-5-android-13-e-notificações-bloqueadas-nas-configurações-do-celular)
7. [Problema 6: Morte prematura do Service Worker (`event.waitUntil`)](#problema-6-morte-prematura-do-service-worker-eventwaituntil)
8. [Problema 7: Chaves com aspas ou espaços no Backend (`.env`)](#problema-7-chaves-com-aspas-ou-espaços-no-backend-env)
9. [Checklist Rápido de Implementação](#checklist-rápido-de-implementação)

---

## 1. Por que Notificações em PWA quebram no Android?

No desktop, os navegadores são mais tolerantes com o ciclo de vida do Service Worker e com as permissões de notificação. No Android, o ecossistema é muito mais estrito:
* O sistema operacional coloca processos em segundo plano para dormir rapidamente para poupar bateria.
* O Google Chrome no Android conversa diretamente com o **FCM (Firebase Cloud Messaging)** do Google Play Services. Se houver qualquer inconsistência de chave ou inscrição velha, o FCM rejeita a inscrição silenciosamente com erros genéricos.
* A partir do Android 13, notificações exigem a permissão de runtime `POST_NOTIFICATIONS`. Se o usuário tiver desativado notificações para o app do Chrome nas configurações do Android, a Web API falha sem exibir popup algum.

---

## Problema 1: Workbox / VitePWA apagando o Service Worker de Push

### O Sintoma
Ao usar Vite com o plugin `vite-plugin-pwa` no modo padrão (`generateSW`), o Workbox gera um arquivo `sw.js` novo a cada build. Se você tentar colocar listeners de push (`self.addEventListener('push', ...)`) dentro desse arquivo ou criar um arquivo `sw.js` na pasta `public/`, o VitePWA **sobrescreve ou substitui** o arquivo na compilação, e as notificações nunca chegam.

### A Solução
Use a diretiva **`importScripts`** nas opções do Workbox para injetar seu código de push no Service Worker gerado automaticamente.

#### 1. Configuração no `vite.config.ts`:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Injeta o arquivo customizado no topo do Service Worker do Workbox
        importScripts: ['/sw-custom.js'],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
});
```

#### 2. Criação do arquivo `public/sw-custom.js`:
Crie o arquivo na pasta `public` (para ser servido como estático na raiz `/sw-custom.js`):

```javascript
// public/sw-custom.js

// 1. Escuta notificações enviadas pelo servidor (Web Push)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: 'Nova Notificação',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'Meu App PWA';
  const options = {
    body: data.body || 'Você tem uma nova atualização.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
  };

  // OBRIGATÓRIO: event.waitUntil mantém o Service Worker ativo até desenhar a notificação
  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se o app já estiver aberto em alguma aba/janela, apenas foca nele
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Se estiver fechado, abre a URL do app
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
```

---

## Problema 2: O erro `Registration failed - push service error` e inscrições zumbis

### O Sintoma
No Android, a chamada:
```javascript
await registration.pushManager.subscribe({ ... });
```
Lança uma exceção fatal:
```text
DOMException: Registration failed - push service error
```

### Por que acontece?
1. **Inscrição Zumbi:** O celular já possuía uma inscrição antiga salva no FCM vinculada a uma chave VAPID anterior ou em estado inválido. O Android recusa sobrescrever e gera o erro.
2. **Formato da Chave:** A chave VAPID não era um `Uint8Array` de 65 bytes válido ou continha caracteres corrompidos.

### A Solução
Antes de criar uma nova assinatura, **sempre limpe qualquer assinatura existente (`unsubscribe()`)**:

```typescript
const reg = await navigator.serviceWorker.ready;

// 1. Busca se já existe uma assinatura no aparelho
let existingSub = await reg.pushManager.getSubscription();

if (existingSub) {
  // Limpa a inscrição zumbi antes de recriar
  try {
    await existingSub.unsubscribe();
  } catch (err) {
    console.warn('Erro ao desinscrever assinatura anterior:', err);
  }
  existingSub = null;
}

// 2. Converte a chave VAPID para binário Uint8Array estrito
const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

// 3. Agora a assinatura acontece limpa, sem conflito no FCM
const newSub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: convertedKey,
});
```

---

## Problema 3: Conversão e integridade da Chave VAPID (`Uint8Array`)

### O Sintoma
O navegador rejeita a chave pública com:
```text
DOMException: The provided applicationServerKey is not valid.
```

### A Solução
A especificação Web Push exige que a chave VAPID pública seja passada como `ArrayBuffer` / `Uint8Array`. Essa chave é gerada em base64 no formato **URL-Safe** (onde `+` vira `-` e `/` vira `_`). Se você usar um simples `atob()` sem tratar os caracteres e sem recompor o padding (`=`), a conversão quebra.

Use esta função padronizada e imune a falhas:

```typescript
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Remove aspas acidentais e espaços que possam ter vindo do .env
  const cleaned = base64String.replace(/["'\s]/g, '').trim();
  
  // Recompõe o padding de base64 (=)
  const padding = '='.repeat((4 - (cleaned.length % 4)) % 4);
  const base64 = (cleaned + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
```

> **Validação Teológica/Técnica:** No padrão de curva elíptica P-256 (usado no VAPID), uma chave pública descomprimida **sempre tem exatamente 65 bytes** e o primeiro byte é sempre `0x04` (`outputArray[0] === 4`). Se seu array não tiver 65 bytes, sua chave foi cortada ou corrompida.

---

## Problema 4: Perda do Gesto do Usuário (*User Gesture*) no Android

### O Sintoma
O app tenta pedir permissão chamando `Notification.requestPermission()`, mas **nenhum diálogo aparece na tela** e a permissão é definida silenciosamente como `'denied'` ou `'default'`.

### Por que acontece?
O Chrome no Android adota a política contra abuso de popups. Se a chamada `Notification.requestPermission()` acontecer:
- Dentro de um `useEffect` ou `window.onload`.
- Após um `await fetch(...)` ou qualquer operação assíncrona demorada.
- Dentro de um `setTimeout` ou `setInterval`.

O navegador considera que o gesto do usuário expirou e bloqueia o diálogo.

### A Solução
A chamada de permissão precisa estar **diretamente conectada ao clique físico do usuário**:

```typescript
// ❌ ERRADO: O await fetch antes perde o gesto do usuário
const handleBotao = async () => {
  const dados = await fetch('/api/config').then(r => r.json());
  const perm = await Notification.requestPermission(); // BLOQUEADO PELO CHROME!
};

//  CORRETO: Pede a permissão no primeiro milissegundo do toque
const handleBotao = async () => {
  const perm = await Notification.requestPermission();
  
  if (perm === 'granted') {
    // Agora sim pode fazer chamadas assíncronas de rede
    await inscreverNoBackend();
  }
};
```

---

## Problema 5: Android 13+ e Notificações bloqueadas nas configurações do celular

### O Sintoma
Mesmo clicando no botão e disparando a função corretamente, `Notification.requestPermission()` retorna instantaneamente `'denied'` sem mostrar nada.

### Por que acontece?
No Android 13+, as notificações são um recurso gerenciado pelo sistema operacional.
1. Se as notificações do aplicativo **Google Chrome** (ou do navegador padrão do usuário) estiverem desativadas nas configurações gerais do Android (`Configurações > Apps > Chrome > Notificações: Desativadas`), a página web não tem autorização para pedir permissão.
2. Se o usuário tocou em "Bloquear" ou descartou o aviso do site 3 vezes, o Chrome entra no modo de bloqueio automático.

### A Solução
Quando `Notification.permission === 'denied'`, seu app precisa exibir uma interface clara guiando o usuário a desbloquear:

```typescript
if (Notification.permission === 'denied') {
  exibirAvisoBloqueio(
    "As notificações estão bloqueadas no seu aparelho. " +
    "Para ativar: toque no ícone de ajustes/cadeado ao lado do link no topo do navegador " +
    "(ou segure o ícone do aplicativo na tela inicial do celular) > Permissões > Notificações: mude para 'Permitir'."
  );
}
```

---

## Problema 6: Morte prematura do Service Worker (`event.waitUntil`)

### O Sintoma
O backend envia a notificação com sucesso (recebe HTTP `201 Created` do Google FCM), mas a notificação nunca vibra e nem aparece na barra de status do celular Android com a tela apagada.

### Por que acontece?
Quando a mensagem push chega pelo rádio do celular, o Android acorda o Service Worker por alguns milissegundos. Se o código fizer apenas:
```javascript
// ❌ ERRADO:
self.addEventListener('push', (event) => {
  self.registration.showNotification('Título', { ... });
});
```
Como `showNotification()` retorna uma **Promise assíncrona**, o navegador fecha o thread do Service Worker antes que a notificação seja entregue ao NotificationManager do Android.

### A Solução
Sempre utilize **`event.waitUntil()`**:
```javascript
//  CORRETO:
self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Título', {
      body: 'Texto da notificação',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
    })
  );
});
```

---

## Problema 7: Chaves com aspas ou espaços no Backend (`.env`)

### O Sintoma
No servidor (Node.js usando a biblioteca `web-push`), o envio falha com erro `401 Unauthorized` ou `400 Bad Request` com resposta do Google:
```text
WebPushError: Received unexpected response code 401
```

### Por que acontece?
Plataformas como Vercel, Railway ou arquivos `.env` locais frequentemente salvam strings com aspas literais:
```env
VAPID_PUBLIC_KEY="BL-tTNbq9Aie..."
VAPID_PRIVATE_KEY="abc123xyz..."
```
Se a biblioteca `web-push` receber a chave com as aspas ou quebras de linha (`\n`), a assinatura JWT da requisição ao FCM se torna matematicamente inválida.

### A Solução
No backend, crie uma função de sanitização antes de passar as chaves para o `web-push`:

```typescript
import webpush from 'web-push';

function cleanEnvKey(val?: string): string {
  return (val || '').replace(/["'\s]/g, '').trim();
}

const vapidPublicKey = cleanEnvKey(process.env.VAPID_PUBLIC_KEY);
const vapidPrivateKey = cleanEnvKey(process.env.VAPID_PRIVATE_KEY);
const vapidSubject = cleanEnvKey(process.env.VAPID_SUBJECT) || 'mailto:contato@meuapp.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}
```

---

## Checklist Rápido de Implementação

Ao revisar um PWA com problemas de notificação no Android, verifique item por item:

- [ ] **1. Workbox não sobrescreve o Push:** O `vite.config.ts` possui `workbox: { importScripts: ['/sw-custom.js'] }`.
- [ ] **2. Código de Push em `public/sw-custom.js`:** O arquivo possui os listeners de `push` e `notificationclick`.
- [ ] **3. Uso de `event.waitUntil`:** O `self.registration.showNotification` está envelopado em `event.waitUntil()`.
- [ ] **4. Limpeza de inscrições velhas:** Antes de chamar `pushManager.subscribe()`, chamou `existing.unsubscribe()` para evitar o erro do push service.
- [ ] **5. Conversão binária estrita:** A chave pública passa por `urlBase64ToUint8Array` (gerando 65 bytes e começando com `0x04`).
- [ ] **6. Gesto do Usuário:** `Notification.requestPermission()` é disparado no primeiro milissegundo do evento `onClick`.
- [ ] **7. Instrução de desbloqueio:** O app orienta o usuário a reativar notificações do navegador caso o status seja `'denied'`.
- [ ] **8. Sanitização de chaves no Backend:** O backend limpa aspas duplas, simples e quebras de linha das variáveis de ambiente VAPID.
