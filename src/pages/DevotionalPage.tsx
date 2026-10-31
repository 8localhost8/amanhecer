import React, { useState } from 'react';
import { ArrowLeft, Clock, Heart, Share2, Headphones, ExternalLink, CheckCircle2, Bookmark, Plus, Minus, Search } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';
import { saveUserPreferences, loadUserPreferences } from '../storage/preferences';
import { buildYouTubeSearchUrl, buildSpotifySearchUrl, resolveVerifiedSong } from '../content/songs/catalog';

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

  // Strictly resolve verified Christian praise song
  const verifiedSong = devotional.music || resolveVerifiedSong(devotional.musicId, devotional.theme);
  const youtubeUrl = verifiedSong
    ? buildYouTubeSearchUrl(verifiedSong.title, verifiedSong.artist)
    : '';

  const spotifyUrl = verifiedSong
    ? buildSpotifySearchUrl(verifiedSong.title, verifiedSong.artist)
    : '';

  return (
    <article className="max-w-xl mx-auto space-y-7 pb-36 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-semibold text-graphite-500 hover:text-graphite-900 dark:text-graphite-300 dark:hover:text-white p-2 rounded-full transition-colors"
          aria-label="Voltar para a página inicial"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        {/* Reading Controls: Font resize, Favorite, Share */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <div className="flex items-center bg-white dark:bg-graphite-800 rounded-full px-2 py-0.5 border border-sand-200 dark:border-graphite-700">
            <button
              onClick={() => handleAdjustFontSize(-2)}
              disabled={currentFontSize <= 16}
              className="p-1 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 disabled:opacity-30 rounded-full"
              title="Diminuir fonte"
              aria-label="Diminuir tamanho da letra"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1.5 text-graphite-600 dark:text-graphite-300">
              {currentFontSize}px
            </span>
            <button
              onClick={() => handleAdjustFontSize(2)}
              disabled={currentFontSize >= 32}
              className="p-1 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 disabled:opacity-30 rounded-full"
              title="Aumentar fonte"
              aria-label="Aumentar tamanho da letra"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onToggleFav}
            className={`p-2 rounded-full border transition-all ${
              isFav
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900'
                : 'border-sand-200 dark:border-graphite-700 text-graphite-400 hover:text-graphite-700 dark:hover:text-white bg-white dark:bg-graphite-800'
            }`}
            title="Salvar nos favoritos"
            aria-label="Favoritar este devocional"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 text-graphite-400 hover:text-graphite-700 dark:hover:text-white rounded-full transition-colors"
            title="Compartilhar"
            aria-label="Compartilhar devocional"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editorial Header */}
      <header className="space-y-2.5 text-left">
        <div className="flex items-center space-x-2 text-xs font-semibold text-sage-700 dark:text-sage-300 tracking-wider uppercase">
          <span>{devotional.date}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{devotional.estimatedMinutes} min</span>
          </span>
          <span>•</span>
          <span>{devotional.theme}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight leading-tight">
          {devotional.title}
        </h1>
      </header>

      {/* Scripture Passage Card */}
      <section 
        className="bg-white dark:bg-graphite-800 border-l-4 border-sage-600 dark:border-sage-400 rounded-r-3xl p-5 sm:p-6 shadow-xs space-y-3"
        aria-label="Passagem Bíblica do Dia"
      >
        <div className="flex items-center justify-between text-xs font-bold text-sage-800 dark:text-sage-200">
          <span className="flex items-center space-x-1.5">
            <Bookmark className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>{devotional.verseOfTheDay.reference}</span>
          </span>
        </div>

        <blockquote
          style={{ fontSize: `${currentFontSize + 1}px`, lineHeight: 1.65 }}
          className="font-serif italic text-graphite-700 dark:text-graphite-50"
        >
          "{devotional.verseOfTheDay.text}"
        </blockquote>

        {devotional.contextSummary && (
          <p className="text-xs text-graphite-500 dark:text-graphite-400 border-t border-sand-100 dark:border-graphite-700/80 pt-2.5 leading-relaxed">
            <strong className="text-graphite-700 dark:text-graphite-200">Contexto bíblico:</strong> {devotional.contextSummary}
          </p>
        )}
      </section>

      {/* Reflection Content */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-widest">
          Reflexão Bíblica
        </h2>
        <div
          style={{ fontSize: `${currentFontSize}px`, lineHeight: 1.8 }}
          className="text-graphite-700 dark:text-graphite-100 whitespace-pre-line space-y-4 devotional-reading-content"
        >
          {devotional.reflection}
        </div>
      </section>

      {/* Practical Application Box */}
      <section className="bg-sage-50 dark:bg-graphite-800/90 border border-sage-200/80 dark:border-sage-800/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-sage-900 dark:text-sage-200 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-600 dark:bg-sage-400" />
          <span>Aplicação Prática</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize - 1}px`, lineHeight: 1.65 }}
          className="text-graphite-700 dark:text-graphite-200 font-sans"
        >
          {devotional.application}
        </p>
      </section>

      {/* Suggested Prayer Box */}
      <section className="bg-sand-100/60 dark:bg-graphite-800/60 border border-sand-300/60 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-sand-500 dark:text-sand-300 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sand-400" />
          <span>Oração Sugerida</span>
        </h3>
        <p
          style={{ fontSize: `${currentFontSize - 1}px`, lineHeight: 1.65 }}
          className="font-serif italic text-graphite-700 dark:text-graphite-100"
        >
          "{devotional.prayer}"
        </p>
      </section>

      {/* Para Ouvir (Music Recommendation with Search Links) */}
      {verifiedSong && (
        <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-sage-700 dark:text-sage-300 text-xs font-bold uppercase tracking-wider">
            <Headphones className="w-4 h-4" />
            <span>🎧 Louvor Recomendado</span>
          </div>

          <div>
            <h4 className="text-base font-bold font-serif text-graphite-700 dark:text-graphite-50">
              {verifiedSong.title}
            </h4>
            <p className="text-xs text-graphite-500 dark:text-graphite-400">
              {verifiedSong.artist}
            </p>
          </div>

          <p className="text-xs text-graphite-600 dark:text-graphite-300 italic">
            "{verifiedSong.recommendationReason}"
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar no YouTube</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            )}
            {spotifyUrl && (
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1AA34A] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Ouvir no Spotify</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Completion Button */}
      <div className="pt-3 space-y-2">
        <button
          onClick={onComplete}
          className={`w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-98 ${
            isCompleted
              ? 'bg-sage-700 hover:bg-sage-800 text-white'
              : 'bg-sage-800 hover:bg-sage-900 text-cream-50'
          }`}
          aria-label="Concluir a leitura de hoje"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isCompleted ? 'Leitura Concluída (Confirmar Novamente)' : 'Concluí a leitura de hoje'}</span>
        </button>
        <p className="text-center text-[11px] text-graphite-400 dark:text-graphite-500">
          Ao clicar, os lembretes restantes do dia serão interrompidos.
        </p>
      </div>
    </article>
  );
};
