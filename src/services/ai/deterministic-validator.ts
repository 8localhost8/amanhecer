import { findBookByNameOrAbbreviation } from '../../content/canon';
import { getSongById } from '../../content/songs/catalog';
import { DevotionalPublic, CriticalError } from './schemas';

export interface DeterministicValidationResult {
  isValid: boolean;
  errors: string[];
  criticalErrors: CriticalError[];
}

const FORBIDDEN_THEOLOGICAL_PATTERNS = [
  { regex: /pacto financeiro/i, message: 'Menção indevida a pacto ou barganha financeira com Deus' },
  { regex: /decret[aoe]\s+(riqueza|vit[óo]ria financeira|bens)/i, message: 'Teologia da prosperidade / determinação de bens materiais' },
  { regex: /falta de f[ée] causou (a sua|sua|tua) doen[çc]a/i, message: 'Afirmação culpabilizante anti-bíblica associando doença estritamente à falta de fé' },
  { regex: /Deus me revelou uma nova doutrina/i, message: 'Pretensa nova revelação fora do cânon das Escrituras' }
];

export function validateDevotionalDeterministically(devotional: DevotionalPublic): DeterministicValidationResult {
  const errors: string[] = [];
  const criticalErrors: CriticalError[] = [];

  // 1. Validate Date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(devotional.date)) {
    errors.push(`Data inválida (${devotional.date}). Deve seguir o formato YYYY-MM-DD.`);
  }

  // 2. Validate Biblical Book in 66 Canon
  const book = findBookByNameOrAbbreviation(devotional.verseOfTheDay.book);
  if (!book) {
    criticalErrors.push({
      code: 'CANON_VIOLATION',
      excerpt: devotional.verseOfTheDay.book,
      explanation: `O livro "${devotional.verseOfTheDay.book}" não pertence ao cânon protestante de 66 livros.`,
      suggestion: 'Utilizar exclusivamente livros do cânon protestante de 66 livros.'
    });
    errors.push(`Livro bíblico "${devotional.verseOfTheDay.book}" inválido.`);
  } else {
    // Validate chapter bound
    if (devotional.verseOfTheDay.chapter < 1 || devotional.verseOfTheDay.chapter > book.chapters) {
      criticalErrors.push({
        code: 'INVALID_CHAPTER',
        excerpt: `${devotional.verseOfTheDay.book} ${devotional.verseOfTheDay.chapter}`,
        explanation: `O capítulo ${devotional.verseOfTheDay.chapter} não existe em ${book.name} (total de capítulos: ${book.chapters}).`
      });
      errors.push(`Capítulo ${devotional.verseOfTheDay.chapter} inexistente em ${book.name}.`);
    }
  }

  // 3. Validate Verses
  if (devotional.verseOfTheDay.startVerse < 1 || devotional.verseOfTheDay.endVerse < devotional.verseOfTheDay.startVerse) {
    errors.push(`Intervalo de versículos inválido: ${devotional.verseOfTheDay.startVerse}-${devotional.verseOfTheDay.endVerse}.`);
  }

  // 4. Validate Text Lengths
  if (!devotional.title || devotional.title.trim().length < 3) {
    errors.push('Título muito curto ou ausente.');
  }

  const reflectionWordCount = devotional.reflection.trim().split(/\s+/).length;
  if (reflectionWordCount < 80) {
    errors.push(`Reflexão insuficiente (${reflectionWordCount} palavras). Mínimo esperado: 80 palavras.`);
  }

  if (!devotional.application || devotional.application.trim().length < 30) {
    errors.push('Aplicação prática ausente ou excessivamente curta.');
  }

  if (!devotional.prayer || devotional.prayer.trim().length < 20) {
    errors.push('Oração sugerida ausente ou excessivamente curta.');
  }

  // 5. Validate Music Recommendation
  if (devotional.musicId) {
    const song = getSongById(devotional.musicId);
    if (!song) {
      criticalErrors.push({
        code: 'UNVERIFIED_MUSIC',
        excerpt: devotional.musicId,
        explanation: `A música com ID "${devotional.musicId}" não pertence ao catálogo autorizado de músicas cristãs verificadas.`,
        suggestion: 'Selecione uma música estritamente a partir do catálogo verificado.'
      });
      errors.push(`Música não verificada: ${devotional.musicId}`);
    }
  }

  // 6. Scan for Forbidden Prosperity / Manipulative Patterns
  const fullContent = `${devotional.title} ${devotional.reflection} ${devotional.application} ${devotional.prayer}`;
  for (const pattern of FORBIDDEN_THEOLOGICAL_PATTERNS) {
    if (pattern.regex.test(fullContent)) {
      criticalErrors.push({
        code: 'THEOLOGICAL_DEVIATION',
        excerpt: fullContent.match(pattern.regex)?.[0] || '',
        explanation: pattern.message,
        suggestion: 'Remova qualquer distorção teológica de prosperidade ou manipulação espiritual.'
      });
      errors.push(`Distorção detectada: ${pattern.message}`);
    }
  }

  return {
    isValid: errors.length === 0 && criticalErrors.length === 0,
    errors,
    criticalErrors
  };
}
