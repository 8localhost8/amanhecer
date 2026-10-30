# Guia de Deploy na Vercel e Configuração de Automações — Amanhecer 2.0

## 1. Deploy na Vercel

### Passo 1: Conectar o Repositório GitHub
1. Acesse o painel da [Vercel](https://vercel.com).
2. Clique em **"Add New Project"** e importe o repositório do Amanhecer.
3. Framework Preset: **Vite**.
4. Root Directory: `./` (ou subdiretório correspondente se monorepo).

### Passo 2: Configurar Variáveis de Ambiente na Vercel
No menu **Settings > Environment Variables**, adicione:
- `GEMINI_WRITER_API_KEY`: Chave do Google Gemini Escritor
- `GEMINI_REVIEWER_API_KEY`: Chave do Google Gemini Revisor
- `VAPID_PUBLIC_KEY`: Chave pública VAPID (ex: `BEl62iUY...`)
- `VITE_VAPID_PUBLIC_KEY`: Mesma chave pública VAPID (exposta ao client para inscrição)
- `VAPID_PRIVATE_KEY`: Chave privada VAPID
- `VAPID_SUBJECT`: `mailto:contato@amanhecer.app`
- `CRON_SECRET`: Token seguro para autorizar cron jobs da Vercel ou chamadas do GitHub Actions
- `EDITORIAL_POLICY`: `REVIEW`

### Passo 3: Deploy
Clique em **Deploy**. A Vercel criará automaticamente os builds estáticos do Vite PWA e roteará as rotas `/api/*` para as funções serverless.

---

## 2. Configurar GitHub Actions Secrets

No repositório do GitHub, acesse **Settings > Secrets and variables > Actions**:
- `GEMINI_WRITER_API_KEY`
- `GEMINI_REVIEWER_API_KEY`
- `APP_URL`: URL oficial do app na Vercel (ex: `https://amanhecer.app`)
- `CRON_SECRET`: Mesmo segredo configurado na Vercel
