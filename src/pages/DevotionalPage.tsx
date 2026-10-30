import React, { useState } from 'react';
import { ArrowLeft, Clock, Heart, Share2, Headphones, ExternalLink, CheckCircle2, Bookmark, Type, Plus, Minus } from 'lucide-react';
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
    const text = `📖 Devocional: "${devotional.title}"\n${devotional.verseOfTheDay.reference}: "${devotional.verseOfTheDay.text}"\n\nLeia gratuitamente no Amanhecer: https://amanhecer.app`;
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
    <article className="max-w-2xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-2xl transition-colors"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Reading Controls: Font resize, Favorite, Share */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700/80 mr-1">
            <button
              onClick={() => handleAdjustFontSize(-2)}
              disabled={currentFontSize <= 16}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 rounded-lg"
              title="Diminuir fonte"
              aria-label="Diminuir tamanho da letra"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1.5 text-slate-600 dark:text-slate-300">
              {currentFontSize}
            </span>
            <button
              onClick={() => handleAdjustFontSize(2)}
              disabled={currentFontSize >= 32}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 rounded-lg"
              title="Aumentar fonte"
              aria-label="Aumentar tamanho da letra"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onToggleFav}
            className={`p-2 rounded-xl transition-colors ${
              isFav
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title="Salvar nos favoritos"
            aria-label="Favoritar este devocional"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            title="Compartilhar"
            aria-label="Compartilhar devocional"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Devotional Header */}
      <header className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-dawn-600 dark:text-dawn-400">
          <span>{devotional.date}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{devotional.estimatedMinutes} min de leitura</span>
          </span>
          <span>•</span>
          <span>{devotional.theme}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {devotional.title}
        </h1>
      </header>

      {/* Passage Highlight Box */}
      <section 
        className="bg-dawn-50/70 dark:bg-midnight-900 border-l-4 border-dawn-600 dark:border-dawn-500 rounded-r-3xl p-5 sm:p-6 shadow-sm space-y-3"
        aria-label="Passagem Bíblica do Dia"
      >
        <div className="flex items-center justify-between text-xs font-bold text-dawn-800 dark:text-dawn-300">
          <span className="flex items-center space-x-1.5">
            <Bookmark className="w-4 h-4 text-dawn-600 dark:text-dawn-400" />
            <span>Texto das Escrituras: {devotional.verseOfTheDay.reference}</span>
          </span>
        </div>

        <blockquote
          style={{ fontSize: `${currentFontSize + 1}px`, lineHeight: 1.6 }}
          className="font-serif italic text-slate-900 dark:text-slate-50"
        >
          "{devotional.verseOfTheDay.text}"
        </blockquote>

        {devotional.contextSummary && (
          <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-dawn-100 dark:border-slate-800 pt-2 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">Contexto bíblico:</strong> {devotional.contextSummary}
          </p>
        )}
      </section>

      {/* Main Reflection Body */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Reflexão Bíblica
        </h2>
        <div
          style={{ fontSize: `${currentFontSize}px`, lineHeight: 1.8 }}
          className="font-serif text-slate-800 dark:text-slate-200 whitespace-pre-line space-y-4 devotional-reading-content"
        >
          {devotional.reflection}
        </div>
      </section>

      {/* Practical Application */}
      <section className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Aplicação Prática</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize - 1}px`, lineHeight: 1.6 }}
          className="text-slate-700 dark:text-slate-300 font-sans"
        >
          {devotional.application}
        </p>
      </section>

      {/* Suggested Prayer */}
      <section className="bg-gradient-to-br from-gold-50/60 to-white dark:from-midnight-900 dark:to-midnight-850 border border-gold-200/70 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
        <h3 className="text-sm font-bold text-gold-900 dark:text-gold-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-gold-500" />
          <span>Oração Sugerida</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize - 1}px`, lineHeight: 1.6 }}
          className="font-serif italic text-slate-800 dark:text-slate-200"
        >
          "{devotional.prayer}"
        </p>
      </section>

      {/* Para Ouvir (Music Recommendation) */}
      {devotional.music && (
        <section className="bg-slate-50 dark:bg-midnight-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center space-x-2 text-dawn-600 dark:text-dawn-400 text-xs font-bold uppercase tracking-wider">
            <Headphones className="w-4 h-4" />
            <span>🎧 Para Ouvir</span>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {devotional.music.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {devotional.music.artist}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
            "{devotional.music.recommendationReason}"
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {devotional.music.youtubeUrl && (
              <a
                href={devotional.music.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Ouvir no YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {devotional.music.spotifyUrl && (
              <a
                href={devotional.music.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Ouvir no Spotify</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Completion Button */}
      <div className="pt-4 space-y-2">
        <button
          onClick={onComplete}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
              : 'bg-dawn-600 hover:bg-dawn-700 text-white shadow-dawn-600/30 ring-4 ring-dawn-500/10'
          }`}
          aria-label="Concluir a leitura de hoje"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>{isCompleted ? 'Leitura de Hoje Já Concluída (Confirmar Novamente)' : 'Concluí a leitura de hoje'}</span>
        </button>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Ao clicar, os lembretes restantes do dia serão interrompidos.
        </p>
      </div>
    </article>
  );
};
