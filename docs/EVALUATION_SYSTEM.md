# Sistema de Avaliação Teológica em 8 Critérios — Amanhecer 2.0

## 1. Visão Geral

A prioridade máxima do Amanhecer é a **fidelidade bíblica**. Não toleramos textos que inventem doutrinas, distorçam contextos bíblicos para criar mensagens motivacionais baratas ou façam promessas financeiras levianas em nome de Deus.

O Revisor analisa criticamente o conteúdo em **EXATAMENTE 8 critérios com notas inteiras de 0 a 10**.

---

## 2. Tabela de Critérios e Pesos

| Critério | Peso | Multiplicador | Mínimo Eliminatório | Foco Avaliativo |
|---|---|---|---|---|
| **1. Fidelidade Bíblica** | 20% | × 2.0 | **9/10** | A reflexão ensina o que o texto bíblico realmente diz? |
| **2. Ausência de Distorção** | 20% | × 2.0 | **9/10** | Versículo descontextualizado ou transformado em autoajuda? |
| **3. Edificação** | 15% | × 1.5 | **8/10** | Conduz à fé genuína, oração e prática responsável? |
| **4. Coerência** | 15% | × 1.5 | **8/10** | Lógica interna entre reflexão, aplicação e oração. |
| **5. Alinhamento Teológico** | 10% | × 1.0 | **8/10** | Fidelidade ao cânon protestante de 66 livros e à graça de Cristo. |
| **6. Clareza** | 5% | × 0.5 | **8/10** | Compreensível para um idoso ou novo leitor. |
| **7. Responsabilidade** | 10% | × 1.0 | **8/10** | Sem teologia da prosperidade, coação ou culpa doentia. |
| **8. Originalidade** | 5% | × 0.5 | **8/10** | Reflexão substancial sobre a passagem; sem clichês vazios. |
| **TOTAL** | **100%** | **10.0** | **Corte: 90/100** | Soma ponderada de 0 a 100 pontos |

---

## 3. Fórmula Matemática Determinística

$$\text{Nota Final} = (BF \times 2) + (AD \times 2) + (ED \times 1.5) + (CO \times 1.5) + (TA \times 1) + (CL \times 0.5) + (RS \times 1) + (OG \times 0.5)$$

> [!CAUTION]
> **O código NUNCA confia cegamente na nota reportada pela IA.**  
> A função `calculateEvaluationScore` recalcula a soma ponderada em TypeScript e valida com Zod.

---

## 4. Critérios Eliminatórios Imediatos

Um devocional é **REPROVADO AUTOMATICAMENTE** se:
1. `Fidelidade Bíblica < 9`
2. `Ausência de Distorção < 9`
3. `Alinhamento Teológico < 8`
4. `Responsabilidade < 8`
5. Qualquer outro critério individual `< 8`
6. `Nota Final < 90/100`
7. Existir qualquer item no array `criticalErrors` (versículo inexistente, distorção de prosperidade, barganha financeira, música não autorizada, etc.).

Mesmo que um devocional atinja 95/100 na média, havendo uma distorção grave, ele é reprovado sem exceção.
