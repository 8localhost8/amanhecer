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

  // Filter only published / past & today devotionals
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
    <div className="space-y-6 pb-24 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Histórico de Devocionais
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Revise e medite novamente nas leituras anteriores
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="search"
          placeholder="Buscar por livro, tema ou palavra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-dawn-500 text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm">Nenhum devocional encontrado para a sua busca.</p>
          </div>
        ) : (
          filtered.map((d) => {
            const isRead = completedDates.includes(d.date);
            return (
              <button
                key={d.id}
                onClick={() => onSelectDevotional(d)}
                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 hover:border-dawn-300 dark:hover:border-dawn-800 transition-all shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-dawn-600 dark:text-dawn-400">
                    {d.date} • {d.theme}
                  </span>
                  {isRead ? (
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Lido</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{d.estimatedMinutes} min</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {d.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Referência: <strong className="text-slate-700 dark:text-slate-300">{d.verseOfTheDay.reference}</strong>
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
