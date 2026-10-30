import React from 'react';
import { Sun, Moon, HelpCircle, WifiOff, ShieldCheck } from 'lucide-react';
import { AppTheme, saveUserPreferences } from '../storage/preferences';

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
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-midnight-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn-500 rounded-xl"
          aria-label="Ir para a página inicial do Amanhecer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-dawn-700 via-dawn-600 to-gold-400 p-0.5 shadow-md shadow-dawn-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
              <img src="/icons/icon.svg" alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-serif">
                Amanhecer
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-100 dark:bg-gold-950/80 text-gold-700 dark:text-gold-400 border border-gold-200 dark:border-gold-800/60">
                2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Devocional Diário
            </p>
          </div>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Offline indicator */}
          {isOffline && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Quick link to Theological Evaluation Audit */}
          <button
            onClick={() => onNavigate('audit')}
            className={`p-2 rounded-2xl border transition-all text-xs font-semibold flex items-center space-x-1 ${
              currentView === 'audit'
                ? 'bg-dawn-50 dark:bg-dawn-950 text-dawn-600 dark:text-dawn-400 border-dawn-300 dark:border-dawn-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Painel de Auditoria e Avaliação Teológica (8 Critérios)"
            aria-label="Abrir Painel de Avaliação Teológica"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Auditoria</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors focus:ring-2 focus:ring-dawn-500"
            aria-label={`Alternar tema. Tema atual: ${theme}`}
            title="Alternar tema claro / escuro"
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-dawn-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          {/* Help Button (?) */}
          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors focus:ring-2 focus:ring-dawn-500"
            aria-label="Ajuda e instruções de instalação do aplicativo"
            title="Como instalar no celular ou computador"
          >
            <HelpCircle className="w-5 h-5 text-dawn-600 dark:text-dawn-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
