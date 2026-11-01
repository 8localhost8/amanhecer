import React from 'react';
import { Sun, Moon, HelpCircle, WifiOff, ShieldCheck } from 'lucide-react';
import { AppTheme } from '../storage/preferences';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  theme: AppTheme;
  onThemeToggle: () => void;
  onOpenHelp: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  theme,
  onThemeToggle,
  onOpenHelp,
  isOffline,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-cream-100/85 dark:bg-graphite-950/85 backdrop-blur-xl border-b border-sand-200/80 dark:border-graphite-800/80 shadow-2xs transition-colors">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Editorial Title */}
        <button
          onClick={() => onNavigate('home')}
          className="ae-btn flex items-center space-x-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-600 rounded-xl"
          aria-label="Ir para o início do Amanhecer"
        >
          {/* Official Amanhecer leaf icon (Light & Dark theme aware) */}
          <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-sm ring-1 ring-sand-300/80 dark:ring-graphite-700 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/icons/amanhecer-claro.png"
              alt="Amanhecer"
              className="w-full h-full object-cover block dark:hidden"
            />
            <img
              src="/icons/amanhecer-escuro.png"
              alt="Amanhecer"
              className="w-full h-full object-cover hidden dark:block"
            />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-graphite-800 dark:text-cream-50 font-serif block leading-none">
              Amanhecer
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sage-700 dark:text-sand-300 block mt-0.5">
              Devocional Diário
            </span>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Offline indicator */}
          {isOffline && (
            <div className="ae-spring-pop flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sand-200 dark:bg-graphite-800 text-graphite-700 dark:text-cream-100 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Auditoria Teológica (8 Critérios) */}
          <button
            onClick={() => onNavigate('audit')}
            className={`ae-btn p-2 sm:px-3 sm:py-1.5 rounded-full transition-all text-xs font-bold flex items-center sm:space-x-1.5 ${
              currentView === 'audit'
                ? 'btn-tactile-sage'
                : 'surface-editorial text-graphite-600 hover:text-graphite-900 dark:text-cream-100 dark:hover:text-white'
            }`}
            title="Painel de Auditoria e Avaliação Teológica"
            aria-label="Abrir Painel de Avaliação Teológica"
          >
            <ShieldCheck
              className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${
                currentView === 'audit'
                  ? 'text-current'
                  : 'text-sage-700 dark:text-sand-300'
              }`}
            />
            <span className="hidden sm:inline text-[11px]">Nota Bíblica</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="ae-btn surface-editorial p-2 text-graphite-600 dark:text-cream-100 hover:text-graphite-900 rounded-full focus:ring-2 focus:ring-sage-600"
            aria-label={`Alternar tema. Tema atual: ${theme}`}
            title="Alternar tema claro / escuro"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-sand-300 ae-spring-pop" />
            ) : (
              <Sun className="w-4 h-4 text-amber-700 ae-spring-pop" />
            )}
          </button>

          {/* Help Button (?) */}
          <button
            onClick={onOpenHelp}
            className="ae-btn surface-editorial p-2 text-graphite-600 dark:text-cream-100 hover:text-graphite-900 rounded-full focus:ring-2 focus:ring-sage-600"
            aria-label="Ajuda e instruções de instalação do aplicativo"
            title="Como instalar no celular ou computador"
          >
            <HelpCircle className="w-4 h-4 text-sage-700 dark:text-sand-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
