import { GoogleGenAI } from '@google/genai';
import { BiblicalPassage } from '../../content/passages/catalog';
import { VERIFIED_SONGS_CATALOG, getSongById, resolveVerifiedSong } from '../../content/songs/catalog';
import { DevotionalGeneratedContent, DevotionalGeneratedContentSchema, ReviewerRawResponseSchema, EvaluationResult, DevotionalPublic } from './schemas';
import { calculateEvaluationScore } from './evaluation-calculator';
import { validateDevotionalDeterministically } from './deterministic-validator';

export interface GenerationOptions {
  writerApiKey?: string;
  reviewerApiKey?: string;
  modelName?: string;
  maxCorrections?: number;
}

/**
 * Executes the full generation, deterministic validation, review, and auto-correction loop
 */
export async function generateAndEvaluateDevotional(
  passage: BiblicalPassage,
  dateStr: string,
  options: GenerationOptions = {}
): Promise<{
  devotional: DevotionalPublic;
  evaluation: EvaluationResult;
  history: Array<{ revision: number; evaluation: EvaluationResult; feedback?: string }>;
}> {
  const writerKey = options.writerApiKey || process.env.GEMINI_WRITER_API_KEY;
  const reviewerKey = options.reviewerApiKey || process.env.GEMINI_REVIEWER_API_KEY || writerKey;
  const modelName = options.modelName || process.env.GEMINI_MODEL_NAME || 'gemini-flash-latest';
  const maxCorrections = options.maxCorrections ?? 2;

  if (!writerKey) {
    throw new Error('Chave de API do Gemini Escritor não configurada.');
  }

  const writerAi = new GoogleGenAI({ apiKey: writerKey });
  const reviewerAi = new GoogleGenAI({ apiKey: reviewerKey || writerKey });

  let currentRevision = 0;
  let feedback = '';
  const history: Array<{ revision: number; evaluation: EvaluationResult; feedback?: string }> = [];

  let generatedContent: DevotionalGeneratedContent | null = null;
  let currentEvaluation: EvaluationResult | null = null;

  while (currentRevision <= maxCorrections) {
    currentRevision++;

    // 1. Generation Step (Gemini Escritor)
    generatedContent = await callGeminiWriter(writerAi, passage, dateStr, feedback, modelName);

    // 2. Build candidate Devotional strictly with a verified real song
    const candidateSong = resolveVerifiedSong(generatedContent.musicId, generatedContent.theme || passage.theme);
    const candidateDevotional: DevotionalPublic = {
      schemaVersion: 1,
      id: dateStr,
      date: dateStr,
      title: generatedContent.title,
      verseOfTheDay: {
        book: passage.book,
        chapter: passage.chapter,
        startVerse: passage.startVerse,
        endVerse: passage.endVerse,
        reference: passage.reference,
        passageId: passage.id,
        text: passage.text
      },
      contextSummary: passage.contextSummary,
      theme: generatedContent.theme || passage.theme,
      reflection: generatedContent.reflection,
      application: generatedContent.application,
      prayer: generatedContent.prayer,
      estimatedMinutes: generatedContent.estimatedMinutes || 5,
      musicId: candidateSong.id,
      music: candidateSong,
      editorialStatus: 'under_review'
    };

    // 3. Deterministic Validation
    const detValidation = validateDevotionalDeterministically(candidateDevotional);

    // 4. Review Step (Gemini Revisor)
    currentEvaluation = await callGeminiReviewer(reviewerAi, passage, candidateDevotional, modelName);

    // Merge any deterministic critical errors into evaluation
    if (detValidation.criticalErrors.length > 0) {
      currentEvaluation.criticalErrors.push(...detValidation.criticalErrors);
      // Recalculate with deterministic errors
      currentEvaluation = calculateEvaluationScore(
        currentEvaluation.criteria,
        currentEvaluation.criticalErrors,
        dateStr,
        `Rejeitado por validação determinística: ${detValidation.errors.join(', ')}`
      );
    }

    history.push({
      revision: currentRevision,
      evaluation: currentEvaluation,
      feedback
    });

    // Check approval
    if (currentEvaluation.approvedByAI && !currentEvaluation.requiresHumanReview) {
      candidateDevotional.editorialStatus = 'approved';
      candidateDevotional.evaluation = {
        score: currentEvaluation.weightedScore,
        approvedByAI: true,
        criticalErrors: []
      };
      return {
        devotional: candidateDevotional,
        evaluation: currentEvaluation,
        history
      };
    }

    // Prepare feedback for correction loop if attempts remain
    if (currentRevision <= maxCorrections) {
      const issues: string[] = [];
      if (currentEvaluation.criticalErrors.length > 0) {
        issues.push(...currentEvaluation.criticalErrors.map(e => `ERRO CRÍTICO [${e.code}]: ${e.explanation}. Sugestão: ${e.suggestion || 'Corrigir'}`));
      }
      Object.entries(currentEvaluation.criteria).forEach(([key, val]) => {
        if (val.score < 9) {
          issues.push(`Critério "${key}" recebeu nota ${val.score}/10: ${val.reason}`);
        }
      });
      feedback = issues.join('\n');
    }
  }

  // If still not approved after max revisions
  const finalSong = resolveVerifiedSong(generatedContent?.musicId, generatedContent?.theme || passage.theme);
  const finalDevotional: DevotionalPublic = {
    schemaVersion: 1,
    id: dateStr,
    date: dateStr,
    title: generatedContent!.title,
    verseOfTheDay: {
      book: passage.book,
      chapter: passage.chapter,
      startVerse: passage.startVerse,
      endVerse: passage.endVerse,
      reference: passage.reference,
      passageId: passage.id,
      text: passage.text
    },
    contextSummary: passage.contextSummary,
    theme: generatedContent!.theme || passage.theme,
    reflection: generatedContent!.reflection,
    application: generatedContent!.application,
    prayer: generatedContent!.prayer,
    estimatedMinutes: generatedContent!.estimatedMinutes || 5,
    musicId: finalSong.id,
    music: finalSong,
    evaluation: {
      score: currentEvaluation!.weightedScore,
      approvedByAI: false,
      criticalErrors: currentEvaluation!.criticalErrors.map(e => e.explanation)
    },
    editorialStatus: 'rejected'
  };

  return {
    devotional: finalDevotional,
    evaluation: currentEvaluation!,
    history
  };
}

