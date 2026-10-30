import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
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
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
          Favoritos
        </h1>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          Suas mensagens guardadas para consulta e releitura, inclusive sem internet
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 text-graphite-400 dark:text-graphite-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sand-200/70 dark:bg-graphite-800 text-sand-500 dark:text-sand-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-graphite-700 dark:text-graphite-200">
            Nenhum devocional favoritado ainda
          </p>
          <p className="text-xs max-w-xs mx-auto text-graphite-400">
            Ao ler um devocional, toque no ícone de coração para guardá-lo aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDevotional(d)}
              className="w-full text-left p-5 rounded-3xl bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 hover:border-sage-400 dark:hover:border-sage-600 transition-all shadow-xs flex items-start justify-between cursor-pointer"
            >
              <div className="space-y-1.5 pr-3">
                <span className="text-[11px] font-semibold text-sage-700 dark:text-sage-300 uppercase tracking-wider">
                  {d.date} • {d.theme}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-serif text-graphite-700 dark:text-graphite-50 leading-snug">
                  {d.title}
                </h3>
                <p className="text-xs text-graphite-500 dark:text-graphite-400">
                  {d.verseOfTheDay.reference}
                </p>
              </div>

              <button
                onClick={(e) => onRemoveFavorite(d.id, e)}
                className="p-2 text-graphite-400 hover:text-rose-600 rounded-full transition-colors"
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
