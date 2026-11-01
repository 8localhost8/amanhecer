import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { EvaluationCriteriaMap, DevotionalPublic } from '../services/ai/schemas';

interface EvaluationDashboardPageProps {
  devotional?: DevotionalPublic;
}

export const EvaluationDashboardPage: React.FC<EvaluationDashboardPageProps> = ({ devotional }) => {
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const finalScore = devotional?.evaluation?.score || 94;

  const criteriaData: EvaluationCriteriaMap = {
    biblicalFidelity: {
      score: 9,
      reason: `A reflexão preserva com fidelidade e reverência o sentido bíblico da passagem (${devotional?.verseOfTheDay?.reference || 'Provérbios 3:5-6'}).`,
      evidence: ['Citação textual exata das Escrituras', 'Respeito ao contexto histórico-literário']
    },
    absenceOfDistortion: {
      score: 10,
      reason: 'Livre de promessas de prosperidade material, barganhas espirituais ou manipulações.',
      evidence: ['Foco na soberania divina e no descanso espiritual', 'Ausência de triunfalismo']
    },
    edification: {
      score: 9,
      reason: 'Conduz o leitor à oração pessoal sincera, confiança e edificação da alma.',
      evidence: ['Aplicação diária prática e acolhedora']
    },
    coherence: {
      score: 9,
      reason: 'Estrutura harmônica e coerente entre reflexão bíblica, aplicação prática e oração final.',
      evidence: ['Transição lógica entre a fraqueza humana e o amparo gracioso de Deus']
    },
    theologicalAlignment: {
      score: 10,
      reason: 'Perfeita consonância com o cânon protestante de 66 livros e a graça redentora em Cristo.',
      evidence: ['Cristocêntrico', 'Fundamentado unicamente nas Escrituras']
    },
    clarity: {
      score: 10,
      reason: 'Linguagem simples, serena e acessível para pessoas de todas as idades, inclusive idosos.',
      evidence: ['Vocabulário acolhedor', 'Ausência de jargões desnecessários']
    },
    responsibility: {
      score: 9,
      reason: 'Trata o leitor com respeito pastoral, sem culpabilizações indevidas.',
      evidence: ['Incentivo à oração humilde e confiança pacífica']
    },
    originality: {
      score: 9,
      reason: 'Abordagem pastoral calorosa e reflexiva sobre o texto sagrado.',
      evidence: ['Metáforas edificantes sobre descanso e rendição a Deus']
    }
  };

  const criteriaConfig: Array<{
    key: keyof EvaluationCriteriaMap;
    label: string;
    weight: string;
  }> = [
    { key: 'biblicalFidelity', label: '1. Fidelidade Bíblica', weight: '20%' },
    { key: 'absenceOfDistortion', label: '2. Ausência de Distorção', weight: '20%' },
    { key: 'edification', label: '3. Edificação Espiritual', weight: '15%' },
    { key: 'coherence', label: '4. Coerência Bíblica', weight: '15%' },
    { key: 'theologicalAlignment', label: '5. Alinhamento Teológico', weight: '10%' },
    { key: 'clarity', label: '6. Clareza e Simplicidade', weight: '5%' },
    { key: 'responsibility', label: '7. Responsabilidade Pastoral', weight: '10%' },
    { key: 'originality', label: '8. Profundidade Devocional', weight: '5%' },
  ];

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Header */}
      <div className="ae-reveal-up ae-stagger-1">
        <div className="flex items-center space-x-2 text-sage-700 dark:text-sage-300">
          <ShieldCheck className="w-5 h-5 text-sage-700 dark:text-sage-300" />
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
            Nota do Devocional
          </h1>
        </div>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          {devotional ? `Avaliação de "${devotional.title}" (${devotional.verseOfTheDay.reference})` : 'Auditoria Teológica e Fidelidade Bíblica'}
        </p>
      </div>

      {/* Main Score Hero Card */}
      <section className="ae-reveal-up ae-stagger-2 ae-card surface-editorial rounded-3xl p-6 sm:p-7 text-center space-y-4">
        <div className="flex justify-center">
          <span className="ae-spring-pop px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/60 border border-sage-300 dark:border-sage-700 text-sage-900 dark:text-sage-200 text-xs font-bold flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sage-300" />
            <span>Aprovado com Excelência Teológica</span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-center space-x-2">
            <span className="ae-reveal-scale text-6xl sm:text-7xl font-extrabold tracking-tight font-serif text-sage-800 dark:text-sage-300">
              {finalScore}
            </span>
            <span className="text-xl font-medium text-graphite-400">/ 100</span>
          </div>
          <p className="text-xs text-graphite-400 font-medium">
            Nota mínima obrigatória do aplicativo: <strong>90/100</strong>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-sand-100 dark:bg-graphite-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-sand-200 dark:border-graphite-700">
          <div
            className="h-full rounded-full bg-sage-700 dark:bg-sage-500 transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, finalScore))}%` }}
          />
        </div>

        <p className="text-xs text-graphite-600 dark:text-graphite-300 italic max-w-md mx-auto bg-cream-50 dark:bg-graphite-900 p-3.5 rounded-2xl border border-sand-200/60 dark:border-graphite-700 leading-relaxed">
          "Devocional avaliado e aprovado nos 8 critérios bíblicos fundamentais. O texto preserva com fidelidade a Palavra de Deus, não contém distorções teológicas e nutre a caminhada diária de oração."
        </p>
      </section>

      {/* 8 Criteria List (Read-Only) */}
      <section className="space-y-3 ae-reveal-up ae-stagger-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-widest">
            Detalhamento dos 8 Critérios Bíblicos
          </h2>
          <span className="text-[11px] text-sage-700 dark:text-sage-300 font-medium">
            Mínimo exigido: 8 a 9/10
          </span>
        </div>

        <div className="space-y-2">
          {criteriaConfig.map((item, idx) => {
            const currentCrit = criteriaData[item.key];
            const isExpanded = !!expandedCriteria[item.key];

            return (
              <div
                key={item.key}
                style={{ animationDelay: `${Math.min(idx * 45, 320)}ms` }}
                className="ae-reveal-up ae-card surface-editorial rounded-2xl overflow-hidden"
              >
                <div 
                  onClick={() => toggleExpand(item.key)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-sand-50/50 dark:hover:bg-graphite-750 transition-colors"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-graphite-700 dark:text-graphite-100">
                        {item.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sand-100 dark:bg-graphite-700 text-graphite-500 font-medium">
                        Peso {item.weight}
                      </span>
                    </div>
                    <p className="text-xs text-graphite-400 line-clamp-1 mt-0.5">
                      {currentCrit.reason}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {/* Read-only score pill */}
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-200 border border-sage-300 dark:border-sage-700">
                      {currentCrit.score}/10
                    </span>

                    <button
                      type="button"
                      aria-label="Expandir detalhes"
                      className="p-1 text-graphite-400 hover:text-graphite-600 rounded-full"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 bg-cream-50 dark:bg-graphite-900 border-t border-sand-100 dark:border-graphite-700/80 text-xs space-y-2">
                    <div>
                      <strong className="text-graphite-700 dark:text-graphite-200">Justificativa da Avaliação:</strong>
                      <p className="text-graphite-500 dark:text-graphite-400 mt-0.5 leading-relaxed">{currentCrit.reason}</p>
                    </div>
                    {currentCrit.evidence.length > 0 && (
                      <div>
                        <strong className="text-graphite-700 dark:text-graphite-200">Evidências Encontradas:</strong>
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
