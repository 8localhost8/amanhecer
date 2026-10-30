# Infraestrutura de Notificações Web Push — Amanhecer 2.0

## 1. Visão Geral

O sistema de notificações do Amanhecer opera através dos padrões oficiais da **Web Push API** (VAPID + Service Worker), funcionando tanto em dispositivos móveis Android e iOS quanto em computadores com o aplicativo fechado.

> [!NOTE]
> Não utilizamos `setInterval` de navegador como mecanismo principal para notificações com app fechado.

---

## 2. Horários e Regras de Coexistência

1. **Notificação das 06:06 (Versículo do Dia):**
   - Fuso: `America/Sao_Paulo`.
   - Independente da conclusão da leitura: mesmo que a pessoa já tenha concluído, ela recebe o versículo se autorizou.
   - Substitui o lembrete de leitura das 06:00.
2. **Lembretes de Leitura Pendente:**
   - Horários: **11:00, 16:00 e 21:00** (e 06:00 caso o versículo esteja desativado).
   - **Condição Crítica:** Se o leitor já confirmou a leitura hoje (`lastReadDate === today`), o lembrete NÃO é enviado.
   - **Prevenção de Duplicatas:** O sistema registra cada slot enviado no dia e bloqueia reenvios acidentais.

---

## 3. Endpoints Serverless na Vercel

- `POST /api/push/subscribe`: Registra inscrição com endpoint técnico, chaves `p256dh`/`auth`, fuso e preferências de categorias.
- `POST /api/push/unsubscribe`: Cancela inscrição e remove do armazenamento.
- `POST /api/push/sync-completion`: Notifica o servidor da leitura concluída no dispositivo para suspender lembretes imediatos.
- `POST /api/push/send-daily-verse`: Executado às 06:06 via cron ou workflow seguro.
- `POST /api/push/send-reminders`: Executado nos slots com validação de leitura e autorização `CRON_SECRET`.
