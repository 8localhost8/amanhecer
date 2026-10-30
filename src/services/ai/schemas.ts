import { z } from 'zod';

export const CriterionEvaluationSchema = z.object({
  score: z.number().int().min(0).max(10),
  reason: z.string().min(5),
  evidence: z.array(z.string()).default([])
});

export const CriticalErrorSchema = z.object({
  code: z.string(),
  excerpt: z.string(),
  explanation: z.string(),
  biblicalEvidence: z.string().optional(),
  suggestion: z.string().optional()
});

export const EvaluationCriteriaMapSchema = z.object({
  biblicalFidelity: CriterionEvaluationSchema,
  absenceOfDistortion: CriterionEvaluationSchema,
  edification: CriterionEvaluationSchema,
  coherence: CriterionEvaluationSchema,
  theologicalAlignment: CriterionEvaluationSchema,
  clarity: CriterionEvaluationSchema,
  responsibility: CriterionEvaluationSchema,
  originality: CriterionEvaluationSchema,
});

export const ReviewerRawResponseSchema = z.object({
  criteria: EvaluationCriteriaMapSchema,
  criticalErrors: z.array(CriticalErrorSchema).default([]),
  reviewSummary: z.string().min(5)
});

export const DevotionalGeneratedContentSchema = z.object({
  title: z.string().min(3).max(100),
  reflection: z.string().min(200).max(3500),
  application: z.string().min(50).max(1500),
  prayer: z.string().min(30).max(1000),
  estimatedMinutes: z.number().int().min(1).max(20).default(5),
  musicId: z.string(),
  theme: z.string()
});

export type CriterionEvaluation = z.infer<typeof CriterionEvaluationSchema>;
export type CriticalError = z.infer<typeof CriticalErrorSchema>;
export type EvaluationCriteriaMap = z.infer<typeof EvaluationCriteriaMapSchema>;
export type ReviewerRawResponse = z.infer<typeof ReviewerRawResponseSchema>;
export type DevotionalGeneratedContent = z.infer<typeof DevotionalGeneratedContentSchema>;

export interface EvaluationResult {
  devotionalId: string;
  criteria: EvaluationCriteriaMap;
  criticalErrors: CriticalError[];
  weightedScore: number;
  approvedByAI: boolean;
  requiresHumanReview: boolean;
  reviewSummary: string;
  status: 'approved' | 'rejected' | 'critical_error' | 'human_review_required';
  calculatedAt: string;
}

export interface DevotionalPublic {
  schemaVersion: 1;
  id: string;
  date: string;
  title: string;
  verseOfTheDay: {
    book: string;
    chapter: number;
    startVerse: number;
    endVerse: number;
    reference: string;
    passageId: string;
    text: string;
  };
  contextSummary: string;
  theme: string;
  reflection: string;
  application: string;
  prayer: string;
  estimatedMinutes: number;
  musicId: string;
  music?: {
    id: string;
    title: string;
    artist: string;
    theme: string;
    recommendationReason: string;
    youtubeUrl: string;
    spotifyUrl: string;
  };
  evaluation?: {
    score: number;
    approvedByAI: boolean;
    criticalErrors: string[];
  };
  editorialStatus: 'draft' | 'under_review' | 'approved' | 'rejected' | 'published';
}
