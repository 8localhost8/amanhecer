import React from 'react';
import { Sparkles, Download, ArrowRight, HelpCircle, ShieldCheck, Heart, BookOpen, Check } from 'lucide-react';

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
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        onEnterApp();
      }
    } else {
      onOpenHelp();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-4 max-w-md mx-auto text-center animate-fade-in">
      {/* Top Bar with ? Help */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-dawn-600 p-0.5">
            <img src="/icons/icon.svg" alt="" className="w-full h-full object-contain" />
          </div>
          <span className="text-base font-bold font-serif text-slate-900 dark:text-white">
            Amanhecer
          </span>
        </div>

        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          title="Ajuda de instalação"
        >
          <HelpCircle className="w-3.5 h-3.5 text-dawn-600 dark:text-dawn-400" />
          <span>Ajuda (?)</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="my-auto py-8 space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-dawn-700 via-dawn-500 to-gold-400 p-1 shadow-2xl shadow-dawn-500/25 mx-auto flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
            <img src="/icons/icon.svg" alt="Amanhecer" className="w-14 h-14 object-contain" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
            Amanhecer
          </h1>
          <p className="text-base sm:text-lg font-medium text-dawn-600 dark:text-dawn-400">
            "Seu momento diário com a Palavra de Deus."
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Gratuito. Sem cadastro. Simples de usar.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="bg-slate-50 dark:bg-midnight-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2.5 max-w-sm mx-auto">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Devocional diário baseado no cânon protestante de 66 livros</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Versículo do dia às 06:06 e lembretes serenos de leitura</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Acesso offline, favoritos e diário pessoal sem criar conta</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Avaliação crítica com nota mínima 90/100 contra distorções</span>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="space-y-3 pt-2 max-w-sm mx-auto w-full">
          <button
            onClick={handleInstallClick}
            className="w-full py-4 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-bold rounded-2xl shadow-xl shadow-dawn-600/30 flex items-center justify-center space-x-2 text-sm sm:text-base transition-all active:scale-98"
          >
            <Download className="w-5 h-5" />
            <span>Instalar Aplicativo</span>
          </button>

          <button
            onClick={onEnterApp}
            className="w-full py-3 px-6 bg-slate-100 dark:bg-midnight-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Usar no navegador</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-6 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
        <p>Amanhecer 2.0 • Devocional Diário Cristão</p>
        <p>100% Gratuito • Sem Anúncios • Fundamentado na Bíblia</p>
      </footer>
    </div>
  );
};
