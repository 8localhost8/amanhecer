import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  CheckCircle2,
  Bookmark,
  Plus,
  Minus,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';
import { saveUserPreferences, loadUserPreferences } from '../storage/preferences';

interface DevotionalPageProps {
  devotional: DevotionalPublic;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
  isFav: boolean;
  onToggleFav: () => void;
}

export const DevotionalPage: React.FC<DevotionalPageProps> = ({
  devotional,
  onBack,
  onComplete,
  isCompleted,
  isFav,
  onToggleFav,
}) => {
  const [currentFontSize, setCurrentFontSize] = useState<number>(() => {
    return loadUserPreferences().fineFontSize || 18;
  });

  const handleAdjustFontSize = (delta: number) => {
    const nextSize = Math.min(32, Math.max(16, currentFontSize + delta));
    setCurrentFontSize(nextSize);
    saveUserPreferences({ fineFontSize: nextSize });
  };

  const handleShare = async () => {
    const text = `📖 Devocional: "${devotional.title}"\n${devotional.verseOfTheDay.reference}: "${devotional.verseOfTheDay.text}"\n\nLeia gratuitamente no Amanhecer: https://amanhecer-beta.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Devocional copiado!');
    }
  };

  return (
    <article className="max-w-xl mx-auto space-y-6 pb-36">
      {/* Top Bar Navigation (Dimensional Glass Pill Toolbar) */}
      <div className="flex items-center justify-between pt-2 ae-reveal-up ae-stagger-1">
        <button
          onClick={onBack}
          className="surface-editorial flex items-center space-x-1.5 text-xs font-bold text-graphite-700 hover:text-sage-900 dark:text-graphite-200 dark:hover:text-white px-3.5 py-2 rounded-full ae-btn group"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Início</span>
        </button>

        {/* Reading Controls: Font resize, Favorite, Share */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="surface-editorial flex items-center rounded-full px-2.5 py-1">
            <button
              onClick={() => handleAdjustFontSize(-2)}
              disabled={currentFontSize <= 16}
              className="p-1 text-graphite-600 hover:text-graphite-900 dark:text-graphite-300 disabled:opacity-30 rounded-full active:scale-90 transition-transform"
              title="Diminuir fonte"
              aria-label="Diminuir tamanho da letra"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-2 text-graphite-700 dark:text-graphite-200">
              {currentFontSize}px
            </span>
            <button
              onClick={() => handleAdjustFontSize(2)}
              disabled={currentFontSize >= 32}
              className="p-1 text-graphite-600 hover:text-graphite-900 dark:text-graphite-300 disabled:opacity-30 rounded-full active:scale-90 transition-transform"
              title="Aumentar fonte"
              aria-label="Aumentar tamanho da letra"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onToggleFav}
            className={`p-2.5 rounded-full ae-btn ${
              isFav
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 shadow-xs scale-105'
                : 'surface-editorial text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 dark:hover:text-white'
            }`}
            title="Salvar nos favoritos"
            aria-label="Favoritar este devocional"
          >
            <Heart className={`w-4 h-4 transition-transform ${isFav ? 'fill-current scale-110' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="surface-editorial p-2.5 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 dark:hover:text-white rounded-full ae-btn"
            title="Compartilhar"
            aria-label="Compartilhar devocional"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editorial Header (Stagger 2) */}
      <header className="space-y-3 text-left pt-1 ae-reveal-up ae-stagger-2">
        <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-bold text-sage-800 dark:text-sand-200 tracking-wider uppercase bg-sage-100/80 dark:bg-cream-100/10 border border-sage-200/80 dark:border-sand-300/35 px-3 py-1 rounded-full">
          <span>{devotional.date}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{devotional.estimatedMinutes} min</span>
          </span>
          <span>•</span>
          <span>{devotional.theme}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold font-serif text-graphite-800 dark:text-cream-50 tracking-tight leading-tight">
          {devotional.title}
        </h1>
      </header>

      {/* Scripture Passage Card (Stagger 3 - Dimensional Editorial Quote) */}
      <section
        className="surface-warm-sand rounded-3xl p-6 sm:p-7 relative overflow-hidden space-y-3.5 ae-reveal-scale ae-stagger-3 ae-card"
        aria-label="Passagem Bíblica do Dia"
      >
        <div className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r-full bg-gradient-to-b from-sage-600 to-sage-800 dark:from-cream-100 dark:to-sand-300" />
        <span
          aria-hidden="true"
          className="absolute right-5 -top-3 font-serif text-8xl leading-none text-sand-300/40 dark:text-sand-300/15 select-none pointer-events-none"
        >
          “
        </span>

        <div className="flex items-center justify-between text-xs font-bold text-sage-800 dark:text-sand-300 pl-2">
          <span className="flex items-center space-x-1.5 uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300" />
            <span>Escritura Base • {devotional.verseOfTheDay.reference}</span>
          </span>
        </div>

        <blockquote
          style={{ fontSize: `${currentFontSize + 1}px`, lineHeight: 1.65 }}
          className="font-serif italic text-graphite-800 dark:text-cream-50 pl-2 relative z-10"
        >
          "{devotional.verseOfTheDay.text}"
        </blockquote>

        {devotional.contextSummary && (
          <p className="text-xs text-graphite-600 dark:text-cream-200/90 border-t border-sand-300/60 dark:border-sand-300/25 pt-3 pl-2 leading-relaxed">
            <strong className="text-graphite-800 dark:text-cream-50">Contexto bíblico:</strong>{' '}
            {devotional.contextSummary}
          </p>
        )}
      </section>

      {/* Reflection Content (Stagger 4 - Luxury Book Page Surface) */}
      <section className="surface-editorial rounded-3xl p-6 sm:p-8 space-y-4 ae-reveal-up ae-stagger-4">
        <div className="flex items-center space-x-2 text-sage-800 dark:text-sand-300">
          <BookOpen className="w-4 h-4" />
          <h2 className="text-xs font-bold uppercase tracking-widest">
            Reflexão Bíblica
          </h2>
        </div>

        <div
          style={{ fontSize: `${currentFontSize}px`, lineHeight: 1.82 }}
          className="text-graphite-700 dark:text-cream-100 whitespace-pre-line space-y-4 devotional-reading-content"
        >
          {devotional.reflection}
        </div>
      </section>

      {/* Practical Application Box (Stagger 5) */}
      <section className="surface-editorial rounded-3xl p-6 sm:p-7 space-y-2.5 ae-reveal-up ae-stagger-5 ae-card relative overflow-hidden">
        <div className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r-full bg-sage-600 dark:bg-sand-300" />
        <h3 className="text-xs font-bold text-sage-800 dark:text-sand-300 uppercase tracking-widest flex items-center space-x-2 pl-2">
          <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sand-300" />
          <span>Aplicação Prática para Hoje</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize - 1}px`, lineHeight: 1.7 }}
          className="text-graphite-700 dark:text-cream-100 font-sans pl-2"
        >
          {devotional.application}
        </p>
      </section>

      {/* Suggested Prayer Box (Stagger 5 - Deep Sage Hero Card) */}
      <section className="surface-hero-sage text-cream-50 rounded-3xl p-6 sm:p-7 space-y-3 ae-reveal-up ae-stagger-5 ae-card relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-sand-300/10 blur-xl pointer-events-none" />
        <h3 className="text-xs font-bold text-sand-200 uppercase tracking-widest flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-sand-300 animate-pulse" />
          <span>Oração do Dia</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize}px`, lineHeight: 1.72 }}
          className="font-serif italic text-cream-50/95 relative z-10"
        >
          "{devotional.prayer}"
        </p>
      </section>

      {/* Completion Button (Stagger 6 - 3D Tactile Button) */}
      <div className="pt-2 space-y-2.5 ae-reveal-up ae-stagger-6">
        <button
          onClick={onComplete}
          className="w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 btn-tactile-sage ae-btn ae-btn-shimmer"
          aria-label="Concluir a leitura de hoje"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {isCompleted
              ? 'Leitura Concluída (Confirmar Novamente)'
              : 'Concluí a leitura de hoje'}
          </span>
        </button>
        <p className="text-center text-[11px] text-graphite-400 dark:text-graphite-500">
          Ao concluir, seus lembretes restantes de hoje são silenciados automaticamente.
        </p>
      </div>
    </article>
  );
};
