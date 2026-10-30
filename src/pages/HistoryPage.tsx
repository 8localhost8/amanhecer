import React, { useState } from 'react';
import { Search, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';

interface HistoryPageProps {
  devotionals: DevotionalPublic[];
  completedDates: string[];
  onSelectDevotional: (devotional: DevotionalPublic) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  devotionals,
  completedDates,
  onSelectDevotional,
}) => {
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const published = devotionals.filter(d => d.date <= todayStr);

  const filtered = published.filter(d => {
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.verseOfTheDay.reference.toLowerCase().includes(q) ||
      d.theme.toLowerCase().includes(q) ||
      d.reflection.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
          Histórico
        </h1>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          Revise e medite novamente nas leituras e reflexões anteriores
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-graphite-400" />
        <input
          type="search"
          placeholder="Buscar por livro, tema ou palavra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sage-600 text-graphite-700 dark:text-graphite-100 placeholder:text-graphite-400 shadow-xs"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-graphite-400 dark:text-graphite-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto opacity-40 text-sage-600" />
            <p className="text-xs">Nenhum devocional encontrado para a sua busca.</p>
          </div>
        ) : (
          filtered.map((d) => {
            const isRead = completedDates.includes(d.date);
            return (
              <button
                key={d.id}
                onClick={() => onSelectDevotional(d)}
                className="w-full text-left p-5 rounded-3xl bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 hover:border-sage-400 dark:hover:border-sage-600 transition-all shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sage-700 dark:text-sage-300 text-[11px] uppercase tracking-wider">
                    {d.date} • {d.theme}
                  </span>
                  {isRead ? (
                    <span className="flex items-center space-x-1 text-sage-800 dark:text-sage-300 font-medium text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Lido</span>
                    </span>
                  ) : (
                    <span className="text-graphite-400 flex items-center space-x-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{d.estimatedMinutes} min</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold font-serif text-graphite-700 dark:text-graphite-50 leading-snug">
                  {d.title}
                </h3>

                <p className="text-xs text-graphite-500 dark:text-graphite-400">
                  Referência: <strong className="text-graphite-700 dark:text-graphite-200">{d.verseOfTheDay.reference}</strong>
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
