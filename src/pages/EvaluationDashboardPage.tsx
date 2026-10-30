import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { EvaluationCriteriaMap, CriticalError, EvaluationResult } from '../services/ai/schemas';
import { calculateEvaluationScore } from '../services/ai/evaluation-calculator';

export const EvaluationDashboardPage: React.FC = () => {
  const [criteria, setCriteria] = useState<EvaluationCriteriaMap>({
    biblicalFidelity: {
      score: 9,
      reason: 'A reflexão preserva rigorosamente o sentido histórico e literário de Provérbios 3:5-6.',
      evidence: ['Cita o texto bíblico com exatidão', 'Contextualiza a instrução de Salomão']
    },
    absenceOfDistortion: {
      score: 9,
      reason: 'Nenhuma distorção motivacional ou de prosperidade foi identificada.',
      evidence: ['Enfatiza soberania de Deus em vez de promessas vazias']
    },
    edification: {
      score: 9,
      reason: 'A reflexão e a aplicação prática conduzem o leitor à oração e dependência humilde.',
      evidence: ['Aplicação diária focada em serenidade e confiança']
    },
    coherence: {
      score: 9,
      reason: 'Estrutura lógica consistente entre reflexão bíblica, aplicação e oração.',
      evidence: ['Transição natural entre a fraqueza humana e a direção divina']
    },
    theologicalAlignment: {
      score: 9,
      reason: 'Perfeita consonância com o cânon protestante de 66 livros e a graça cristã.',
      evidence: ['Cristocêntrico e bíblico']
    },
    clarity: {
      score: 10,
      reason: 'Linguagem límpida, acolhedora e acessível para qualquer faixa etária.',
      evidence: ['Parágrafos bem distribuídos, sem jargões desnecessários']
    },
    responsibility: {
      score: 10,
      reason: 'Trata as limitações humanas com serenidade pastoral; sem culpabilizações.',
      evidence: ['Livre de apelos triunfalistas ou coação']
    },
    originality: {
      score: 9,
      reason: 'Abordagem pastoral profunda e específica sobre o texto bíblico.',
      evidence: ['Excelente metáfora da autonomia versus descanso']
    }
  });

  const [criticalErrors, setCriticalErrors] = useState<CriticalError[]>([]);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const evaluation: EvaluationResult = calculateEvaluationScore(
    criteria,
    criticalErrors,
    'devotional-auditoria-2026',
    'Avaliação técnica detalhada'
  );

  const toggleExpand = (key: string) => {
    setExpandedCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateScore = (key: keyof EvaluationCriteriaMap, newScore: number) => {
    setCriteria(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        score: Math.max(0, Math.min(10, newScore))
      }
    }));
  };

  const handleToggleSampleCriticalError = () => {
    if (criticalErrors.length > 0) {
      setCriticalErrors([]);
    } else {
      setCriticalErrors([
        {
          code: 'PROSPERITY_DISTORTION',
          excerpt: 'Deus promete enriquecimento financeiro imediato a quem orar este devocional.',
          explanation: 'Distorção grave da teologia da prosperidade não autorizada pelas Escrituras.',
          suggestion: 'Remover promessas materiais e enfatizar a providência espiritual.'
        }
      ]);
    }
  };

  const getStatusBadge = () => {
    if (evaluation.status === 'critical_error') {
      return (
        <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>Reprovado por Erro Crítico</span>
        </span>
      );
    }
    if (evaluation.status === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center space-x-1">
          <XCircle className="w-3.5 h-3.5" />
          <span>Reprovado (&lt; 90/100 ou corte individual)</span>
        </span>
      );
    }
    if (evaluation.status === 'human_review_required') {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Revisão Humana Necessária</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/60 border border-sage-300 dark:border-sage-700 text-sage-900 dark:text-sage-200 text-xs font-bold flex items-center space-x-1">
        <CheckCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sage-300" />
        <span>Aprovado Tecnicamente</span>
      </span>
    );
  };

  const criteriaConfig: Array<{
    key: keyof EvaluationCriteriaMap;
    label: string;
    weight: string;
    minRequired: number;
  }> = [
    { key: 'biblicalFidelity', label: '1. Fidelidade Bíblica', weight: '20%', minRequired: 9 },
    { key: 'absenceOfDistortion', label: '2. Ausência de Distorção', weight: '20%', minRequired: 9 },
    { key: 'edification', label: '3. Edificação', weight: '15%', minRequired: 8 },
    { key: 'coherence', label: '4. Coerência', weight: '15%', minRequired: 8 },
    { key: 'theologicalAlignment', label: '5. Alinhamento Teológico', weight: '10%', minRequired: 8 },
    { key: 'clarity', label: '6. Clareza', weight: '5%', minRequired: 8 },
    { key: 'responsibility', label: '7. Responsabilidade', weight: '10%', minRequired: 8 },
    { key: 'originality', label: '8. Originalidade', weight: '5%', minRequired: 8 },
  ];

  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-sage-700 dark:text-sage-300">
          <ShieldCheck className="w-5 h-5 text-sage-700 dark:text-sage-300" />
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
            Nota do Devocional
          </h1>
        </div>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          Auditoria Teológica e Avaliação Automatizada com Recálculo Determinístico
        </p>
      </div>

      {/* Main Score Hero */}
      <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-6 sm:p-7 shadow-xs text-center space-y-4">
        <div className="flex justify-center">
          {getStatusBadge()}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-center space-x-2">
            <span className={`text-6xl sm:text-7xl font-extrabold tracking-tight font-serif ${
              evaluation.approvedByAI
                ? 'text-sage-800 dark:text-sage-300'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {evaluation.weightedScore}
            </span>
            <span className="text-xl font-medium text-graphite-400">/ 100</span>
          </div>
          <p className="text-xs text-graphite-400 font-medium">
            Nota mínima obrigatória: <strong>90/100</strong> sem critérios eliminatórios
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-sand-100 dark:bg-graphite-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-sand-200 dark:border-graphite-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              evaluation.approvedByAI
                ? 'bg-sage-700 dark:bg-sage-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, evaluation.weightedScore))}%` }}
          />
        </div>

        <p className="text-xs text-graphite-600 dark:text-graphite-300 italic max-w-md mx-auto bg-cream-50 dark:bg-graphite-900 p-3 rounded-2xl border border-sand-200/60 dark:border-graphite-700">
          "{evaluation.reviewSummary}"
        </p>
      </section>

      {/* Interactive Audit Simulator */}
      <div className="bg-sand-100/70 dark:bg-graphite-850 border border-sand-200 dark:border-graphite-700 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-graphite-600 dark:text-graphite-300">
          <Sliders className="w-4 h-4 text-sage-700 dark:text-sage-300" />
          <span><strong>Simulador:</strong> Altere as notas abaixo para testar o recálculo em tempo real.</span>
        </div>

        <button
          onClick={handleToggleSampleCriticalError}
          className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
            criticalErrors.length > 0
              ? 'bg-rose-600 text-white'
              : 'bg-white dark:bg-graphite-800 text-graphite-700 dark:text-graphite-200 border border-sand-200 dark:border-graphite-700'
          }`}
        >
          {criticalErrors.length > 0 ? 'Remover Erro Crítico' : 'Simular Erro Crítico (Distorção)'}
        </button>
      </div>

      {/* Critical Errors */}
      {criticalErrors.length > 0 && (
        <section className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-3xl p-5 space-y-3">
          <h2 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Erros Críticos Eliminatórios ({criticalErrors.length})</span>
          </h2>

          {criticalErrors.map((err, idx) => (
            <div key={idx} className="bg-white/80 dark:bg-graphite-900/80 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-rose-700 dark:text-rose-400">
                Código: [{err.code}]
              </div>
              <p className="text-graphite-800 dark:text-graphite-200">
                <strong>Trecho afetado:</strong> "{err.excerpt}"
              </p>
              <p className="text-graphite-600 dark:text-graphite-400">
                <strong>Explicação:</strong> {err.explanation}
              </p>
              {err.suggestion && (
                <p className="text-sage-800 dark:text-sage-300 font-medium">
                  <strong>Sugestão:</strong> {err.suggestion}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 8 Criteria List */}
      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-widest">
          Os 8 Critérios de Avaliação Bíblica
        </h2>

        <div className="space-y-2">
          {criteriaConfig.map((item) => {
            const currentCrit = criteria[item.key];
            const isFailing = currentCrit.score < item.minRequired;
            const isExpanded = !!expandedCriteria[item.key];

            return (
              <div
                key={item.key}
                className={`bg-white dark:bg-graphite-800 border rounded-2xl transition-all shadow-xs overflow-hidden ${
                  isFailing
                    ? 'border-rose-300 dark:border-rose-900'
                    : 'border-sand-200 dark:border-graphite-700'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-graphite-700 dark:text-graphite-100">
                        {item.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sand-100 dark:bg-graphite-700 text-graphite-500">
                        Peso {item.weight}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 line-clamp-1 mt-0.5">
                      {currentCrit.reason}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={currentCrit.score}
                      onChange={(e) => updateScore(item.key, parseInt(e.target.value, 10))}
                      className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        isFailing
                          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-sand-50 text-graphite-700 dark:bg-graphite-900 dark:text-graphite-200 border-sand-200 dark:border-graphite-700'
                      }`}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n}/10</option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleExpand(item.key)}
                      className="p-1 text-graphite-400 hover:text-graphite-600 rounded-full"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-cream-50 dark:bg-graphite-900 border-t border-sand-100 dark:border-graphite-700/80 text-xs space-y-1.5">
                    <div>
                      <strong className="text-graphite-700 dark:text-graphite-200">Justificativa:</strong>
                      <p className="text-graphite-500 dark:text-graphite-400 mt-0.5">{currentCrit.reason}</p>
                    </div>
                    {currentCrit.evidence.length > 0 && (
                      <div>
                        <strong className="text-graphite-700 dark:text-graphite-200">Evidências:</strong>
                        <ul className="list-disc list-inside text-graphite-500 dark:text-graphite-400 mt-0.5 space-y-0.5">
                          {currentCrit.evidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
