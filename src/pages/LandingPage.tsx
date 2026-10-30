import React, { useState } from 'react';
import { Download, ArrowRight, HelpCircle, Check, Smartphone, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenHelp: () => void;
  deferredPrompt: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenHelp,
  deferredPrompt,
}) => {
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          // Success: Show peaceful feedback, DO NOT redirect inside the browser window
          setInstallSuccessMessage('Aplicativo instalado com sucesso! Abra o Amanhecer direto pelo ícone na tela inicial do seu aparelho.');
        }
      } catch (err) {
        console.warn('Erro ao acionar prompt de instalação:', err);
        onOpenHelp();
      }
    } else {
      // If prompt is unavailable (e.g. iOS Safari or already handled), open illustrated instructions
      onOpenHelp();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 max-w-sm mx-auto text-center animate-fade-in">
      {/* Top Bar with ? Help */}
      <div className="flex items-center justify-between w-full pt-1">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-sage-800 text-cream-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span className="text-sm font-bold font-serif text-graphite-700 dark:text-graphite-100">
            Amanhecer
          </span>
        </div>

        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-sand-200/80 dark:bg-graphite-800 text-graphite-700 dark:text-graphite-200 text-xs font-medium hover:bg-sand-300/80 transition-colors"
          title="Ajuda de instalação"
          aria-label="Abrir ajuda de instalação"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sage-300" />
          <span>Ajuda (?)</span>
        </button>
      </div>

      {/* Main Hero (Matching Screen 1 of UX Reference) */}
      <div className="my-auto py-6 space-y-5">
        {/* Organic Minimalist Art: Sun & Olive Branch */}
        <div className="relative w-44 h-44 mx-auto rounded-full bg-sand-100 dark:bg-graphite-850 flex items-center justify-center overflow-hidden border border-sand-200 dark:border-graphite-700 shadow-xs">
          {/* Gentle sun disk */}
          <div className="absolute top-4 right-8 w-10 h-10 rounded-full bg-sand-300 dark:bg-sand-500/50" />
          
          {/* Layered sage hills */}
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full">
            <path d="M0 160 C50 120, 120 140, 200 110 L200 200 L0 200 Z" fill="#AFC3A7" opacity="0.5" />
            <path d="M0 180 C60 145, 140 165, 200 140 L200 200 L0 200 Z" fill="#82917B" opacity="0.65" />
            <path d="M0 195 C70 170, 130 185, 200 165 L200 200 L0 200 Z" fill="#50604B" opacity="0.85" />
          </svg>

          {/* Minimalist olive branch */}
          <svg viewBox="0 0 24 24" fill="none" stroke="#253525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 relative z-10 text-sage-900 dark:text-cream-50 -translate-y-2">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>

        {/* Brand & Purpose */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
            Amanhecer
          </h1>
          <p className="text-xs uppercase tracking-widest text-sage-700 dark:text-sage-300 font-semibold">
            Devocional Diário
          </p>
          <p className="text-sm font-serif italic text-graphite-600 dark:text-graphite-300 pt-1">
            "Um momento com Deus, todos os dias."
          </p>
        </div>

        {/* Subtle Feature Pills */}
        <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-4 text-left text-xs text-graphite-600 dark:text-graphite-300 space-y-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
            <span>Fundamentado no cânon bíblico de 66 livros</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
            <span>Versículo do dia às 06:06 e lembretes serenos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
            <span>100% Gratuito, sem cadastro e sem anúncios</span>
          </div>
        </div>

        {/* Installation Success Notice (if user just installed) */}
        {installSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-sage-100 dark:bg-sage-900/60 border border-sage-300 dark:border-sage-700 text-xs text-sage-900 dark:text-sage-200 flex items-start space-x-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-sage-700 dark:text-sage-300 flex-shrink-0 mt-0.5" />
            <p>{installSuccessMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Primary Action: Instalar Aplicativo */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-sm flex items-center justify-center space-x-2 text-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Aplicativo</span>
          </button>

          {/* Secondary Action: Usar no Navegador */}
          <button
            onClick={onEnterApp}
            className="w-full py-3 px-6 bg-transparent hover:bg-sand-200/60 dark:hover:bg-graphite-800 text-graphite-600 dark:text-graphite-300 font-medium rounded-full text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Usar no navegador</span>
            <ArrowRight className="w-3.5 h-3.5 text-graphite-400" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-2 text-[10px] text-graphite-400 dark:text-graphite-400">
        <p>Amanhecer 2.0 • Sem fins lucrativos • Para a glória de Deus</p>
      </footer>
    </div>
  );
};
