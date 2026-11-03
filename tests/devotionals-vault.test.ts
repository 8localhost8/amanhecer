import { describe, it, expect } from 'vitest';
import { getDevotionalForDate, APPROVED_DEVOTIONALS_VAULT } from '../src/content/devotionals/vault';
import { getSongById } from '../src/content/songs/catalog';

describe('Acervo e Seleção de Devocionais (Amanhecer 2.0)', () => {
  it('1. 2026-11-03 deve retornar o devocional exclusivo de Habacuque 3 (sem repetir 30/10)', () => {
    const dev30Out = getDevotionalForDate('2026-10-30');
    const dev03Nov = getDevotionalForDate('2026-11-03');

    expect(dev30Out.verseOfTheDay.reference).toBe('Provérbios 3:5-6');
    expect(dev03Nov.verseOfTheDay.reference).toBe('Habacuque 3:17-19');
    expect(dev03Nov.theme).not.toBe(dev30Out.theme);
    expect(dev03Nov.musicId).toBe('song-012');
  });

  it('2. Todas as passagens e músicas do acervo devem ser válidas e verificadas', () => {
    APPROVED_DEVOTIONALS_VAULT.forEach(dev => {
      expect(dev.title.length).toBeGreaterThan(5);
      expect(dev.reflection.length).toBeGreaterThan(200);
      expect(dev.application.length).toBeGreaterThan(30);
      expect(dev.prayer.length).toBeGreaterThan(30);
      expect(dev.musicId).toBeDefined();

      const song = getSongById(dev.musicId);
      expect(song, `Música ${dev.musicId} deve existir no catálogo de canções`).toBeDefined();
    });
  });

  it('3. Nenhum devocional deve ser sobre genealogias ou listas de nomes vazias', () => {
    APPROVED_DEVOTIONALS_VAULT.forEach(dev => {
      expect(dev.verseOfTheDay.text).not.toMatch(/gerou a.*gerou a/i);
      expect(dev.reflection).not.toMatch(/árvore genealógica/i);
      expect(dev.theme).not.toMatch(/genealogia/i);
    });
  });

  it('4. Cobertura determinística contínua sem repetições consecutivas de temas', () => {
    // Testa 30 dias contínuos a partir de 2026-10-30
    const dates: string[] = [];
    const base = new Date('2026-10-30T12:00:00Z');
    for (let i = 0; i < 30; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      dates.push(d.toISOString().slice(0, 10));
    }

    const devotionals = dates.map(d => getDevotionalForDate(d));

    // Verifica que nenhum dia consecutivo repete a mesma passagem
    for (let i = 1; i < devotionals.length; i++) {
      const prev = devotionals[i - 1];
      const curr = devotionals[i];
      expect(
        curr.verseOfTheDay.passageId,
        `Dia ${dates[i]} não deve repetir a passagem do dia anterior ${dates[i - 1]}`
      ).not.toBe(prev.verseOfTheDay.passageId);
    }
  });
});
