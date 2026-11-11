# 🏛️ Amanhecer — Governança de Dados, Privacidade e Conformidade Legal (LGPD)

Este documento consolida a arquitetura de **Privacy by Design** e **Privacy by Default** implementada no **Amanhecer 2.0** e na sua plataforma administrativa de inteligência (`/colossenses323analytics`), atendendo à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), ao Marco Civil da Internet (Lei nº 12.965/2014) e às orientações da ANPD.

> **Aviso Importante de Conformidade (Seção 19):**
> A implementação técnica rigorosa dos controles de privacidade, criptografia e bloqueio pré-consentimento é condição essencial, mas não substitui a validação jurídica formal do texto institucional e da qualificação civil do controlador antes da publicação definitiva.

---

## 1. Inventário de Dados e Mapa de Fluxo de Informações

### 1.1 Dados Estritamente Locais (Dispositivo do Usuário — Sem Envio ao Servidor)
| Ativo de Dados | Armazenamento | Finalidade | Base Legal (LGPD) | Retenção |
| :--- | :--- | :--- | :--- | :--- |
| Apelido de saudação (`userName`) | `localStorage` | Exibir saudação personalizada na tela inicial | Execução de contrato / Termos de Uso a pedido do titular (Art. 7º, V) | Enquanto mantido no aparelho |
| Anotações do Diário de Oração (`diaryEntries`) | `IndexedDB` | Registro espiritual privado do leitor | Uso exclusivamente pessoal / Execução dos Termos (Art. 7º, V) | Enquanto mantido no aparelho |
| Devocionais Favoritos e Histórico (`favorites`, `completions`) | `IndexedDB` | Consulta offline de leituras passadas | Execução dos Termos de Uso (Art. 7º, V) | Enquanto mantido no aparelho |
| Preferências visuais (`theme`, `fineFontSize`) | `localStorage` | Acessibilidade visual e conforto de leitura | Execução dos Termos de Uso (Art. 7º, V) | Enquanto mantido no aparelho |
| Registro da decisão de privacidade (`amanhecer_privacy_consent_v1`) | `localStorage` | Respeitar a escolha do titular (aceite/recusa/revogação) sem exibir banner repetitivo | Cumprimento de obrigação legal/regulatória (Art. 7º, II) | Até alteração material da política ou limpeza pelo usuário |

### 1.2 Dados de Notificações Web Push (Opcionais — Mediante Ativação Explícita)
| Ativo de Dados | Destino | Finalidade | Base Legal (LGPD) | Retenção |
| :--- | :--- | :--- | :--- | :--- |
| `endpoint`, chaves `p256dh` e `auth`, fuso horário e `lastReadDate` | `/api/push/*` → Vercel Blob | Entregar o Versículo do Dia (06:06) e silenciar lembretes após a leitura concluída | Consentimento específico ao ativar notificações (Art. 7º, I) | Eliminado imediatamente ao desativar notificações nos ajustes |

### 1.3 Dados de Analytics de Produto (Opcionais — Bloqueados por Padrão Antes do Consentimento)
| Ativo de Dados | Destino | Finalidade | Base Legal (LGPD) | Retenção |
| :--- | :--- | :--- | :--- | :--- |
| `visitorId` (UUID v4 aleatório), `sessionId`, eventos de uso (`landing_viewed`, `devotional_completed`, `share_completed`, etc.), categoria de SO/Navegador e parâmetros públicos `utm_*` | `/api/analytics?action=ingest` → Vercel Blob (Criptografado AES-256-GCM) | Análise agregada de retenção, funis de instalação, eficácia de campanhas e melhoria de produto | Consentimento livre, informado e inequívoco (Art. 7º, I) — checkbox iniciado desmarcado | Eventos brutos: máximo de **90 dias** (configurável de 30 a 180 dias) ou exclusão imediata a pedido do titular |

---

## 2. Proteção de Dados Sensíveis e Religiosos (Seção 28)

Como o Amanhecer apresenta conteúdo devocional cristão, adotamos salvaguardas específicas para evitar o tratamento de dados pessoais sensíveis identificáveis (Art. 5º, II e Art. 11 da LGPD):
1. **Ausência de cadastro civil:** Não coletamos nome completo, e-mail, telefone, CPF ou endereço IP completo dos leitores.
2. **Vedação absoluta à coleta de textos privados:** O SDK de analytics (`src/services/analytics/analytics-client.ts`) e o servidor (`api/analytics/_store.ts`) possuem filtros explícitos que descartam qualquer propriedade denominada `userName`, `diaryContent`, `note`, `email`, `phone` ou `ip`.
3. **Sem perfilamento religioso ou publicitário:** Não inferimos denominação, convicção doutrinária individual nem compartilhamos dados com redes de anúncios ou corretores de dados (*data brokers*).

---

## 3. Proteção de Crianças e Adolescentes (Seção 27)

Em observância ao Art. 14 da LGPD, ao Estatuto da Criança e do Adolescente (ECA) e ao Enunciado CD/ANPD nº 1/2023 (melhor interesse de crianças e adolescentes):
* **Privacidade por padrão (Privacy by Default):** Toda coleta analítica opcional nasce desativada. Se um menor utilizar o aplicativo sem interagir com o aviso ou recusando analytics, zero dados analíticos são gerados.
* **Minimização sem coleta invasiva de documentos:** Não exigimos envio de documentos de identidade ou data de nascimento completa (o que criaria risco adicional de coleta excessiva de dados de menores).
* **Sem gamificação predatória, anúncios ou rastreamento cruzado:** O aplicativo é 100% gratuito e sem publicidade comportamental.

---

## 4. Fornecedores e Subprocessadores

