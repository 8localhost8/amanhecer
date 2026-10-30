# Catálogo Musical Verificado — Amanhecer 2.0

## 1. Princípios de Curadoria

Cada devocional pode apresentar uma recomendação da seção **"🎧 Para Ouvir"**.
Para proteger o leitor contra links corrompidos ou conteúdos heréticos, estabelecemos:
- **Zero Alucinação de Músicas:** A IA NÃO tem permissão para inventar nomes de músicas, artistas ou URLs.
- A recomendação é estritamente selecionada a partir do catálogo aprovado (`src/content/songs/catalog.ts`).
- Se não houver música compatível com a passagem, a recomendação é omitida em vez de improvisada.

---

## 2. Estrutura do Item do Catálogo

```ts
export interface ChristianSong {
  id: string;
  title: string;
  artist: string;
  theme: string;
  recommendationReason: string;
  youtubeUrl: string;
  spotifyUrl: string;
  theologicalAlignmentNotes: string;
}
```

---

## 3. Louvores Homologados Iniciais

1. **Porque Ele Vive** (`song-001`) — Harpa Cristã / Bill & Gloria Gaither (Ressurreição e confiança no amanhã).
2. **Grande é a Tua Fidelidade** (`song-002`) — Thomas Chisholm (Fidelidade pactual e misericórdias da manhã).
3. **O Teu Amor Não Falha** (`song-003`) — Nivea Soares (Romanos 8 e o amor inseparável de Deus).
4. **Tu És Fiel, Senhor** (`song-004`) — Cantor Cristão (Imutabilidade divina ao longo das estações).
5. **Ele Me Guia (Salmo 23)** (`song-005`) — Voz da Verdade (O bom pastor e águas tranquilas).
6. **Graça Que Livra (Amazing Grace)** (`song-006`) — John Newton (Salvação exclusivamente pela graça mediante a fé).
7. **Descansarei** (`song-007`) — Reuben Morgan (Descanso e paz na soberania divina).
8. **Castelo Forte** (`song-008`) — Martinho Lutero (Deus como refúgio histórico contra as tempestades).
