import { describe, it, expect } from 'vitest';
import { calculateEvaluationScore } from '../src/services/ai/evaluation-calculator';
import { validateDevotionalDeterministically } from '../src/services/ai/deterministic-validator';
import { EvaluationCriteriaMap, DevotionalPublic } from '../src/services/ai/schemas';

describe('Sistema de Avaliação Teológica e Recálculo Determinístico (Amanhecer 2.0)', () => {
  // Base criteria with all notes = 9 -> exactly 90/100
  const createCriteria = (overrides: Partial<Record<keyof EvaluationCriteriaMap, number>> = {}): EvaluationCriteriaMap => ({
    biblicalFidelity: { score: overrides.biblicalFidelity ?? 9, reason: 'Fiel ao texto', evidence: [] },
    absenceOfDistortion: { score: overrides.absenceOfDistortion ?? 9, reason: 'Sem distorções', evidence: [] },
    edification: { score: overrides.edification ?? 9, reason: 'Edificante', evidence: [] },
    coherence: { score: overrides.coherence ?? 9, reason: 'Coerente', evidence: [] },
    theologicalAlignment: { score: overrides.theologicalAlignment ?? 9, reason: 'Alinhado ao cânon', evidence: [] },
    clarity: { score: overrides.clarity ?? 9, reason: 'Claro', evidence: [] },
    responsibility: { score: overrides.responsibility ?? 9, reason: 'Responsável', evidence: [] },
    originality: { score: overrides.originality ?? 9, reason: 'Original', evidence: [] },
  });

  it('1. Todas as notas 9 devem resultar exatamente em 90/100 e aprovação técnica', () => {
    const criteria = createCriteria();
    const result = calculateEvaluationScore(criteria, [], 'test-1');

    expect(result.weightedScore).toBe(90);
    expect(result.approvedByAI).toBe(true);
    expect(result.status).toBe('approved');
  });

  it('2. Nota final 89.5 ou menor que 90 deve ser REPROVADA', () => {
    // Drop edification to 8 (1.5 drop) -> 90 - 1.5 = 88.5
    const criteria = createCriteria({ edification: 8 });
    const result = calculateEvaluationScore(criteria, [], 'test-2');

    expect(result.weightedScore).toBe(88.5);
    expect(result.weightedScore).toBeLessThan(90);
    expect(result.approvedByAI).toBe(false);
    expect(result.status).toBe('rejected');
  });

  it('3. Nota 90 sem erros críticos e sem eliminatórios é aprovada tecnicamente', () => {
    const criteria = createCriteria();
    const result = calculateEvaluationScore(criteria, [], 'test-3');

    expect(result.weightedScore).toBeGreaterThanOrEqual(90);
    expect(result.criticalErrors).toHaveLength(0);
    expect(result.approvedByAI).toBe(true);
  });

  it('4. Devocional com nota alta (ex: 95/100) mas com distorção grave deve ser REPROVADO AUTOMATICAMENTE', () => {
    // All 10s (would be 100/100) but has a critical error
    const criteria = createCriteria({
      biblicalFidelity: 10,
      absenceOfDistortion: 10,
      edification: 10,
      coherence: 10,
      theologicalAlignment: 10,
      clarity: 10,
      responsibility: 10,
      originality: 10,
    });
    const criticalErrors = [
      {
        code: 'PROSPERITY_DISTORTION',
        excerpt: 'Deus garante que você ficará rico se ofertar hoje',
        explanation: 'Promessa herética de enriquecimento material atribuída a Deus',
      }
    ];

    const result = calculateEvaluationScore(criteria, criticalErrors, 'test-4');

    expect(result.weightedScore).toBe(100);
    expect(result.approvedByAI).toBe(false); // CRITICAL: NEVER APPROVE
    expect(result.status).toBe('critical_error');
    expect(result.requiresHumanReview).toBe(true);
  });

  it('5. Fidelidade bíblica menor que 9 deve REPROVAR (critério eliminatório)', () => {
    const criteria = createCriteria({
      biblicalFidelity: 8, // Minimum is 9
      clarity: 10,
      responsibility: 10,
      originality: 10,
    });
    const result = calculateEvaluationScore(criteria, [], 'test-5');

    expect(result.approvedByAI).toBe(false);
    expect(result.status).toBe('rejected');
  });

  it('6. Ausência de distorção menor que 9 deve REPROVAR (critério eliminatório)', () => {
    const criteria = createCriteria({
      absenceOfDistortion: 8, // Minimum is 9
      clarity: 10,
      responsibility: 10,
    });
    const result = calculateEvaluationScore(criteria, [], 'test-6');

    expect(result.approvedByAI).toBe(false);
    expect(result.status).toBe('rejected');
  });

  it('7. Alinhamento teológico ou responsabilidade menor que 8 deve REPROVAR', () => {
    const crit1 = createCriteria({ theologicalAlignment: 7 });
    const res1 = calculateEvaluationScore(crit1, [], 'test-7a');
    expect(res1.approvedByAI).toBe(false);

    const crit2 = createCriteria({ responsibility: 7 });
    const res2 = calculateEvaluationScore(crit2, [], 'test-7b');
    expect(res2.approvedByAI).toBe(false);
  });

  it('8. Qualquer outro critério menor que 8 deve REPROVAR', () => {
    const criteria = createCriteria({ clarity: 7 });
    const result = calculateEvaluationScore(criteria, [], 'test-8');
    expect(result.approvedByAI).toBe(false);
  });

  it('9. Fórmula matemática deve calcular exatamente os pesos descritos na especificação', () => {
    // Formula:
    // (BF * 2) + (AD * 2) + (ED * 1.5) + (CO * 1.5) + (TA * 1) + (CL * 0.5) + (RS * 1) + (OG * 0.5)
    // Let's test custom notes:
    // BF=10 (20), AD=10 (20), ED=8 (12), CO=8 (12), TA=8 (8), CL=10 (5), RS=9 (9), OG=10 (5)
    // Sum = 20 + 20 + 12 + 12 + 8 + 5 + 9 + 5 = 91
    const criteria = createCriteria({
      biblicalFidelity: 10,
      absenceOfDistortion: 10,
      edification: 8,
      coherence: 8,
      theologicalAlignment: 8,
      clarity: 10,
      responsibility: 9,
      originality: 10,
    });
    const result = calculateEvaluationScore(criteria, [], 'test-9');
    expect(result.weightedScore).toBe(91);
    expect(result.approvedByAI).toBe(true);
  });

  it('10. Validação determinística deve rejeitar livros fora do cânon protestante de 66 livros', () => {
    const invalidDevotional: DevotionalPublic = {
      schemaVersion: 1,
      id: '2026-10-30',
      date: '2026-10-30',
      title: 'Título Válido',
      verseOfTheDay: {
        book: 'Tobias', // Não pertence ao cânon de 66 livros
        chapter: 1,
        startVerse: 1,
        endVerse: 2,
        reference: 'Tobias 1:1-2',
        passageId: 'tb-1',
        text: 'Texto qualquer'
      },
      contextSummary: 'Contexto',
      theme: 'Tema',
      reflection: 'Reflexão longa com mais de 80 palavras necessárias para validação de conteúdo. '.repeat(10),
      application: 'Aplicação prática válida para a vida cristã.',
      prayer: 'Oração sincera a Deus por misericórdia e direção.',
      estimatedMinutes: 5,
      musicId: 'song-001',
      editorialStatus: 'under_review'
    };

    const detResult = validateDevotionalDeterministically(invalidDevotional);
    expect(detResult.isValid).toBe(false);
    expect(detResult.criticalErrors.some(e => e.code === 'CANON_VIOLATION')).toBe(true);
  });

  it('11. Validação determinística deve rejeitar música inexistente no catálogo autorizado', () => {
    const devotionalWithBadSong: DevotionalPublic = {
      schemaVersion: 1,
      id: '2026-10-30',
      date: '2026-10-30',
      title: 'Aprendendo a Confiar',
      verseOfTheDay: {
        book: 'Provérbios',
        chapter: 3,
        startVerse: 5,
        endVerse: 6,
        reference: 'Provérbios 3:5-6',
        passageId: 'pv-3-5-6',
        text: 'Confia no SENHOR de todo o teu coração...'
      },
      contextSummary: 'Contexto',
      theme: 'Confiança',
      reflection: 'Reflexão longa com mais de 80 palavras necessárias para validação de conteúdo. '.repeat(10),
      application: 'Aplicação prática válida para a vida cristã.',
      prayer: 'Oração sincera a Deus por misericórdia e direção.',
      estimatedMinutes: 5,
      musicId: 'musica-inventada-999', // Música não verificada
      editorialStatus: 'under_review'
    };

    const detResult = validateDevotionalDeterministically(devotionalWithBadSong);
    expect(detResult.isValid).toBe(false);
    expect(detResult.criticalErrors.some(e => e.code === 'UNVERIFIED_MUSIC')).toBe(true);
  });

  it('12. Validação determinística deve detectar e bloquear termos de barganha e prosperidade', () => {
    const devotionalWithProsperity: DevotionalPublic = {
      schemaVersion: 1,
      id: '2026-10-30',
      date: '2026-10-30',
      title: 'Pacto de Vitória',
      verseOfTheDay: {
        book: 'Provérbios',
        chapter: 3,
        startVerse: 5,
        endVerse: 6,
        reference: 'Provérbios 3:5-6',
        passageId: 'pv-3-5-6',
        text: 'Confia no SENHOR de todo o teu coração...'
      },
      contextSummary: 'Contexto',
      theme: 'Confiança',
      reflection: 'Venha fazer um pacto financeiro para decretar riqueza em sua conta bancária. '.repeat(10),
      application: 'Aplicação prática válida para a vida cristã.',
      prayer: 'Oração sincera a Deus.',
      estimatedMinutes: 5,
      musicId: 'song-001',
      editorialStatus: 'under_review'
    };

    const detResult = validateDevotionalDeterministically(devotionalWithProsperity);
    expect(detResult.isValid).toBe(false);
    expect(detResult.criticalErrors.some(e => e.code === 'THEOLOGICAL_DEVIATION')).toBe(true);
  });
});
