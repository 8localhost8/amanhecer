# Estratégia e Suíte de Testes Automatizados — Amanhecer 2.0

## 1. Visão Geral dos Testes

O Amanhecer conta com uma suíte de testes automatizados com **Vitest**, cobrindo 100% dos cenários críticos de integridade teológica e operacional:

```bash
cd amanhecer
npm test
```

---

## 2. Cenários Testados Obrigatoriamente

### 2.1. Avaliação Teológica e Recálculo (`tests/evaluation.test.ts`)
1. **Todas as notas 9:** Resulta matematicamente em 90/100 com aprovação técnica.
2. **Nota 88.5 ou 89:** Reprovada imediatamente por não atingir a nota mínima de corte (90/100).
3. **Nota 90 sem erros:** Aprovada tecnicamente.
4. **Nota 95 com distorção grave (erro crítico):** Reprovada automaticamente, mesmo com média geral elevada.
5. **Fidelidade bíblica menor que 9:** Reprovada (critério eliminatório).
6. **Ausência de distorção menor que 9:** Reprovada (critério eliminatório).
7. **Alinhamento teológico ou responsabilidade menor que 8:** Reprovada (critério eliminatório).
8. **Critério individual menor que 8:** Reprovada (critério eliminatório).
9. **Cálculo de pesos da fórmula:** Verificação matemática rigorosa de todos os 8 multiplicadores.
10. **Livro fora do cânon protestante de 66 livros:** Reprovado por validação determinística.
11. **Música não autorizada:** Bloqueio da recomendação e reprovação.
12. **Detecção de teologia da prosperidade:** Detecção e bloqueio determinístico de termos de pacto/enriquecimento.

### 2.2. Motor do Versículo do Dia (`tests/daily-verse.test.ts`)
1. **Reprodutibilidade 100%:** A mesma data gera rigorosamente o mesmo versículo para todos os usuários globais.
2. **Distribuição no calendário:** Datas diferentes distribuem ao longo do catálogo verificado.
3. **Cânon protestante:** Todas as passagens pertencem a livros canônicos válidos.
4. **Sem genealogias isoladas:** Nenhuma passagem isolada é lista crua de nomes ou medidas técnicas.
5. **Anti-repetição:** Não repete passagens contidas no histórico recente de 14 dias.
6. **Formato do fuso:** Formatação da data em `America/Sao_Paulo` (YYYY-MM-DD).

### 2.3. Notificações e Armazenamento (`tests/notifications-and-storage.test.ts`)
1. **Preferências padrão anônimas:** Inicialização segura sem coleta de dados do usuário.
2. **Regra de Coexistência:** Notificação das 06:06 substitui o lembrete das 06:00.
3. **Parada imediata de lembretes:** Ao concluir o devocional, todos os lembretes do dia são suprimidos.