| Fornecedor | Função Técnica | Localização / Região | Salvaguardas de Segurança |
| :--- | :--- | :--- | :--- |
| **Vercel Inc.** | Hospedagem da aplicação PWA, Serverless Functions e Vercel Blob Storage | Região primária do Blob: São Paulo (`gru1` - Brasil); Edge Network global | TLS 1.3 em trânsito + Criptografia em repouso AES-256-GCM aplicada pela camada da aplicação antes da gravação no Blob |
| **Google Fonts (Alphabet Inc.)** | Carregamento das fontes tipográficas *Playfair Display* e *Inter* (cacheadas localmente pelo Service Worker após o 1º acesso) | CDN Global | Cache-First via Service Worker para reduzir requisições externas |

---

## 5. Procedimento de Exclusão, Revogação e Direitos do Titular

1. **Revogação Imediata no Cliente:**
   * Ao clicar em **Recusar analytics** ou desativar em **Configurações → Privacidade e Dados (LGPD)**, a função `revokeAnalyticsConsent()` altera o estado para `revoked` e executa `purgeLocalAnalyticsData()`, removendo imediatamente `amanhecer_analytics_visitor_id`, `amanhecer_analytics_session_v1` e `amanhecer_analytics_queue_v1` (incluindo eventos que estavam na fila offline aguardando conexão).
   * Nenhum evento é enviado ao servidor para avisar que o usuário recusou analytics.
2. **Eliminação de Dados Pseudônimos Anteriores no Servidor:**
   * Ao acionar o botão **Revogar e Eliminar Dados Analíticos Anteriores**, o aplicativo envia o `visitorId` ao endpoint `POST /api/analytics?action=delete-my-data` antes de apagá-lo localmente.
   * O servidor remove todos os eventos brutos (`db.events`), sessões (`db.sessions`) e o sumário do visitante (`db.visitors[visitorId]`).
   * **Transparência sobre dados agregados:** Contadores diários globais (`dailyAggregates`) que contêm apenas somas numéricas anônimas e irreversíveis permanecem como estatística macro, pois não possuem vínculo com nenhum identificador individual.

---

## 6. Plano de Resposta a Incidentes de Segurança (Seção 30)

1. **Detecção e Contenção:**
   * Monitoramento de tentativas de acesso indevido à rota `/colossenses323analytics` por meio dos logs de auditoria (`securityAudit`) e bloqueio automático por *rate limiting* (máximo de 6 tentativas a cada 15 minutos por hash de rede).
2. **Rotação de Credenciais:**
   * Em caso de suspeita de comprometimento de chave administrativa, rotacionar imediatamente `ANALYTICS_ADMIN_PASSWORD`, `ANALYTICS_ADMIN_SECRET` e `CRON_SECRET` no painel da Vercel e invalidar sessões ativas.
3. **Avaliação e Notificação (Art. 48 da LGPD):**
   * Avaliar a natureza dos dados afetados (lembrando que os dados no Vercel Blob encontram-se criptografados em AES-256-GCM e não contêm nome, e-mail, CPF ou IP completo).
   * Caso algum incidente possa acarretar risco ou dano relevante aos titulares, comunicar à ANPD e aos titulares em prazo razoável (conforme regulamentação da ANPD), indicando a descrição da natureza dos dados, medidas técnicas de criptografia adotadas e medidas de mitigação.

---

## 7. Checklist de Publicação e Lista de Revisão Jurídica (Seção 33)

### Controles Técnicos Implementados e Verificados:
- [x] Termos de Uso publicados em `/termos-de-uso`.
- [x] Política de Privacidade com Tabela de Transparência publicada em `/politica-de-privacidade`.
- [x] Política de Cookies e Armazenamento publicada em `/politica-de-cookies`.
- [x] Bases legais documentadas para cada categoria de dado.
- [x] Checkbox de consentimento opcional de analytics iniciado **desmarcado por padrão**.
- [x] Bloqueio técnico total de coleta, fila e geração de identificadores antes do consentimento válido.
- [x] Recusa de analytics sem qualquer perda de acesso aos devocionais ou recursos essenciais.
- [x] Painel de revogação imediata e exclusão de dados implementado em **Configurações → Privacidade e Dados (LGPD)**.
- [x] APIs administrativas protegidas por autenticação real no servidor (`HttpOnly` cookie assinado + rate limit).
- [x] Criptografia em repouso AES-256-GCM no banco de analytics e retenção automática configurável (padrão 90 dias).
- [x] Testes automatizados cobrindo os 15 cenários obrigatórios de privacidade, segurança e analytics.

### Itens Pendentes de Preenchimento / Revisão Jurídica Antes da Publicação Definitiva:
- [ ] **Qualificação civil completa do controlador:** Inserir em `/termos-de-uso` e `/politica-de-privacidade` o CPF/CNPJ ou razão social da entidade responsável e cidade/UF de foro aplicável.
- [ ] **Validação da caixa postal de atendimento:** Confirmar se o endereço `contato@amanhecer.app` está recebendo mensagens normalmente ou substituir pelo e-mail institucional ativo de atendimento aos titulares.
- [ ] **Configuração de senha administrativa exclusiva na Vercel:** Recomenda-se definir a variável de ambiente `ANALYTICS_ADMIN_PASSWORD` no painel da Vercel para separar a senha de login humano da chave `CRON_SECRET`.
- [ ] **Revisão jurídica final dos textos legais:** Submeter os textos de `/termos-de-uso`, `/politica-de-privacidade` e `/politica-de-cookies` a revisão por advogado especializado em Direito Digital/LGPD, especialmente quanto ao público adolescente/infantil.
