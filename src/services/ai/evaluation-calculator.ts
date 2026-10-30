import { EvaluationCriteriaMap, CriticalError, EvaluationResult } from './schemas';

export interface ScoreBreakdown {
  weightedScore: number;
  approvedByAI: boolean;
  requiresHumanReview: boolean;
  status: 'approved' | 'rejected' | 'critical_error' | 'human_review_required';
  rejectionReasons: string[];
}

/**
 * Deterministically calculates the weighted score and checks all eliminatory criteria.
 * NEVER blindly trusts an AI-reported score.
 */
export function calculateEvaluationScore(
  criteria: EvaluationCriteriaMap,
  criticalErrors: CriticalError[] = [],
  devotionalId: string = 'devotional-audit',
  summary: string = ''
): EvaluationResult {
  const bf = criteria.biblicalFidelity.score;
  const ad = criteria.absenceOfDistortion.score;
  const ed = criteria.edification.score;
  const co = criteria.coherence.score;
  const ta = criteria.theologicalAlignment.score;
  const cl = criteria.clarity.score;
  const rs = criteria.responsibility.score;
  const og = criteria.originality.score;

  // Exact Formula:
  // (Fidelidade * 2) + (Ausência de Distorção * 2) + (Edificação * 1.5) + (Coerência * 1.5)
  // + (Alinhamento * 1) + (Clareza * 0.5) + (Responsabilidade * 1) + (Originalidade * 0.5)
  const rawScore = 
    (bf * 2.0) +
    (ad * 2.0) +
    (ed * 1.5) +
    (co * 1.5) +
    (ta * 1.0) +
    (cl * 0.5) +
    (rs * 1.0) +
    (og * 0.5);

  const weightedScore = Math.round(rawScore * 10) / 10;
  const rejectionReasons: string[] = [];

  // Eliminatory Rules check:
  if (criticalErrors.length > 0) {
    criticalErrors.forEach(err => {
      rejectionReasons.push(`Erro Crítico [${err.code}]: ${err.explanation}`);
    });
  }

  if (bf < 9) {
    rejectionReasons.push(`Fidelidade Bíblica insuficiente (${bf}/10). Mínimo exigido: 9.`);
  }

  if (ad < 9) {
    rejectionReasons.push(`Ausência de Distorção insuficiente (${ad}/10). Mínimo exigido: 9.`);
  }

  if (ta < 8) {
    rejectionReasons.push(`Alinhamento Teológico insuficiente (${ta}/10). Mínimo exigido: 8.`);
  }

  if (rs < 8) {
    rejectionReasons.push(`Responsabilidade insuficiente (${rs}/10). Mínimo exigido: 8.`);
  }

  if (ed < 8) {
    rejectionReasons.push(`Edificação insuficiente (${ed}/10). Mínimo exigido: 8.`);
  }

  if (co < 8) {
    rejectionReasons.push(`Coerência insuficiente (${co}/10). Mínimo exigido: 8.`);
  }

  if (cl < 8) {
    rejectionReasons.push(`Clareza insuficiente (${cl}/10). Mínimo exigido: 8.`);
  }

  if (og < 8) {
    rejectionReasons.push(`Originalidade insuficiente (${og}/10). Mínimo exigido: 8.`);
  }

  if (weightedScore < 90) {
    rejectionReasons.push(`Nota final calculada (${weightedScore}/100) inferior ao corte mínimo obrigatório de 90/100.`);
  }

  let status: 'approved' | 'rejected' | 'critical_error' | 'human_review_required' = 'approved';
  let approvedByAI = false;
  let requiresHumanReview = false;

  if (criticalErrors.length > 0) {
    status = 'critical_error';
    approvedByAI = false;
    requiresHumanReview = true;
  } else if (rejectionReasons.length > 0) {
    status = 'rejected';
    approvedByAI = false;
  } else {
    status = 'approved';
    approvedByAI = true;
  }

  // Check for subtle theological flags that warrant human review
  const allReasonsText = Object.values(criteria).map(c => c.reason).join(' ').toLowerCase();
  if (allReasonsText.includes('divergência') || allReasonsText.includes('revisão humana') || allReasonsText.includes('controvérsia')) {
    requiresHumanReview = true;
    if (status === 'approved') {
      status = 'human_review_required';
    }
  }

  return {
    devotionalId,
    criteria,
    criticalErrors,
    weightedScore,
    approvedByAI,
    requiresHumanReview,
    reviewSummary: summary || (approvedByAI ? 'Devocional aprovado tecnicamente com rigor bíblico.' : rejectionReasons.join('; ')),
    status,
    calculatedAt: new Date().toISOString()
  };
}
