import React from 'react';
import { Sparkles, BookOpen, CheckCircle, Clock, ArrowRight, Share2, Heart, BookMarked, Sun, Sunset, Moon } from 'lucide-react';
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
  // Compute greeting based on current local hour
  const hour = new Date().getHours();
  let greeting = 'Bom dia!';
  let GreetingIcon = Sun;
  if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde!';
    GreetingIcon = Sunset;
  } else if (hour >= 18 || hour < 5) {
    greeting = 'Boa noite!';
    GreetingIcon = Moon;
  }

  // Format date in Portuguese
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleShareVerse = async () => {
    const text = `☀️ Versículo do Dia no Amanhecer:\n"${dailyVerse.text}"\n— ${dailyVerse.reference}\n\nLeia seu devocional diário gratuito em: https://amanhecer.app`;
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
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center space-x-2 text-dawn-600 dark:text-dawn-400">
            <GreetingIcon className="w-5 h-5 text-gold-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {greeting}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize mt-0.5">
            {todayFormatted}
          </p>
        </div>

        {isCompleted && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Devocional Lido</span>
          </div>
        )}
      </div>

      {/* Versículo do Dia Card */}
      <section 
        className="bg-gradient-to-br from-dawn-50 via-white to-gold-50/40 dark:from-midnight-900 dark:via-midnight-850 dark:to-midnight-950 border border-dawn-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden"
        aria-labelledby="verse-of-the-day-heading"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-gold-500 animate-ping" />
            <h2 id="verse-of-the-day-heading" className="text-xs font-bold uppercase tracking-wider text-dawn-700 dark:text-dawn-400">
              Versículo do Dia
            </h2>
          </div>
          <button
            onClick={handleShareVerse}
            className="p-1.5 text-slate-400 hover:text-dawn-600 dark:hover:text-dawn-400 rounded-full transition-colors"
            title="Compartilhar versículo"
            aria-label="Compartilhar versículo do dia"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <blockquote className="font-serif italic text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
          "{dailyVerse.text}"
        </blockquote>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {dailyVerse.reference}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {dailyVerse.category}
          </span>
        </div>
      </section>

      {/* Devocional de Hoje Hero Card */}
      <section
        className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-slate-200/50 dark:shadow-none space-y-4"
        aria-labelledby="today-devotional-heading"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-dawn-100 dark:bg-dawn-950 text-dawn-600 dark:text-dawn-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-dawn-600 dark:text-dawn-400 uppercase tracking-wider">
              Devocional de Hoje
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{devotional.estimatedMinutes} min de leitura</span>
          </div>
        </div>

        <div>
          <h2 id="today-devotional-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {devotional.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Passagem: <strong className="text-slate-700 dark:text-slate-300">{devotional.verseOfTheDay.reference}</strong> • Tema: {devotional.theme}
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-serif">
          {devotional.reflection}
        </p>

        <div className="pt-2 flex items-center space-x-3">
          <button
            onClick={onStartReading}
            className="flex-1 py-3.5 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/25 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <BookOpen className="w-5 h-5" />
            <span>{isCompleted ? 'Reler Devocional' : 'Começar Devocional'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onToggleFav}
            className={`p-3.5 rounded-2xl border transition-all ${
              isFav
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            aria-label="Salvar devocional nos favoritos"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </section>

      {/* Quick Action Cards (Diário, Favoritos) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('diary')}
          className="text-left p-4 rounded-2xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 hover:border-dawn-300 dark:hover:border-dawn-800 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-gold-100 dark:bg-gold-950/80 text-gold-700 dark:text-gold-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <BookMarked className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Diário de Oração
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Suas anotações privadas salvas apenas no seu aparelho
          </p>
        </button>

        <button
          onClick={() => onNavigate('favorites')}
          className="text-left p-4 rounded-2xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 hover:border-dawn-300 dark:hover:border-dawn-800 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Favoritos
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Devocionais guardados para ler mesmo sem internet
          </p>
        </button>
      </div>
    </div>
  );
};
