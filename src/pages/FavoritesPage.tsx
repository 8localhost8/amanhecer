import React from 'react';
import { Heart, Trash2, BookOpen } from 'lucide-react';
import { DevotionalPublic } from '../services/ai/schemas';

interface FavoritesPageProps {
  favorites: DevotionalPublic[];
  onSelectDevotional: (devotional: DevotionalPublic) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  onSelectDevotional,
  onRemoveFavorite,
}) => {
  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Devocionais Favoritos
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Suas mensagens salvas para consulta e releitura, inclusive sem internet
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Você ainda não favoritou nenhum devocional
          </p>
          <p className="text-xs max-w-xs mx-auto">
            Ao ler um devocional, toque no ícone de coração para salvá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDevotional(d)}
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 hover:border-dawn-300 dark:hover:border-dawn-800 transition-all shadow-sm flex items-start justify-between cursor-pointer"
            >
              <div className="space-y-1 pr-3">
                <span className="text-xs font-semibold text-dawn-600 dark:text-dawn-400">
                  {d.date} • {d.theme}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {d.verseOfTheDay.reference}
                </p>
              </div>

              <button
                onClick={(e) => onRemoveFavorite(d.id, e)}
                className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-colors"
                title="Remover dos favoritos"
                aria-label="Remover dos favoritos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
