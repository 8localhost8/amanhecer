# 🚀 Amanhecer 2.0 — Guia Mestre de Deploy e Atualização (GitHub & Vercel)

Este documento contém **todas as informações, credenciais, comandos e procedimentos** que qualquer nova sessão ou desenvolvedor precisa para atualizar, compilar e subir novas versões do **Amanhecer** no **GitHub** e na **Vercel**.

---

## 📌 1. Identificação do Projeto e Links

* **Repositório GitHub:** `https://github.com/8localhost8/amanhecer.git`
* **Branch de Produção:** `main`
* **Deploy Produção Vercel:** [https://amanhecer-beta.vercel.app](https://amanhecer-beta.vercel.app)
* **Vercel Project Name:** `amanhecer`
* **Vercel Project ID:** `prj_KR5I4yjOj7BermTZBZNdo8BJq3xF`
* **Vercel Team ID:** `team_2co7EQ8UzgnxyzFXgwexpWrp`
* **Vercel Blob Storage:** `amanhecer-storage` (`store_hqe3TP8JDg1prqif`, Região São Paulo `gru1`)
* **Diretório Local do Projeto:** `c:\Users\Arthur Almeida\.gemini\antigravity\scratch\amanhecer`

---

## 🔑 2. Credenciais e Autenticação

### GitHub
* **Usuário:** `8localhost8`
* **Nome de Autor do Git:** `Arthur Almeida`
* **E-mail:** `arthuralmeida.va@gmail.com`
* **Autenticação:** Gerenciada automaticamente pelo **Git Credential Manager** do Windows (`credential.helper = manager`).
* **Push sem senha adicional:** O Git local já está autenticado para enviar diretamente com `git push origin main`.
* **Caso precise autenticar em outra máquina:**
  1. Acessar [github.com/settings/tokens](https://github.com/settings/tokens).
  2. Gerar um **Personal Access Token (classic)** com escopo `repo`.
  3. Usar o token como senha no Git.

### Vercel
* A Vercel está com **Deploy Contínuo (CI/CD) conectado ao repositório GitHub**.
* **Como funciona:** Qualquer `git push origin main` dispara automaticamente um novo build e deploy em produção na Vercel.
* **Vercel CLI / MCP Plugin:** Conectado à equipe `team_2co7EQ8UzgnxyzFXgwexpWrp` e ao projeto `prj_KR5I4yjOj7BermTZBZNdo8BJq3xF`.

---

## ⚙️ 3. Variáveis de Ambiente (Environment Variables)

Todas as variáveis já estão configuradas e ativas na Vercel (ambientes `production`, `preview` e `development`):

| Variável | Função |
| :--- | :--- |
| `VAPID_PUBLIC_KEY` | Chave pública do WebPush (usada no backend) |
| `VITE_VAPID_PUBLIC_KEY` | Chave pública exposta ao frontend Vite para registrar a inscrição push |
| `VAPID_PRIVATE_KEY` | Chave privada secreta para assinar os envios WebPush |
| `VAPID_SUBJECT` | E-mail de contato RFC 8292 (`mailto:contato@amanhecer.app`) |
| `BLOB_READ_WRITE_TOKEN` | Token de leitura/escrita do `@vercel/blob` (`amanhecer-storage`) para persistir os usuários inscritos em notificações |
| `CRON_SECRET` | Chave de autorização para os Crons da Vercel (`api/push/send-daily-verse.ts`) |
| `NOTIFICATIONS_API_KEY` | Chave para chamadas de API externas |
| `APP_URL` | URL base do app (`https://amanhecer-beta.vercel.app`) |
| `GEMINI_WRITER_API_KEY` | Chave da Google AI Gemini para geração de devocionais |
| `GEMINI_REVIEWER_API_KEY` | Chave secundária da Google AI Gemini para validação e revisão |
| `GEMINI_MODEL_NAME` | Modelo Gemini em uso (`gemini-2.5-flash`) |

---

## 🔄 4. O Fluxo de Atualização (Regra de Ouro de Novas Versões)

Toda nova atualização do app aciona o **Card de Nova Versão** no celular dos usuários. Para que esse card funcione perfeitamente, siga sempre estes passos:

### Passo 1: Atualizar o arquivo de versão
Abra o arquivo [`src/content/updates/current-update.ts`](file:///c:/Users/Arthur%20Almeida/.gemini/antigravity/scratch/amanhecer/src/content/updates/current-update.ts) e edite:
```typescript
export const CURRENT_UPDATE: AppUpdateInfo = {
  version: '2.2.2', // Suba o número da versão (ex: 2.2.2, 2.2.3, 2.3.0)
  title: 'Título da Atualização',
  date: '11 de Novembro de 2026',
  summary: 'Resumo curto de 1 linha do que mudou.',
  highlights: [
    '✨ Primeira novidade...',
    '⚡ Segunda melhoria...',
    '🛡️ Terceira correção...'
  ]
};
```

### Passo 2: Testar o build localmente
No PowerShell, dentro da pasta do projeto:
```powershell
cd "c:\Users\Arthur Almeida\.gemini\antigravity\scratch\amanhecer"
npm run build
```
*(Certifique-se de que o build concluiu sem erros de TypeScript ou Vite).*

### Passo 3: Comitar e Enviar para o GitHub
```powershell
git add .
git commit -m "feat: resumo das alterações e bump para v2.2.2"
git push origin main
```

### Passo 4: Acompanhar o Deploy
A Vercel começará o build automaticamente. O site em `https://amanhecer-beta.vercel.app` estará atualizado em ~40 segundos.
Quando os usuários abrirem o app, o sistema detectará a nova versão e exibirá o modal com as novidades e o botão de recarregar com segurança.

---

## ⚠️ 5. Pontos Críticos de Arquitetura (NUNCA QUEBRAR)

1. **Imports em `api/` (Node.js ESM):**
   * A Vercel roda Node.js em modo ES Modules. Todos os imports relativos dentro da pasta `api/` **devem conter a extensão `.js`** (exemplo: `import { getSubscriptions } from './_store.js';`), mesmo que os arquivos fonte sejam `.ts`.
2. **Prioridade de Notificações WebPush:**
   * Sempre mantenha `{ urgency: 'high', TTL: 86400 }` ao enviar pushes pelo `webpush.sendNotification()`. Isso garante que o Android entregue a notificação mesmo com tela apagada e app fechado.
3. **Processos Assíncronos na Vercel (`waitUntil`):**
   * Em endpoints de agendamento ou disparos pesados, sempre use `waitUntil()` do `@vercel/functions` para que o servidor responda `200 OK` rápido ao cliente e continue o processamento em segundo plano sem ser cancelado.
4. **Atualização do PWA (Service Worker):**
   * Nunca use `caches.delete()` manualmente ao atualizar o app. O fluxo oficial de atualização usa `SKIP_WAITING` + `controllerchange`, preservando as notas do usuário (`notes`), nome (`userName`) e versículos favoritos no `localStorage`.

---

## 💻 6. Comandos Rápidos de Terminal

```powershell
# Entrar na pasta do projeto
cd "c:\Users\Arthur Almeida\.gemini\antigravity\scratch\amanhecer"

# Rodar servidor local de desenvolvimento
npm run dev

# Fazer build de produção
npm run build

# Ver status das alterações do Git
git status -s

# Subir alterações para o GitHub e Vercel
git add .
git commit -m "mensagem"
git push origin main

# Ver logs dos últimos deploys
git log -3 --oneline
```
