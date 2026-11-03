import { describe, it, expect } from 'vitest';
import { selectDailyVerse, getSaoPauloDateString } from '../src/services/daily-verse/selection-engine';
import { VERIFIED_PASSAGES_CATALOG } from '../src/content/passages/catalog';
import { findBookByNameOrAbbreviation } from '../src/content/canon';

describe('Motor de Seleção do Versículo do Dia (Amanhecer 2.0)', () => {
  it('1. Deve ser 100% reproduzível: a mesma data produz exatamente a mesma passagem', () => {
    const dateStr = '2026-10-30';
    const firstCall = selectDailyVerse(dateStr);
    const secondCall = selectDailyVerse(dateStr);
    const thirdCall = selectDailyVerse(dateStr);

    expect(firstCall.id).toBe(secondCall.id);
    expect(secondCall.id).toBe(thirdCall.id);
    expect(firstCall.reference).toBe(secondCall.reference);
  });

  it('2. Datas diferentes produzem variações ao longo do calendário', () => {
    const dates = ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'];
    const selectedIds = dates.map(d => selectDailyVerse(d).id);
    const uniqueIds = new Set(selectedIds);

    expect(uniqueIds.size).toBeGreaterThan(1);
  });

  it('3. Todas as passagens do catálogo devem pertencer a livros do cânon de 66 livros', () => {
    VERIFIED_PASSAGES_CATALOG.forEach(passage => {
      const book = findBookByNameOrAbbreviation(passage.book);
      expect(book, `Livro ${passage.book} deve existir no cânon protestante de 66 livros`).toBeDefined();
      expect(passage.startVerse).toBeGreaterThan(0);
      expect(passage.endVerse).toBeGreaterThanOrEqual(passage.startVerse);
      expect(passage.text.length).toBeGreaterThan(10);
    });
  });

  it('4. Não deve conter listas de genealogias isoladas ou fragmentos contextualmente incompreensíveis', () => {
    VERIFIED_PASSAGES_CATALOG.forEach(passage => {
      // Nenhum versículo deve ser mera lista de nomes/gerações sem mensagem
      expect(passage.text).not.toMatch(/gerou a.*gerou a/i);
      expect(passage.contextSummary.length).toBeGreaterThan(15);
      expect(passage.theme.length).toBeGreaterThan(3);
    });
  });

  it('5. Evita repetições de passagens presentes no histórico recente', () => {
    const history = ['pv-3-5-6', 'sl-23-1-3'];
    const chosen = selectDailyVerse('2026-10-30', history);

    expect(history.includes(chosen.id)).toBe(false);
  });

  it('6. O fuso America/Sao_Paulo produz data válida no formato YYYY-MM-DD', () => {
    const spDate = getSaoPauloDateString();
    expect(spDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('7. A legenda de compartilhamento do versículo deve ser direta e a do devocional deve explicar o tema', async () => {
    const { buildShareCaption } = await import('../src/services/share/verse-image');
    const captionVerse = buildShareCaption({
      reference: 'Habacuque 3:17-19',
      theme: 'Fé e Alegria Inabalável na Escassez',
      contextSummary: 'Mesmo diante da perda de colheitas, o profeta ancora sua alegria no Senhor.',
      type: 'verse',
    });

    expect(captionVerse).toBe('Olhe o versículo do dia no app Amanhecer:\nhttps://amanhecer-beta.vercel.app');

    const captionDevotional = buildShareCaption({
      reference: 'Habacuque 3:17-19',
      title: 'A Alegria Inabalável em Meio à Crise',
      theme: 'Fé e Alegria Inabalável na Escassez',
      contextSummary: 'Mesmo diante da perda de colheitas e gado, o profeta Habacuque ancora sua alegria no Senhor.',
      type: 'devotional',
    });

    expect(captionDevotional).toContain('Devocional do Dia • A Alegria Inabalável em Meio à Crise');
    expect(captionDevotional).toContain('Passagem: Habacuque 3:17-19');
    expect(captionDevotional).toContain('Tema: Fé e Alegria Inabalável na Escassez');
    expect(captionDevotional).toContain('Mesmo diante da perda de colheitas e gado');
    expect(captionDevotional).toContain('https://amanhecer-beta.vercel.app');
  });
});
