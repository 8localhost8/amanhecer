import React, { useState } from 'react';
import { Download, ArrowRight, HelpCircle, Check, CheckCircle2 } from 'lucide-react';

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
          setInstallSuccessMessage('Aplicativo instalado com sucesso! Abra o Amanhecer direto pelo ícone na tela inicial do seu aparelho.');
        }
      } catch (err) {
        console.warn('Erro ao acionar prompt de instalação:', err);
        onOpenHelp();
      }
    } else {
      onOpenHelp();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 max-w-sm mx-auto text-center">
      {/* Top Bar with ? Help (Stagger 1) */}
      <div className="flex items-center justify-between w-full pt-1 ae-reveal-up ae-stagger-1">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full overflow-hidden shadow-xs ring-1 ring-sand-200 dark:ring-graphite-700 flex items-center justify-center flex-shrink-0">
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
          <span className="text-sm font-bold font-serif text-graphite-700 dark:text-graphite-100">
            Amanhecer
          </span>
        </div>

        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-sand-200/80 dark:bg-graphite-800 text-graphite-700 dark:text-graphite-200 text-xs font-medium hover:bg-sand-300/80 ae-btn"
          title="Ajuda de instalação"
          aria-label="Abrir ajuda de instalação"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sage-300" />
          <span>Ajuda (?)</span>
        </button>
      </div>

      {/* Main Hero */}
      <div className="my-auto py-6 space-y-5">
        {/* Official Amanhecer Brand Icon with Spring Pop (Stagger 2) */}
        <div className="relative w-36 h-36 mx-auto rounded-3xl overflow-hidden shadow-lg ring-4 ring-sand-200/80 dark:ring-graphite-700 flex items-center justify-center bg-[#F7F4EB] dark:bg-[#384736] ae-spring-pop ae-stagger-2 ae-card">
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

        {/* Brand & Purpose (Stagger 3) */}
        <div className="space-y-1.5 ae-reveal-up ae-stagger-3">
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

        {/* Subtle Feature Pills (Stagger 4) */}
        <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-4 text-left text-xs text-graphite-600 dark:text-graphite-300 space-y-2 shadow-xs ae-reveal-up ae-stagger-4 ae-card">
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

        {/* Installation Success Notice */}
        {installSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-sage-100 dark:bg-sage-900/60 border border-sage-300 dark:border-sage-700 text-xs text-sage-900 dark:text-sage-200 flex items-start space-x-2 text-left ae-spring-pop">
            <CheckCircle2 className="w-4 h-4 text-sage-700 dark:text-sage-300 flex-shrink-0 mt-0.5" />
            <p>{installSuccessMessage}</p>
          </div>
        )}

        {/* Action Buttons (Stagger 5) */}
        <div className="space-y-2.5 pt-1 ae-reveal-up ae-stagger-5">
          {/* Primary Action: Instalar Aplicativo */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-md flex items-center justify-center space-x-2 text-sm ae-btn ae-btn-shimmer"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Aplicativo</span>
          </button>

          {/* Secondary Action: Usar no Navegador */}
          <button
            onClick={onEnterApp}
            className="w-full py-3 px-6 bg-transparent hover:bg-sand-200/60 dark:hover:bg-graphite-800 text-graphite-600 dark:text-graphite-300 font-medium rounded-full text-xs flex items-center justify-center space-x-1.5 ae-btn group"
          >
            <span>Usar no navegador</span>
            <ArrowRight className="w-3.5 h-3.5 text-graphite-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer (Stagger 6) */}
      <footer className="pt-2 text-[10px] text-graphite-400 dark:text-graphite-400 ae-reveal-up ae-stagger-6">
        <p>Amanhecer 2.0 • Sem fins lucrativos • Para a glória de Deus</p>
      </footer>
    </div>
  );
};
