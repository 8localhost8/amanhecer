# Histórico de Mudanças (Changelog) — Amanhecer

Todas as mudanças notáveis do projeto Amanhecer serão documentadas neste arquivo.

## [2.0.0] — 2026-10-30

### Adicionado
- **Arquitetura PWA Completa:** Suporte a Service Worker com Workbox, Cache API, manifesto web com ícones adaptativos e modo standalone.
- **Onboarding e Acessibilidade:** Ajuste fino de fonte de 16px a 32px com prévia em tempo real, temas Claro e Escuro, e modal de ajuda de instalação por sistema operacional (Android, iOS e Desktop).
- **Motor do Versículo do Dia:** Algoritmo determinístico baseado em seed de data (Mulberry32 + FNV-1a) garantindo a mesma passagem para todos os usuários no dia, com proteção contra repetições recentes.
- **Pipeline de Inteligência Artificial com Gemini:**
  - Gemini Escritor (`prompts/writer.md`) para geração pastoral edificante e cristocêntrica.
  - Gemini Revisor (`prompts/reviewer.md`) para auditoria crítica nos 8 critérios fundamentais.
- **Sistema de Avaliação em 8 Critérios:**
  - Fórmula ponderada com pesos exatos (Fidelidade Bíblica 20%, Ausência de Distorção 20%, Edificação 15%, Coerência 15%, Alinhamento Teológico 10%, Clareza 5%, Responsabilidade 10%, Originalidade 5%).
  - Nota de corte mínima de 90/100 com critérios eliminatórios imediatos.
  - Recálculo determinístico em TypeScript e validação de esquemas com Zod.
- **Validação Determinística Sem IA:** Verificação do cânon protestante de 66 livros, validação de limites de capítulos e versículos, catálogo de músicas verificadas e filtro de padrões de teologia da prosperidade.
- **Painel Visual de Auditoria Teológica:** Interface administrativa com barra de progresso, breakdown dos critérios e simulador interativo de notas.
- **Experiência do Leitor e Conclusão:**
  - Botão "Concluí a leitura de hoje" com modal de celebração suave com confetes.
  - Sincronização offline e online imediata.
- **Diário Pessoal Local:** Notas, orações e motivos de gratidão salvos unicamente em IndexedDB com recursos de exportação e importação de backup JSON.
- **Infraestrutura Web Push:**
  - Notificação matinal às 06:06 (America/Sao_Paulo).
  - Lembretes serenos nos horários 11:00, 16:00 e 21:00, com supressão instantânea após leitura concluída.
- **Automações e Deploy:**
  - Workflows agendados do GitHub Actions para seleção, auditoria e disparo de notificações.
  - Configuração da Vercel (`vercel.json`) com cabeçalhos de segurança e rotas serverless.
- **Suíte de Testes Automatizados:** 20 testes unitários e de integração com Vitest cobrindo todos os casos de uso obrigatórios.
