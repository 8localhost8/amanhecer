# Diretrizes de Segurança — Amanhecer 2.0

## 1. Proteção de Credenciais e Segredos

- As chaves de API `GEMINI_WRITER_API_KEY`, `GEMINI_REVIEWER_API_KEY`, `VAPID_PRIVATE_KEY` e `CRON_SECRET` residem exclusivamente como **GitHub Secrets** ou **Vercel Environment Variables**.
- Nenhuma chave secreta possui o prefixo `VITE_` e nenhuma credencial privada é incluída nos bundles de produção do cliente.

---

## 2. Cabeçalhos de Segurança HTTP (Vercel)

Configurados em `vercel.json`:
- `X-Content-Type-Options: nosniff`: Previne sniffing de MIME types.
- `X-Frame-Options: DENY`: Previne ataques de clickjacking.
- `X-XSS-Protection: 1; mode=block`: Proteção ativa contra Cross-Site Scripting.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimiza vazamento de dados de referência.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Bloqueia acesso a sensores de hardware desnecessários ao app.

---

## 3. Autorização de Endpoints Serverless

Os endpoints de envio de push (`/api/push/send-daily-verse` e `/api/push/send-reminders`) exigem cabeçalho `Authorization: Bearer <CRON_SECRET>` para impedir acionamentos externos não autorizados.
