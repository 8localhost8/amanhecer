# Configuração da Google Gemini API — Amanhecer 2.0

## 1. Princípio Fundamental de Arquitetura

O Amanhecer utiliza duas atribuições distintas e isoladas de IA:
1. **Gemini Escritor:** Responsável pela redação da reflexão, aplicação e oração a partir da passagem bíblica verificada.
2. **Gemini Revisor:** Responsável pela auditoria crítica e teológica com atribuição de notas nos 8 critérios.

> [!IMPORTANT]
> **Chamadas à IA NUNCA ocorrem diretamente no navegador do usuário.**  
> As chamadas são realizadas exclusivamente em ambiente de build/CI ou funções protegidas de backend via GitHub Actions e Node.js. Chaves de API nunca são expostas ao frontend.

---

## 2. Variáveis de Ambiente Necessárias

| Variável | Descrição | Onde Configurar |
|---|---|---|
| `GEMINI_WRITER_API_KEY` | Chave de API do Gemini Escritor | GitHub Secrets / Vercel Environment |
| `GEMINI_REVIEWER_API_KEY` | Chave de API do Gemini Revisor | GitHub Secrets / Vercel Environment |
| `GEMINI_MODEL_NAME` | Modelo padrão (ex: `gemini-2.5-flash`) | `.env` / Vercel Environment |

---

## 3. Como Obter as Chaves do Google Gemini

1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Faça login com sua conta Google.
3. Clique em **"Get API Key"** e gere sua chave de acesso.
4. Para assegurar independência conceitual, configure dois projetos ou chaves separadas (`GEMINI_WRITER_API_KEY` e `GEMINI_REVIEWER_API_KEY`).

---

## 4. Prompts do Sistema

Os prompts oficiais estão armazenados em arquivos Markdown versionados no repositório:
- `prompts/writer.md`: Estabelece as regras estritas de redação bíblica, tom pastoral sem triunfalismo, limites de palavras e escolha obrigatória de música do catálogo verificado.
- `prompts/reviewer.md`: Estabelece a postura crítica do auditor, os critérios eliminatórios de corte e a estrutura do relatório JSON.

---

## 5. Loop de Correção Automática

Quando um devocional não atinge a nota 90/100 ou apresenta advertências teológicas:
1. O Revisor emite um relatório com a lista de problemas pontuais.
2. O Escritor recebe o texto anterior e as correções requeridas (`maxCorrections: 2`).
3. Uma nova versão é gerada e novamente avaliada pelo Revisor.
4. Se após duas correções o texto persistir reprovado, o sistema interrompe a publicação, registra o rascunho para inspeção humana e utiliza o **Vault de Conteúdo Pré-Aprovado** como fallback seguro.
