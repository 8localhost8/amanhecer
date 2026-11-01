import React from 'react';
import { BookOpen, CheckCircle, Clock, Share2, Heart, BookMarked, Sun, Sunset, Moon, Play } from 'lucide-react';
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

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* Top Greeting with Stagger 1 */}
      <div className="flex items-center justify-between pt-2 ae-reveal-up ae-stagger-1">
        <div>
          <div className="flex items-center space-x-1.5 text-graphite-500 dark:text-graphite-400 text-xs font-medium">
            <GreetingIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ae-sun-float" />
            <span>{greeting},</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-graphite-700 dark:text-graphite-50 font-serif tracking-tight mt-0.5">
            {userName.trim() ? `Graça e paz, ${userName.trim()}!` : 'Graça e paz!'}
          </h1>
          <p className="text-xs text-graphite-400 dark:text-graphite-400 capitalize mt-0.5">
            {todayFormatted}
          </p>
        </div>

        {isCompleted && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-sage-100 dark:bg-sage-900/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-semibold ae-spring-pop">
            <CheckCircle className="w-3.5 h-3.5 text-sage-600 dark:text-sage-300" />
            <span>Devocional Lido</span>
          </div>
        )}
      </div>

      {/* Hero Card: Devocional de Hoje with Stagger 2 & Ambient Dawn Motion */}
      <section 
        className="bg-sage-900 text-cream-50 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-md ae-reveal-scale ae-stagger-2 ae-card"
        aria-labelledby="today-devotional-heading"
      >
        {/* Background Graphic: Animated Organic Dawn Hills & Breathing Sun */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <circle cx="150" cy="78" r="35" fill="#D9C7A3" className="ae-sun-float" />
            <path d="M50 200 C90 140, 140 160, 200 130 L200 200 Z" fill="#82917B" opacity="0.65" className="ae-hill-drift" />
            <path d="M20 200 C80 160, 130 180, 200 150 L200 200 Z" fill="#50604B" opacity="0.75" className="ae-hill-drift-delayed" />
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
              className="py-2.5 px-5 bg-cream-100 hover:bg-white text-sage-900 font-semibold rounded-full text-xs shadow-sm flex items-center space-x-2 ae-btn ae-btn-shimmer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isCompleted ? 'Reler Devocional' : 'Começar Leitura'}</span>
            </button>

            <button
              onClick={onToggleFav}
              className={`p-2.5 rounded-full border border-cream-100/20 ae-btn ${
                isFav
                  ? 'bg-rose-900/60 text-rose-300 border-rose-400/40 scale-105'
                  : 'text-cream-100/70 hover:text-white hover:bg-white/10'
              }`}
              title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              aria-label="Salvar devocional nos favoritos"
            >
              <Heart className={`w-4 h-4 transition-transform ${isFav ? 'fill-current scale-110' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Versículo do Dia (Editorial Quote Card with Stagger 3) */}
      <section 
        className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs relative ae-reveal-up ae-stagger-3 ae-card"
        aria-labelledby="verse-of-the-day-heading"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-600 dark:bg-sage-400 animate-pulse" />
            <h2 id="verse-of-the-day-heading" className="text-[11px] font-bold uppercase tracking-wider text-graphite-400 dark:text-graphite-300">
              Versículo do Dia
            </h2>
          </div>
          <button
            onClick={handleShareVerse}
            className="p-1.5 text-graphite-400 hover:text-sage-700 dark:hover:text-sage-300 rounded-full ae-btn"
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

      {/* Continue Sua Jornada (3 Pastel Cards with Stagger 4) */}
      <section className="space-y-3 ae-reveal-up ae-stagger-4">
        <h3 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider">
          Continue Sua Jornada
        </h3>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Card 1: Diário de Oração */}
          <button
            onClick={() => onNavigate('diary')}
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-sage-100/70 dark:bg-sage-900/40 border border-sage-200/70 dark:border-sage-800/60 hover:border-sage-300 dark:hover:border-sage-700 group flex flex-col justify-between ae-card"
          >
            <div className="w-8 h-8 rounded-full bg-sage-800 text-cream-50 dark:bg-sage-700 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 group-hover:-rotate-6 transition-transform">
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
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-sand-200/60 dark:bg-graphite-800/80 border border-sand-300/60 dark:border-graphite-700 hover:border-sand-400 dark:hover:border-graphite-600 group flex flex-col justify-between ae-card"
          >
            <div className="w-8 h-8 rounded-full bg-sand-500 text-cream-50 dark:bg-sand-400 dark:text-graphite-900 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform">
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
            className="text-left p-3.5 sm:p-4 rounded-2xl bg-[#EFE4DE]/70 dark:bg-graphite-800/60 border border-[#E0D5CF] dark:border-graphite-700 hover:border-[#D5C8C0] dark:hover:border-graphite-600 group flex flex-col justify-between ae-card"
          >
            <div className="w-8 h-8 rounded-full bg-[#8A756D] text-cream-50 dark:bg-[#A38D84] dark:text-graphite-900 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 group-hover:-rotate-6 transition-transform">
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
