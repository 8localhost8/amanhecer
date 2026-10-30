import React from 'react';
import { BookOpen, History, Heart, BookMarked, Settings } from 'lucide-react';

export type AppView = 'home' | 'devotional' | 'history' | 'favorites' | 'diary' | 'settings' | 'audit';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, favoritesCount = 0 }) => {
  const tabs = [
    { id: 'home', label: 'Hoje', icon: BookOpen },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favoritesCount > 0 ? favoritesCount : null },
    { id: 'diary', label: 'Diário', icon: BookMarked },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto px-4 pb-3 sm:pb-4 pointer-events-auto">
        {/* Floating rounded navigation bar based on UX reference */}
        <div className="bg-white/95 dark:bg-graphite-800/95 backdrop-blur-md rounded-full shadow-lg shadow-graphite-900/5 dark:shadow-black/20 border border-sand-200 dark:border-graphite-700 px-2 py-1.5 flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id || (tab.id === 'home' && currentView === 'devotional');
            
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id as AppView)}
                className="relative flex-1 flex flex-col items-center justify-center py-1 group focus:outline-none"
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive ? (
                  /* Raised active circular button (as in UX reference image) */
                  <div className="flex flex-col items-center">
                    <div className="absolute -top-6 w-12 h-12 rounded-full bg-sage-800 dark:bg-sage-600 text-white shadow-md shadow-sage-900/20 flex items-center justify-center ring-4 ring-cream-100 dark:ring-graphite-950 transition-all duration-300 scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-sage-900 dark:text-sage-200 mt-6 tracking-tight">
                      {tab.label}
                    </span>
                  </div>
                ) : (
                  /* Inactive button */
                  <div className="flex flex-col items-center text-graphite-400 dark:text-graphite-300 group-hover:text-graphite-700 dark:group-hover:text-graphite-100 transition-colors py-1">
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {tab.badge && (
                        <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-sage-700 text-white rounded-full text-[8px] font-bold">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium mt-1 tracking-tight">
                      {tab.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
