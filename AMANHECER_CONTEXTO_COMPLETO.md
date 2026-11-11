# 🌅 Amanhecer 2.0 — Contexto Completo do Projeto e Sessão

Este documento contém todo o histórico técnico, arquitetura, decisões tomadas, estado atual e próximos passos do projeto **Amanhecer 2.0**. Use este arquivo para inicializar qualquer nova sessão do agente ou desenvolvedor.

---

## 📌 1. Visão Geral do Projeto

* **Nome:** Amanhecer (Devocional Bíblico Diário Cristão)
* **Objetivo:** Aplicativo de devocional cristão diário ultra-rápido, minimalista e acessível para todas as faixas etárias (desde jovens a idosos).
* **Filosofia de Aquisição:** `Usuário entra no site -> Instala em 1 toque (PWA)`.
* **Zero Fricção:** Sem tela de login/cadastro, sem senhas, sem barreiras de entrada.
* **Orçamento / Licenças:** Projeto gratuito sem taxa de desenvolvedor da Google Play (\$25).
* **Repositório GitHub:** [https://github.com/8localhost8/amanhecer.git](https://github.com/8localhost8/amanhecer.git)
* **Deploy Produção Vercel:** [https://amanhecer-beta.vercel.app](https://amanhecer-beta.vercel.app)
* **Vercel Project ID:** `prj_KR5I4yjOj7BermTZBZNdo8BJq3xF`
* **Vercel Team ID:** `team_2co7EQ8UzgnxyzFXgwexpWrp`
* **Vercel Blob Store:** `amanhecer-storage` (`store_hqe3TP8JDg1prqif`)
* **Último Commit:** `f5467a5` (Versão `2.2.1`)

---

## 🛠️ 2. Stack Tecnológica

* **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
* **PWA & Offline:** `vite-plugin-pwa` + Workbox Service Worker (`src/sw.ts`)
* **Backend:** Vercel Serverless Functions (Node.js 20+ ESM em `api/`)
* **Persistência de Push Subscriptions:** `@vercel/blob` (Blob Storage persistente em São Paulo `gru1`)
* **Motor Bíblico / Devocional:** Banco local com cofre de devocionais protestantes (`src/content/devotionals-vault.ts`) + APIs Gemini integradas (`GEMINI_WRITER_API_KEY`, `GEMINI_REVIEWER_API_KEY`) para geração teológica e curadoria.

---

## 🔑 3. Variáveis de Ambiente Configuradas na Vercel

Todas configuradas e ativas nos ambientes `production`, `preview` e `development`:
* `VAPID_PUBLIC_KEY` & `VITE_VAPID_PUBLIC_KEY`: Chave pública WebPush
* `VAPID_PRIVATE_KEY`: Chave privada WebPush
* `VAPID_SUBJECT`: `mailto:contato@amanhecer.app`
* `BLOB_READ_WRITE_TOKEN`: Token de escrita/leitura do `@vercel/blob` (`amanhecer-storage`)
* `CRON_SECRET`: Segredo de autenticação para os crons diários da Vercel
* `NOTIFICATIONS_API_KEY`: Chave de API para disparos manuais
* `APP_URL`: `https://amanhecer-beta.vercel.app`
* `GEMINI_WRITER_API_KEY` & `GEMINI_REVIEWER_API_KEY` & `GEMINI_MODEL_NAME` (`gemini-2.5-flash`)

---

## 🚀 4. O que foi feito nesta sessão

### A. Push Notifications em 2º Plano / App Fechado (Corrigido e Testado)
* **Problema:** Notificações só chegavam quando o app estava aberto ou em 2º plano; se o usuário fechasse o app ou bloqueasse a tela, a notificação atrasava ou não chegava.
* **Causas Identificadas:**
  1. No teste extremo agendado (`schedule-extreme-test.ts`), o servidor usava um `setTimeout` amarrado à requisição HTTP do cliente. Se o app fosse fechado, o socket caía e a função da Vercel morria antes de disparar o push.
  2. As mensagens WebPush não tinham prioridade explícita, fazendo o Android Doze Mode adiar a entrega.
* **Soluções Aplicadas:**
  1. Uso de `waitUntil()` do pacote `@vercel/functions`: o endpoint responde `200 OK` em menos de 50ms para o app e a Vercel mantém o processo em execução em background até o push ser disparado.
  2. Adicionados cabeçalhos de alta prioridade WebPush em todas as rotas de push (`schedule-extreme-test.ts`, `send-daily-verse.ts`, `send-reminders.ts`, `test.ts`):
     ```typescript
     {
       urgency: 'high',
       TTL: 86400 // 24h de sobrevivência na fila FCM
     }
     ```
  3. No `src/sw.ts`, a exibição da notificação usa `event.waitUntil(self.registration.showNotification(...))` com flags de vibração e foco para garantir que o Android acorde a tela/som.

### B. Recurso 1: "Testar Notificação Extreme" (Modal Temporário)
* **Objetivo:** Permitir ao administrador/desenvolvedor agendar um push para daqui a X segundos ou em horário específico, fechar o app, bloquear a tela e verificar a chegada da notificação.
* **Componente:** `src/components/ExtremeTestModal.tsx`.
* **Acesso:** Botão com badge pulsante "EXTREME" em `Configurações` -> `Notificações`.
* **Endpoint:** `POST /api/push/schedule-extreme-test`.

### C. Recurso 2: Card de Nova Atualização (In-App Update Modal)
* **Objetivo:** Toda vez que um novo deploy é feito na Vercel, exibir um card informando a atualização, com botão de atualizar que recarrega o app sem perder dados (mantendo nome do usuário, notas, versículos salvos) e botão discreto "O que há de novo" com resumo das novidades.
* **Arquivos Criados/Modificados:**
  * `src/content/updates/current-update.ts`: Contém a versão atual (`2.2.1`), data e lista de novidades.
  * `api/version.ts`: Endpoint da Vercel que retorna a versão em produção para o app checar.
  * `src/components/AppUpdateModal.tsx`: Modal com design escuro/dourado refinado, animação, detalhes retráteis do que mudou e botão "Atualizar Agora".
* **Correção do Crash de Reload:**
  * Anteriormente, ao clicar em atualizar, o código apagava todos os caches com `caches.delete()`, o que corrompia as requisições de assets do Service Worker e gerava erro de tela em branco.
  * Corrigido para o fluxo oficial do Workbox: registro de `controllerchange`, envio de `SKIP_WAITING` para o Service Worker novo assumir e reload seguro via `window.location.reload()`.

---

## 📱 5. Análise Técnica: Widgets de Tela Inicial no Android vs PWA

### O Pedido do Usuário:
> "Dá para colocar widgets na tela inicial do Android continuando sendo em PWA? E se o PWA instalar um pequeno APK só para os widgets?"

### Conclusão e Limitações do Sistema Android:
1. **PWA Puro (Navegador):** O Android Launcher exige componentes nativos do sistema operacional (`AppWidgetProvider`) para registrar widgets de tela inicial (cards 2x2, 4x2). **Nenhum navegador web (Chrome, Edge, Samsung Internet) possui permissão de registrar um widget nativo na tela inicial do Android sem APK.**
2. **"Mini APK instalado pelo PWA":**
   * Nenhum site ou PWA consegue instalar um APK silenciosamente. O Android aciona as travas de segurança: *"Permitir desta fonte"*, configurações manuais e aviso de *"App não verificado pelo Play Protect"*.
   * Isso quebra a exigência de ser simples para idosos e leigos.
   * Além disso, o usuário ficaria com 2 ícones diferentes no celular: o PWA (app completo) e o APK (só widget).
3. **Estratégia Recomendada para o Amanhecer:**
   * **Fluxo Principal (95% do público):** Manter o PWA em 1 clique (`amanhecer-beta.vercel.app`).
   * **O "Widget" Diário Automático:** Notificação push matinal às 06:06 com alta prioridade. Ela fica visível e expandida na **tela de bloqueio e na barra de notificações**, servindo como o widget do dia sem exigir nenhuma configuração.
   * **App Shortcuts (Atalhos Rápidos):** Configurar `shortcuts` no `manifest` para que, ao segurar o ícone do Amanhecer, a pessoa possa arrastar atalhos dedicados (Versículo do Dia, Minhas Notas) para a tela inicial.
   * **Opção Avançada Futura (APK Único com TWA):** Gerar um APK oficial gratuito via Google Bubblewrap que une o PWA + o Widget Nativo num único pacote para quem fizer questão de baixar.

---

## 📂 6. Estrutura de Arquivos Relevantes

```
amanhecer/
├── api/
│   ├── push/
│   │   ├── _store.ts               # Persistência de push no Vercel Blob
│   │   ├── _verse.ts               # Versículo do dia isolado para runtime ESM
│   │   ├── schedule-extreme-test.ts # Agendamento em background com waitUntil
│   │   ├── send-daily-verse.ts     # Disparo diário matinal (alta prioridade)
│   │   ├── send-reminders.ts       # Lembretes da tarde/noite
│   │   └── test.ts                 # Teste instantâneo de push
│   └── version.ts                  # Endpoint de versão do app
├── src/
│   ├── components/
│   │   ├── AppUpdateModal.tsx      # Modal de nova versão
│   │   └── ExtremeTestModal.tsx    # Modal de teste extremo de notificação
│   ├── content/
│   │   ├── updates/
│   │   │   └── current-update.ts   # Versão atual e changelog (v2.2.1)
│   │   └── devotionals-vault.ts    # Cofre de devocionais protestantes
│   ├── sw.ts                       # Service Worker com WebPush e cache offline
│   └── App.tsx                     # Orquestração do app e modais
└── vite.config.ts                  # Configuração do Vite e PWA Manifest
```

---

## 📋 7. Próximos Passos Sugeridos para a Nova Sessão

1. **Configurar App Shortcuts no Manifest:** Adicionar atalhos de toque longo no `vite.config.ts` (ex: "Versículo de Hoje", "Devocional", "Anotações").
2. **Ajuste fino nos horários dos Crons:** Revisar `vercel.json` para garantir que o envio do versículo matinal ocorra no fuso horário correto de Brasília (UTC-3).
3. **Remoção do Botão "Extreme Test":** Quando o teste for finalizado e validado pelo usuário, remover o botão das configurações e o endpoint correspondente.
4. **Avaliação do APK com Widget (TWA Bubblewrap):** Caso o usuário deseje disponibilizar o download do APK completo com widget na tela de configurações.
