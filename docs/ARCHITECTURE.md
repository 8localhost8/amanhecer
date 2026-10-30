# Arquitetura do Sistema — Amanhecer 2.0

## 1. Visão Arquitetural

O Amanhecer adota uma arquitetura descentralizada orientada a privacidade e acessibilidade, combinando:
1. **Frontend PWA Desacoplado:** Executado totalmente no navegador do cliente sem banco de dados remoto de usuários.
2. **Motor de Conteúdo Estático & Vault:** Banco de devocionais auditados em JSON/TypeScript e catálogo bíblico canônico com seed determinístico.
3. **Pipeline de Automação IA & Avaliação:** Dois papéis do Google Gemini (Escritor e Revisor) mediados por validações determinísticas de esquemas Zod e recálculo obrigatório de pesos.
4. **Infraestrutura Serverless Mínima para Notificações:** Vercel Functions para Web Push com controle de consentimento, idempotência e parada automática após sincronização da leitura.

```
+-------------------------------------------------------------+
|                      FLUXO EDITORIAL                        |
+-------------------------------------------------------------+
              Passagem Verificada do Cânon (66 Livros)
                                 |
                                 v
                     Seleção do Versículo do Dia
                        (Seed por Data YYYY-MM-DD)
                                 |
                                 v
                          Gemini Escritor
                    (prompts/writer.md + Songs)
                                 |
                                 v
                     Validação Determinística
                    (Cânon, Versos, Termos Zod)
                                 |
                                 v
                          Gemini Revisor
                   (8 Critérios Analíticos 0-10)
                                 |
                                 v
                     Recálculo Determinístico
                    (Fórmula de Pesos + Regras)
                                 |
           +---------------------+---------------------+
           |                                           |
      Nota >= 90 & Sem Bloqueios              Nota < 90 ou Erro Crítico
           |                                           |
           v                                           v
  Aprovado Tecnicamente                    Loop de Correção (Até 2x)
           |                                           |
  Revisão Editorial (REVIEW)                Se falhar: Vault Fallback
           |
           v
  Publicação Estática / Vercel
```

## 2. Camadas da Aplicação

### 2.1. Camada de Apresentação (Client SPA)
- `src/App.tsx`: Orquestrador mestre de estado (visão atual, onboarding, celebração, temas).
- `src/pages/`:
  - `LandingPage`: Recepção com tutorial de instalação para Android, iOS e PC via modal `?`.
  - `HomePage`: Saudação temporal, Versículo do Dia, card do Devocional e atalhos.
  - `DevotionalPage`: Leitor com redimensionador de fonte (16 a 32px), texto bíblico destacado, reflexão, aplicação prática, oração sugerida, recomendação musical e botão de conclusão.
  - `HistoryPage`: Busca e arquivo de mensagens passadas com indicador de leitura.
  - `FavoritesPage`: Acesso rápido offline a mensagens prediletas.
  - `DiaryPage`: Diário de anotações e orações persistido no IndexedDB com exportação/importação JSON.
  - `SettingsPage`: Configuração de fonte, temas claro/escuro/auto e agendamento de avisos.
  - `EvaluationDashboardPage`: Auditoria teológica visual com barras de progresso e simulador de critérios.

### 2.2. Camada de Armazenamento Local
- **LocalStorage:** Preferências de leitura (tamanho da fonte, tema, flags de onboarding e notificações).
- **IndexedDB (`idb`):**
  - `completions`: Registro de leitura com timestamp e status de sincronização push.
  - `favorites`: Lista de devocionais favoritos para leitura offline.
  - `diaryEntries`: Notas, pedidos de oração e motivos de gratidão.

### 2.3. Camada Serverless de Push Notifications
- `api/push/subscribe.ts`: Registro da assinatura anônima com fuso horário e preferências.
- `api/push/unsubscribe.ts`: Exclusão da inscrição a pedido do usuário.
- `api/push/sync-completion.ts`: Sinalização de devocional lido para cessar lembretes pendentes.
- `api/push/send-daily-verse.ts`: Disparo às 06:06 com validação de idempotência.
- `api/push/send-reminders.ts`: Disparo nos slots (11:00, 16:00, 21:00) verificando conclusão prévia.
