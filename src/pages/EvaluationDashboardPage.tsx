import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp, RefreshCw, Sliders } from 'lucide-react';
import { EvaluationCriteriaMap, CriticalError, EvaluationResult } from '../services/ai/schemas';
import { calculateEvaluationScore } from '../services/ai/evaluation-calculator';

export const EvaluationDashboardPage: React.FC = () => {
  // Sample production criteria baseline
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

  // Recalculate evaluation deterministically
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
          <span>Reprovado (&lt; 90/100 ou critério eliminatório)</span>
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
      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1">
        <CheckCircle className="w-3.5 h-3.5" />
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
    <div className="space-y-6 pb-28 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-dawn-600 dark:text-dawn-400">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Nota do Devocional
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Painel de Auditoria Teológica e Avaliação Automatizada com Recálculo Determinístico
        </p>
      </div>

      {/* Main Score Hero Card */}
      <section className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden space-y-4">
        <div className="flex justify-center">
          {getStatusBadge()}
        </div>

        {/* Big Score Typography */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-center space-x-2">
            <span className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${
              evaluation.approvedByAI
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {evaluation.weightedScore}
            </span>
            <span className="text-2xl font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Nota mínima para aprovação: <strong>90/100</strong> sem critérios eliminatórios
          </p>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              evaluation.approvedByAI
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-rose-500 to-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, evaluation.weightedScore))}%` }}
          />
        </div>

        {/* Summary text */}
        <p className="text-xs text-slate-600 dark:text-slate-300 italic max-w-lg mx-auto bg-slate-50 dark:bg-midnight-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          "{evaluation.reviewSummary}"
        </p>
      </section>

      {/* Interactive Audit Simulator Controls */}
      <div className="bg-dawn-50/60 dark:bg-midnight-900 border border-dawn-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <Sliders className="w-4 h-4 text-dawn-600 dark:text-dawn-400" />
          <span><strong>Simulador Interativo:</strong> Ajuste as notas abaixo para testar o recálculo e as regras eliminatórias em tempo real.</span>
        </div>

        <button
          onClick={handleToggleSampleCriticalError}
          className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
            criticalErrors.length > 0
              ? 'bg-rose-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {criticalErrors.length > 0 ? 'Remover Erro Crítico Simulado' : 'Simular Erro Crítico (Distorção)'}
        </button>
      </div>

      {/* Critical Errors Box (if any) */}
      {criticalErrors.length > 0 && (
        <section className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-3xl p-5 space-y-3">
          <h2 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Erros Críticos Eliminatórios Detectados ({criticalErrors.length})</span>
          </h2>

          {criticalErrors.map((err, idx) => (
            <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-rose-700 dark:text-rose-400">
                Código: [{err.code}]
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>Trecho afetado:</strong> "{err.excerpt}"
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Explicação:</strong> {err.explanation}
              </p>
              {err.suggestion && (
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  <strong>Sugestão:</strong> {err.suggestion}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 8 Criteria Detailed Grid */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Os 8 Critérios de Avaliação Bíblica
        </h2>

        <div className="space-y-2.5">
          {criteriaConfig.map((item) => {
            const currentCrit = criteria[item.key];
            const isFailing = currentCrit.score < item.minRequired;
            const isExpanded = !!expandedCriteria[item.key];

            return (
              <div
                key={item.key}
                className={`bg-white dark:bg-midnight-900 border rounded-2xl transition-all shadow-sm overflow-hidden ${
                  isFailing
                    ? 'border-rose-300 dark:border-rose-900'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Peso {item.weight}
                      </span>
                      {isFailing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          Abaixo do corte (mín. {item.minRequired})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {currentCrit.reason}
                    </p>
                  </div>

                  {/* Score Selector & Expand Toggle */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <select
                        value={currentCrit.score}
                        onChange={(e) => updateScore(item.key, parseInt(e.target.value, 10))}
                        className={`text-sm font-bold px-2 py-1 rounded-xl border ${
                          isFailing
                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n}/10</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => toggleExpand(item.key)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      aria-label="Expandir detalhes do critério"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50 dark:bg-midnight-950 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Justificativa analítica:</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{currentCrit.reason}</p>
                    </div>
                    {currentCrit.evidence.length > 0 && (
                      <div>
                        <strong className="text-slate-700 dark:text-slate-300">Evidências observadas:</strong>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mt-0.5 space-y-0.5">
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
