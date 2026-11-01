import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Share2,
  Heart,
  BookMarked,
  Sun,
  Sunset,
  Moon,
  Play,
  Headphones,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';
import { BiblicalPassage } from '../content/passages/catalog';
import {
  ChristianSong,
  getRandomVerifiedSong,
  buildYouTubeSearchUrl,
  buildSpotifySearchUrl,
} from '../content/songs/catalog';

interface HomePageProps {
  devotional: DevotionalPublic;
  dailyVerse: BiblicalPassage;
  isCompleted: boolean;
  onStartReading: () => void;
  onNavigate: (view: any) => void;
  isFav: boolean;
  onToggleFav: () => void;
  userName?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  devotional,
  dailyVerse,
  isCompleted,
  onStartReading,
  onNavigate,
  isFav,
  onToggleFav,
  userName = '',
}) => {
  // Pick a random 100% verified existing Christian song on dashboard load
  const [songOfTheDay] = useState<ChristianSong>(() =>
    getRandomVerifiedSong()
  );

  const hour = new Date().getHours();
  let greeting = 'Bom dia';
  let GreetingIcon = Sun;
  if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde';
    GreetingIcon = Sunset;
  } else if (hour >= 18 || hour < 5) {
    greeting = 'Boa noite';
    GreetingIcon = Moon;
  }

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const handleShareVerse = async () => {
    const text = `☀️ Versículo do Dia no Amanhecer:\n"${dailyVerse.text}"\n— ${dailyVerse.reference}\n\nLeia seu devocional diário gratuitamente em: https://amanhecer-beta.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Versículo copiado!');
    }
  };

  const youtubeUrl = buildYouTubeSearchUrl(songOfTheDay.title, songOfTheDay.artist);
  const spotifyUrl = buildSpotifySearchUrl(songOfTheDay.title, songOfTheDay.artist);

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* 1. Top Greeting Header with Dimensional Badges */}
      <div className="space-y-2.5 pt-2 ae-reveal-up ae-stagger-1">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full surface-editorial text-graphite-700 dark:text-cream-100 text-xs font-semibold whitespace-nowrap shrink-0">
            <GreetingIcon className="w-3.5 h-3.5 text-amber-600 dark:text-sand-300 ae-sun-float shrink-0" />
            <span>{greeting}</span>
          </div>

          {isCompleted && (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-sage-100/90 dark:bg-cream-100/15 border border-sage-300 dark:border-sand-300/45 text-sage-900 dark:text-cream-100 text-xs font-bold shadow-sm ae-spring-pop whitespace-nowrap shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>Concluído</span>
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-graphite-800 dark:text-cream-50 font-serif tracking-tight">
            {userName.trim() ? `Graça e paz, ${userName.trim()}!` : 'Graça e paz!'}
          </h1>
          <p className="text-xs font-medium capitalize text-graphite-500 dark:text-sand-300">
            {todayFormatted}
          </p>
        </div>
      </div>

      {/* 2. Hero Card: Devocional de Hoje (Deep Dimensional Sage Surface) */}
      <section
        className="surface-hero-sage text-cream-50 rounded-3xl p-6 sm:p-7 relative overflow-hidden ae-reveal-scale ae-stagger-2 ae-card"
        aria-labelledby="today-devotional-heading"
      >
        {/* Ambient radial sun glow + organic hills */}
        <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-sand-300/15 blur-2xl pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-3/5 opacity-45 pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 240 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
          >
            <circle cx="178" cy="68" r="46" fill="#D9C7A3" opacity="0.22" className="ae-sun-float" />
            <circle cx="178" cy="68" r="31" fill="#D9C7A3" className="ae-sun-float" />
            <path
              d="M30 200 C85 132, 155 152, 240 120 L240 200 Z"
              fill="#82917B"
              opacity="0.6"
              className="ae-hill-drift"
            />
            <path
              d="M0 200 C70 155, 145 175, 240 144 L240 200 Z"
              fill="#50604B"
              opacity="0.82"
              className="ae-hill-drift-delayed"
            />
          </svg>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          {/* Glassmorphic Header Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-sand-200">
            <Sparkles className="w-3 h-3 text-sand-300" />
            <span>Devocional de Hoje</span>
            <span className="opacity-50">•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{devotional.estimatedMinutes} min</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h2
              id="today-devotional-heading"
              className="text-2xl sm:text-3xl font-bold font-serif tracking-tight leading-snug text-white drop-shadow-xs"
            >
              {devotional.title}
            </h2>
            <p className="text-xs text-sand-200 font-medium tracking-wide">
              {devotional.verseOfTheDay.reference} • {devotional.theme}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-cream-100/85 line-clamp-2 leading-relaxed">
            {devotional.reflection}
          </p>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={onStartReading}
              className="py-3 px-6 btn-tactile-cream font-bold rounded-full text-xs sm:text-sm flex items-center space-x-2 ae-btn ae-btn-shimmer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-sage-800" />
              <span>{isCompleted ? 'Reler Devocional' : 'Começar Leitura'}</span>
            </button>

            <button
              onClick={onToggleFav}
              className={`p-3 rounded-full border backdrop-blur-md ae-btn ${
                isFav
                  ? 'bg-rose-500/25 text-rose-200 border-rose-300/40 shadow-sm scale-105'
                  : 'bg-white/10 border-white/20 text-cream-100 hover:bg-white/20'
              }`}
              title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              aria-label="Salvar devocional nos favoritos"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  isFav ? 'fill-current scale-110 text-rose-300' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Versículo do Dia (Luxury Editorial Card with Watermark Quote) */}
      <section
        className="surface-editorial rounded-3xl p-6 sm:p-7 relative overflow-hidden ae-reveal-up ae-stagger-3 ae-card"
        aria-labelledby="verse-of-the-day-heading"
      >
        {/* Decorative serif quotation watermark */}
        <span
          aria-hidden="true"
          className="absolute right-5 -top-3 font-serif text-8xl leading-none text-sand-300/35 dark:text-sand-300/15 select-none pointer-events-none"
        >
          “
        </span>

        {/* Left accent bar */}
        <div className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full bg-gradient-to-b from-sage-600 via-sage-700 to-sand-400 dark:from-cream-100 dark:via-sand-300 dark:to-sand-400" />

        <div className="relative z-10 pl-2">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sage-600 dark:bg-sand-300 ring-4 ring-sage-100 dark:ring-sand-300/20" />
              <h2
                id="verse-of-the-day-heading"
                className="text-[11px] font-bold uppercase tracking-widest text-sage-800 dark:text-sand-300"
              >
                Versículo do Dia
              </h2>
            </div>

            <button
              onClick={handleShareVerse}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-cream-100/80 dark:bg-cream-100/10 border border-sand-200/80 dark:border-sand-300/35 text-graphite-600 dark:text-cream-100 hover:text-sage-800 dark:hover:text-white text-[11px] font-semibold ae-btn"
              title="Compartilhar versículo"
              aria-label="Compartilhar versículo do dia"
            >
              <Share2 className="w-3 h-3" />
              <span>Compartilhar</span>
            </button>
          </div>

          <blockquote className="font-serif italic text-lg sm:text-xl text-graphite-800 dark:text-cream-50 leading-relaxed">
            "{dailyVerse.text}"
          </blockquote>

          <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-sand-200/60 dark:border-sand-300/20 text-xs">
            <span className="font-bold text-graphite-800 dark:text-cream-100 tracking-tight">
              — {dailyVerse.reference}
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-sage-50 dark:bg-cream-100/15 text-sage-800 dark:text-sand-200 border border-sage-200/70 dark:border-sand-300/35">
              {dailyVerse.category}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Música do Dia (Tactile Audio Card on Dashboard with Verified Real Songs) */}
      <section
        className="surface-warm-sand rounded-3xl p-6 sm:p-7 relative overflow-hidden ae-reveal-up ae-stagger-4 ae-card"
        aria-labelledby="song-of-the-day-heading"
      >
        {/* Subtle decorative vinyl rings in background */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full border border-sand-300/40 dark:border-sand-300/15 pointer-events-none" />
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border border-sand-300/50 dark:border-sand-300/20 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Bar: Title + Equalizer */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl btn-tactile-sage flex items-center justify-center shadow-xs shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  id="song-of-the-day-heading"
                  className="text-xs font-bold uppercase tracking-widest text-sage-900 dark:text-cream-100"
                >
                  Música do Dia
                </h2>
                {/* Animated Equalizer Bars */}
                <div className="flex items-end space-x-0.5 h-3.5" aria-hidden="true">
                  <span className="w-0.5 bg-sage-600 dark:bg-sand-300 rounded-full ae-eq-1" />
                  <span className="w-0.5 bg-sage-700 dark:bg-cream-100 rounded-full ae-eq-2" />
                  <span className="w-0.5 bg-sage-600 dark:bg-sand-300 rounded-full ae-eq-3" />
                </div>
              </div>
              <p className="text-[11px] text-graphite-500 dark:text-sand-300/90">
                Louvor selecionado para edificar o seu dia
              </p>
            </div>
          </div>

          {/* Song Info Box */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-cream-100/[0.06] border border-sand-200/80 dark:border-sand-300/25 space-y-1.5 shadow-2xs">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-graphite-800 dark:text-cream-50 leading-snug">
                {songOfTheDay.title}
              </h3>
              <p className="text-xs font-semibold text-sage-700 dark:text-sand-300 mt-0.5">
                {songOfTheDay.artist}
              </p>
            </div>

            <p className="text-xs text-graphite-600 dark:text-cream-200/90 italic leading-relaxed pt-1">
              "{songOfTheDay.recommendationReason}"
            </p>
          </div>

          {/* Action Links: YouTube & Spotify */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ae-btn flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-700 text-white text-xs font-bold shadow-sm border border-red-500/40 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Ouvir no YouTube</span>
            </a>

            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ae-btn flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-b from-[#1ED760] to-[#17A74A] hover:from-[#22E066] hover:to-[#159642] text-white text-xs font-bold shadow-sm border border-white/20 whitespace-nowrap"
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span>Ouvir no Spotify</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Continue Sua Jornada (Dimensional Bento Grid) */}
      <section className="space-y-3.5 ae-reveal-up ae-stagger-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-graphite-500 dark:text-sand-300 uppercase tracking-widest">
            Continue Sua Jornada
          </h3>
          <span className="text-[11px] text-graphite-400 dark:text-cream-200/70">
            Acesso rápido e offline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Diário de Oração */}
          <button
            onClick={() => onNavigate('diary')}
            className="surface-editorial text-left p-4 rounded-3xl group flex sm:flex-col items-center sm:items-start justify-between gap-3 ae-card"
          >
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5">
              <div className="w-11 h-11 rounded-2xl btn-tactile-sage flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50">
                  Diário de Oração
                </h4>
                <p className="text-[11px] text-graphite-500 dark:text-sand-300/90 mt-0.5">
                  Anote preces e gratidão
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:text-sage-700 dark:group-hover:text-cream-50 group-hover:translate-x-1 transition-all sm:self-end" />
          </button>

          {/* Card 2: Favoritos */}
          <button
            onClick={() => onNavigate('favorites')}
            className="surface-editorial text-left p-4 rounded-3xl group flex sm:flex-col items-center sm:items-start justify-between gap-3 ae-card"
          >
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-sand-300 to-sand-400 text-sage-950 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50">
                  Favoritos
                </h4>
                <p className="text-[11px] text-graphite-500 dark:text-sand-300/90 mt-0.5">
                  Mensagens salvas
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:text-sage-700 dark:group-hover:text-cream-50 group-hover:translate-x-1 transition-all sm:self-end" />
          </button>

          {/* Card 3: Histórico */}
          <button
            onClick={() => onNavigate('history')}
            className="surface-editorial text-left p-4 rounded-3xl group flex sm:flex-col items-center sm:items-start justify-between gap-3 ae-card"
          >
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#968077] to-[#78645C] dark:from-cream-200 dark:to-sand-300 text-cream-50 dark:text-sage-950 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50">
                  Histórico
                </h4>
                <p className="text-[11px] text-graphite-500 dark:text-sand-300/90 mt-0.5">
                  Leituras anteriores
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:text-sage-700 dark:group-hover:text-cream-50 group-hover:translate-x-1 transition-all sm:self-end" />
          </button>
        </div>
      </section>
    </div>
  );
};