async function callGeminiWriter(
  ai: GoogleGenAI,
  passage: BiblicalPassage,
  dateStr: string,
  feedback: string,
  modelName: string
): Promise<DevotionalGeneratedContent> {
  const songsList = VERIFIED_SONGS_CATALOG.map(s => `- ID: "${s.id}", Título: "${s.title}" (${s.artist}) - Tema: ${s.theme}`).join('\n');

  const prompt = `
Você é o Gemini Escritor do aplicativo Amanhecer.
DATA: ${dateStr}
PASSAGEM: ${passage.reference}
TEXTO BÍBLICO AUTORIZADO: "${passage.text}"
CONTEXTO DA PASSAGEM: ${passage.contextSummary}
TEMA CENTRAL: ${passage.theme}

CATÁLOGO DE MÚSICAS VERIFICADAS DISPONÍVEIS:
${songsList}

${feedback ? `\nATENÇÃO - CORREÇÃO EXIGIDA DA REVISÃO ANTERIOR:\n${feedback}\nCorrija pontualmente os problemas identificados acima com máxima fidelidade bíblica.` : ''}

Escreva uma reflexão bíblica responsável, profunda e simples (250 a 400 palavras), uma aplicação prática bíblica e uma oração sincera.
ATENÇÃO PARA A MÚSICA: Escolha ESTRITAMENTE um ID do catálogo acima (ex: "song-001", "song-002", etc.). NUNCA invente títulos, bandas ou canções que não estejam na lista acima.
Retorne EXCLUSIVAMENTE um JSON puro sem crases com as chaves:
{ "title", "reflection", "application", "prayer", "estimatedMinutes", "musicId", "theme" }
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const text = response.text || '';
  const parsed = JSON.parse(text);
  return DevotionalGeneratedContentSchema.parse(parsed);
}

async function callGeminiReviewer(
  ai: GoogleGenAI,
  passage: BiblicalPassage,
  candidate: DevotionalPublic,
  modelName: string
): Promise<EvaluationResult> {
  const prompt = `
Você é o Gemini Revisor teológico do aplicativo Amanhecer. Avalie com extremo rigor bíblico.
PASSAGEM BÍBLICA: ${passage.reference}
TEXTO ORIGINAL: "${passage.text}"
CONTEXTO: ${passage.contextSummary}

DEVOCIONAL SUBMETIDO:
Título: ${candidate.title}
Reflexão: ${candidate.reflection}
Aplicação: ${candidate.application}
Oração: ${candidate.prayer}
Música recomendada ID: ${candidate.musicId}

Avalie os 8 critérios com notas inteiras de 0 a 10:
- biblicalFidelity (peso 20%, mínimo 9)
- absenceOfDistortion (peso 20%, mínimo 9)
- edification (peso 15%, mínimo 8)
- coherence (peso 15%, mínimo 8)
- theologicalAlignment (peso 10%, mínimo 8)
- clarity (peso 5%, mínimo 8)
- responsibility (peso 10%, mínimo 8)
- originality (peso 5%, mínimo 8)

Se houver qualquer erro bíblico grave, distorção de prosperidade, versículo inexistente ou música desconhecida, aponte no array criticalErrors.

Retorne EXCLUSIVAMENTE um JSON com as chaves:
{
  "criteria": { ... },
  "criticalErrors": [ ... ],
  "reviewSummary": "..."
}
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const text = response.text || '';
  const rawReview = ReviewerRawResponseSchema.parse(JSON.parse(text));

  // Recalculate deterministically
  return calculateEvaluationScore(
    rawReview.criteria,
    rawReview.criticalErrors,
    candidate.id,
    rawReview.reviewSummary
  );
}
