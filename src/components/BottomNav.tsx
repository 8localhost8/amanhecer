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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-safe"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id || (tab.id === 'home' && currentView === 'devotional');
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as AppView)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn-500 ${
                isActive
                  ? 'text-dawn-600 dark:text-dawn-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-dawn-600 text-white rounded-full text-[9px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-dawn-600 dark:bg-dawn-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
