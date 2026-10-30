# Motor de Seleção do Versículo do Dia — Amanhecer 2.0

## 1. Requisitos Principais

O Versículo do Dia é uma funcionalidade mandatória e central do Amanhecer:
- Todos os dias existe um Versículo do Dia oficial.
- A seleção é **100% reproduzível por data (`YYYY-MM-DD`)**: todos os leitores no mundo recebem rigorosamente o mesmo versículo na mesma data.
- O versículo é extraído estritamente do **Catálogo de Passagens Verificadas** (`VERIFIED_PASSAGES_CATALOG`), cobrindo diferentes gêneros e testamentos do cânon protestante de 66 livros.

---

## 2. Critérios de Inclusão e Exclusão

### Passagens Adequadas:
- Possuem mensagem edificante e compreensível.
- Podem ser interpretadas corretamente com o resumo de contexto fornecido.
- Encorajam a oração, maturidade cristã e fidelidade a Deus.

### Passagens Excluídas de Notificação Curta Isolada:
- Listas genealógicas puras sem aplicação contextual imediata.
- Censos e números militares isolados.
- Medidas de templos ou descrições rituais técnicas descontextualizadas.
- Frases incompletas ou promessas individuais do Antigo Testamento arrancadas de sua aliança original.

---

## 3. Algoritmo Pseudo-Aleatório Determinado (PRNG)

Utilizamos um gerador **Mulberry32** semeado pelo hash **FNV-1a** da string da data (ex: `"2026-10-30"`):

```ts
const seed = hashDateString(dateStr);
const prng = mulberry32(seed);
const index = Math.floor(prng() * pool.length);
```

Esse mecanismo garante distribuição homogênea sobre o catálogo e impede qualquer repetição em dias consecutivos.
