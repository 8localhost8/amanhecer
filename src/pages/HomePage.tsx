import React from 'react';
import { BookOpen, CheckCircle, Clock, Share2, Heart, BookMarked, Sun, Sunset, Moon, Play, ArrowRight } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';
import { BiblicalPassage } from '../content/passages/catalog';

interface HomePageProps {
  devotional: DevotionalPublic;
  dailyVerse: BiblicalPassage;
  isCompleted: boolean;
  onStartReading: () => void;
  onNavigate: (view: any) => void;
  isFav: boolean;
  onToggleFav: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  devotional,
  dailyVerse,
  isCompleted,
  onStartReading,
  onNavigate,
  isFav,
  onToggleFav,
}) => {
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
    const text = `☀️ Versículo do Dia no Amanhecer:\n"${dailyVerse.text}"\n— ${dailyVerse.reference}\n\nLeia seu devocional diário em: https://amanhecer.app`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Versículo copiado!');
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      {/* Top Greeting matching UX Reference */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center space-x-1.5 text-graphite-500 dark:text-graphite-400 text-xs font-medium">
            <span>{greeting},</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-graphite-700 dark:text-graphite-50 font-serif tracking-tight mt-0.5">
            Paz e Graça
          </h1>
          <p className="text-xs text-graphite-400 dark:text-graphite-400 capitalize mt-0.5">
            {todayFormatted}
          </p>
        </div>

        {isCompleted && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sage-100 dark:bg-sage-900/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-sage-600 dark:text-sage-300" />
            <span>Devocional Lido</span>
          </div>
        )}
      </div>

      {/* Hero Card: Devocional de Hoje (Styled like Screen 2 of UX Reference) */}
      <section 
        className="bg-sage-900 text-cream-50 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-sm"
        aria-labelledby="today-devotional-heading"
      >
        {/* Background Graphic: Serene Organic Dawn Hills & Sun */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <circle cx="150" cy="80" r="35" fill="#D9C7A3" opacity="0.8" />
            <path d="M50 200 C90 140, 140 160, 200 130 L200 200 Z" fill="#82917B" opacity="0.6" />
            <path d="M20 200 C80 160, 130 180, 200 150 L200 200 Z" fill="#50604B" opacity="0.7" />
          </svg>
        </div>

        <div className="relative z-10 space-y-3.5 max-w-sm">
          <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-wider uppercase text-sand-300">
            <span>Devocional de Hoje</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{devotional.estimatedMinutes} min</span>
            </span>
          </div>

          <div>
            <h2 id="today-devotional-heading" className="text-xl sm:text-2xl font-bold font-serif tracking-tight leading-snug">
              {devotional.title}
            </h2>
            <p className="text-xs text-sand-200/90 mt-1 font-medium">
              {devotional.verseOfTheDay.reference} • {devotional.theme}
            </p>
          </div>

          <p className="text-xs text-cream-100/80 line-clamp-2 leading-relaxed">
            {devotional.reflection}
          </p>

          <div className="pt-1.5 flex items-center space-x-3">
            <button
              onClick={onStartReading}
              className="py-2.5 px-5 bg-cream-100 hover:bg-white text-sage-900 font-semibold rounded-full text-xs shadow-sm flex items-center space-x-2 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isCompleted ? 'Reler Devocional' : 'Começar Leitura'}</span>
            </button>

            <button
              onClick={onToggleFav}
              className={`p-2.5 rounded-full border border-cream-100/20 transition-all ${
                isFav
                  ? 'bg-rose-900/60 text-rose-300 border-rose-400/40'
                  : 'text-cream-100/70 hover:text-white hover:bg-white/10'
              }`}
              title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              aria-label="Salvar devocional nos favoritos"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Versículo do Dia (Editorial Warm Minimalist Quote Card) */}
      <section 
        className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs relative"
        aria-labelledby="verse-of-the-day-heading"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-600 dark:bg-sage-400" />
            <h2 id="verse-of-the-day-heading" className="text-[11px] font-bold uppercase tracking-wider text-graphite-400 dark:text-graphite-300">
              Versículo do Dia
            </h2>
          </div>
          <button
            onClick={handleShareVerse}
            className="p-1.5 text-graphite-400 hover:text-sage-700 dark:hover:text-sage-300 rounded-full transition-colors"
            title="Compartilhar versículo"
            aria-label="Compartilhar versículo do dia"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <blockquote className="font-serif italic text-base sm:text-lg text-graphite-700 dark:text-graphite-50 leading-relaxed">
          "{dailyVerse.text}"
        </blockquote>

        <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-sand-100 dark:border-graphite-700/60 text-xs">
          <span className="font-semibold text-graphite-700 dark:text-graphite-200">
            {dailyVerse.reference}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-50 dark:bg-graphite-900 text-graphite-500 dark:text-graphite-400 border border-sand-200/60 dark:border-graphite-700/60">
            {dailyVerse.category}
          </span>
        </div>
      </section>

      {/* Continue Sua Jornada (3 Pastel Cards from UX Reference) */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider">
          Continue Sua Jornada
        </h3>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Diário de Oração */}
          <button
            onClick={() => onNavigate('diary')}
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-sage-100/70 dark:bg-sage-900/40 border border-sage-200/70 dark:border-sage-800/60 hover:border-sage-300 dark:hover:border-sage-700 transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-full bg-sage-800 text-cream-50 dark:bg-sage-700 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sage-900 dark:text-sage-100">
                Diário
              </h4>
              <p className="text-[10px] text-sage-700 dark:text-sage-300 mt-0.5">
                Suas preces
              </p>
            </div>
          </button>

          {/* Card 2: Favoritos */}
          <button
            onClick={() => onNavigate('favorites')}
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-sand-200/60 dark:bg-graphite-800/80 border border-sand-300/60 dark:border-graphite-700 hover:border-sand-400 dark:hover:border-graphite-600 transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-full bg-sand-500 text-cream-50 dark:bg-sand-400 dark:text-graphite-900 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-graphite-800 dark:text-graphite-100">
                Favoritos
              </h4>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-300 mt-0.5">
                Leitura offline
              </p>
            </div>
          </button>

          {/* Card 3: Histórico */}
          <button
            onClick={() => onNavigate('history')}
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-[#EFE4DE]/70 dark:bg-graphite-800/60 border border-[#E0D5CF] dark:border-graphite-700 hover:border-[#D5C8C0] dark:hover:border-graphite-600 transition-all group flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-full bg-[#8A756D] text-cream-50 dark:bg-[#A38D84] dark:text-graphite-900 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-graphite-800 dark:text-graphite-100">
                Histórico
              </h4>
              <p className="text-[10px] text-graphite-500 dark:text-graphite-300 mt-0.5">
                Devocionais
              </p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
