# ☀️ Amanhecer 2.0 — Devocional Diário Cristão

> **"Um momento com Deus, todos os dias."**  
> *Aplicativo PWA Cristão • 100% Gratuito • Sem Cadastro • Cânon Protestante de 66 Livros • Inteligência Artificial com Auditoria Teológica Rígida*

---

## 📖 Visão Geral

O **Amanhecer** é um Progressive Web App (PWA) cristão desenvolvido para ajudar pessoas de todas as idades a cultivar o hábito diário de oração, reflexão bíblica e meditação na Palavra de Deus.

Criado sobre os princípios de **gratuidade irrestrita, anonimato, simplicidade e fidelidade inegociável às Escrituras**, o aplicativo dispensa contas, cadastros ou senhas. Todas as anotações e histórico permanecem no aparelho do usuário.

---

## 🌟 Princípios Inegociáveis

1. **100% Gratuito e Livre de Distrações:** Sem anúncios, sem assinaturas, sem paywalls e sem planos pagos.
2. **Acesso Imediato e Anônimo:** Sem coleta de e-mail, telefone ou criação de perfis remotos.
3. **Fidelidade Bíblica ao Cânon de 66 Livros:** Baseado na Bíblia cristã evangélica (39 livros do Antigo Testamento e 27 do Novo Testamento). Rejeição de teologias da prosperidade, manipulação espiritual ou distorções triunfalistas.
4. **Auditoria por IA Rigorosa (Nota Mínima 90/100):** Duas instâncias independentes de IA — **Gemini Escritor** e **Gemini Revisor** —, com avaliação determinística de 8 critérios teológicos e reprovação automática em caso de distorções.
5. **Versículo do Dia às 06:06:** Notificação matinal baseada em passagens verificadas, sem repetições recentes e sincronizada para todos os leitores.
6. **Lembretes Serenos que Param Após a Leitura:** Lembretes às 11:00, 16:00 e 21:00 que cessam imediatamente após o leitor confirmar a conclusão do devocional.
7. **Acessibilidade Universal:** Tipografia dinâmica (16px a 32px), contraste acolhedor, temas claro e escuro, suporte offline completo e diário pessoal com backup.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Interface rápida, responsiva e acessível |
| **Estilização** | Tailwind CSS + Lucide Icons | Paleta dawn/midnight, foco e contraste |
| **PWA & Offline** | vite-plugin-pwa + Workbox + IndexedDB | Cache API, instalação standalone, diário local |
| **Inteligência Artificial** | Google Gemini API (2.5 Flash) | Configurações separadas de Escritor e Revisor |
| **Auditoria & Schemas** | Zod + Vitest | Validação determinística sem IA e recálculo de notas |
| **Web Push** | VAPID + Web Push API + Vercel Functions | Envio às 06:06 e slots de lembretes |
| **Automação** | GitHub Actions Workflows | Geração, avaliação e publicação agendadas |
| **Hospedagem** | Vercel | Deploy contínuo, Serverless Functions e Crons |

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar e Instalar Dependências

```bash
cd amanhecer
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha suas chaves do Google Gemini e VAPID (para notificações).

### 3. Executar em Modo de Desenvolvimento

```bash
npm run dev
```

Abra no navegador em `http://localhost:5173`.

### 4. Executar a Suíte de Testes Automatizados

```bash
npm test
```

### 5. Compilar para Produção

```bash
npm run build
npm run preview
```

---

## 📚 Documentação Técnica Completa

Para aprofundamento em cada subsistema do Amanhecer, consulte a pasta [`docs/`](./docs/):

- [Arquitetura Geral (`ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
- [Guia PWA e Instalação (`PWA.md`)](./docs/PWA.md)
- [Configuração do Google Gemini (`GEMINI_SETUP.md`)](./docs/GEMINI_SETUP.md)
- [Sistema de Avaliação em 8 Critérios (`EVALUATION_SYSTEM.md`)](./docs/EVALUATION_SYSTEM.md)
- [Política de Conteúdo Bíblico (`BIBLICAL_CONTENT_POLICY.md`)](./docs/BIBLICAL_CONTENT_POLICY.md)
- [Motor do Versículo do Dia (`DAILY_VERSE.md`)](./docs/DAILY_VERSE.md)
- [Sistema de Notificações Web Push (`NOTIFICATIONS.md`)](./docs/NOTIFICATIONS.md)
- [Catálogo Musical Verificado (`MUSIC_CATALOG.md`)](./docs/MUSIC_CATALOG.md)
- [Política de Privacidade Anônima (`PRIVACY.md`)](./docs/PRIVACY.md)
- [Segurança da Aplicação (`SECURITY.md`)](./docs/SECURITY.md)
- [Deploy na Vercel e GitHub Actions (`DEPLOYMENT.md`)](./docs/DEPLOYMENT.md)
- [Estratégia e Casos de Teste (`TESTING.md`)](./docs/TESTING.md)
- [Roteiro de Evolução (`ROADMAP.md`)](./docs/ROADMAP.md)
- [Histórico de Mudanças (`CHANGELOG.md`)](./docs/CHANGELOG.md)

---

## 📜 Licença e Propósito

O Amanhecer é disponibilizado gratuitamente sob a licença MIT para a glória de Deus e a edificação de todos os que buscam um momento diário na presença do Senhor.
