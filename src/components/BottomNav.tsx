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
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none ae-reveal-up ae-stagger-4"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto px-4 pb-3 sm:pb-4 pointer-events-auto">
        {/* Floating rounded navigation bar with glassmorphic depth */}
        <div className="surface-editorial backdrop-blur-xl rounded-full px-2 py-1.5 flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id || (tab.id === 'home' && currentView === 'devotional');
            
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id as AppView)}
                className="relative flex-1 flex flex-col items-center justify-center py-1 group focus:outline-none active:scale-90 transition-transform"
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive ? (
                  /* Raised active circular button with After Effects Spring Pop */
                  <div className="flex flex-col items-center">
                    <div className="absolute -top-6 w-12 h-12 rounded-full btn-tactile-sage text-white flex items-center justify-center ring-4 ring-cream-100 dark:ring-graphite-950 ae-spring-pop">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-sage-900 dark:text-sage-200 mt-6 tracking-tight ae-reveal-scale">
                      {tab.label}
                    </span>
                  </div>
                ) : (
                  /* Inactive button with subtle micro-interaction */
                  <div className="flex flex-col items-center text-graphite-400 dark:text-graphite-300 group-hover:text-graphite-700 dark:group-hover:text-graphite-100 transition-all py-1">
                    <div className="relative group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                      {tab.badge && (
                        <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-sage-700 text-white rounded-full text-[8px] font-bold ae-spring-pop">
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
