import React, { useState, useEffect } from 'react';
import { Download, ArrowRight, HelpCircle, Check, CheckCircle2, Users, ShieldCheck } from 'lucide-react';
import {
  fetchInstallCount,
  getCachedInstallCount,
  recordAppInstallationOnce,
} from '../services/stats/install-counter';
import { TermsAndPrivacyModal } from '../components/TermsAndPrivacyModal';
import { trackEvent } from '../services/analytics/analytics-client';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenHelp: () => void;
  deferredPrompt: any;
  onNavigateLegal?: (path: '/termos-de-uso' | '/politica-de-privacidade' | '/politica-de-cookies') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenHelp,
  deferredPrompt,
  onNavigateLegal,
}) => {
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);
  const [installCount, setInstallCount] = useState<number>(() => getCachedInstallCount());
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    trackEvent('landing_viewed', { page: 'landing' });

    fetchInstallCount().then((count) => {
      if (mounted) setInstallCount(count);
    });

    const handleAppInstalled = () => {
      trackEvent('pwa_appinstalled_detected', { source: 'landing_appinstalled_event' });
      recordAppInstallationOnce().then((newCount) => {
        if (mounted) setInstallCount(newCount);
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      mounted = false;
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    trackEvent('landing_interacted', { action: 'install_button' });
    trackEvent('landing_cta_clicked', { cta: 'install', has_native_prompt: Boolean(deferredPrompt) });

    if (deferredPrompt) {
      try {
        trackEvent('install_prompt_triggered', { source: 'landing' });
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        trackEvent('install_prompt_outcome', { outcome: choice.outcome || 'unknown' });
        if (choice.outcome === 'accepted') {
          trackEvent('pwa_appinstalled_detected', { source: 'beforeinstallprompt_accepted' });
          const updatedCount = await recordAppInstallationOnce();
          setInstallCount(updatedCount);
          setInstallSuccessMessage(
            'Aplicativo instalado com sucesso! Abra o Amanhecer direto pelo ícone na tela inicial do seu aparelho.'
          );
        }
      } catch (err) {
        console.warn('Erro ao acionar prompt de instalação:', err);
        trackEvent('install_tutorial_opened', { source: 'landing_fallback' });
        onOpenHelp();
      }
    } else {
      trackEvent('install_tutorial_opened', { source: 'landing_direct' });
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
          <span className="text-sm font-bold font-serif text-graphite-700 dark:text-cream-50">
            Amanhecer
          </span>
        </div>

        <button
          onClick={() => {
            trackEvent('landing_interacted', { action: 'help_button' });
            trackEvent('landing_cta_clicked', { cta: 'help' });
            trackEvent('install_tutorial_opened', { source: 'landing_top_help' });
            onOpenHelp();
          }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full surface-editorial text-graphite-700 dark:text-cream-100 text-xs font-medium ae-btn"
          title="Ajuda de instalação"
          aria-label="Abrir ajuda de instalação"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300" />
          <span>Ajuda (?)</span>
        </button>
      </div>

      {/* Main Hero */}
      <div className="my-auto py-5 space-y-4">
        {/* Official Amanhecer Brand Icon with Spring Pop (Stagger 2) */}
        <div className="relative w-32 h-32 mx-auto rounded-3xl overflow-hidden shadow-lg ring-4 ring-sand-200/80 dark:ring-sand-300/30 flex items-center justify-center bg-[#F7F4EB] dark:bg-[#384736] ae-spring-pop ae-stagger-2 ae-card">
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
          <h1 className="text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50 tracking-tight">
            Amanhecer
          </h1>
          <p className="text-xs uppercase tracking-widest text-sage-700 dark:text-sand-300 font-semibold">
            Devocional Diário
          </p>
          <p className="text-sm font-serif italic text-graphite-600 dark:text-cream-200 pt-0.5">
            "Um momento com Deus, todos os dias."
          </p>

          {/* Live Download / Install Counter Badge */}
          <div className="pt-2 flex justify-center">
            <div
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full surface-warm-sand text-xs font-semibold text-graphite-800 dark:text-cream-100 shadow-2xs"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 dark:bg-sand-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-700 dark:bg-sand-300" />
              </span>
              <Users className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
              <span>
                <strong className="font-bold text-sage-900 dark:text-sand-200">
                  {installCount.toLocaleString('pt-BR')}
                </strong>{' '}
                {installCount === 1 ? 'pessoa já baixou o app' : 'pessoas já baixaram o app'}
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Feature Pills (Stagger 4) */}
        <div className="surface-editorial rounded-3xl p-4 text-left text-xs text-graphite-600 dark:text-cream-100 space-y-2 ae-reveal-up ae-stagger-4 ae-card">
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 flex-shrink-0" />
            <span>Fundamentado no cânon bíblico de 66 livros</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 flex-shrink-0" />
            <span>Versículo do dia às 06:06 e lembretes serenos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 flex-shrink-0" />
            <span>100% Gratuito, sem cadastro e sem anúncios</span>
          </div>
        </div>

        {/* Installation Success Notice */}
        {installSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-sage-100 dark:bg-cream-100/15 border border-sage-300 dark:border-sand-300/40 text-xs text-sage-900 dark:text-cream-100 flex items-start space-x-2 text-left ae-spring-pop">
            <CheckCircle2 className="w-4 h-4 text-sage-700 dark:text-sand-300 flex-shrink-0 mt-0.5" />
            <p>{installSuccessMessage}</p>
          </div>
        )}

        {/* Action Buttons (Stagger 5) */}
        <div className="space-y-2.5 pt-1 ae-reveal-up ae-stagger-5">
          {/* Primary Action: Instalar Aplicativo */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-6 btn-tactile-sage font-bold rounded-full shadow-md flex items-center justify-center space-x-2 text-sm ae-btn ae-btn-shimmer"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Aplicativo</span>
          </button>

          {/* Secondary Action: Usar no Navegador */}
          <button
            onClick={() => {
              trackEvent('landing_interacted', { action: 'use_browser' });
              trackEvent('landing_cta_clicked', { cta: 'use_browser' });
              onEnterApp();
            }}
            className="w-full py-2.5 px-6 bg-transparent hover:bg-sand-200/60 dark:hover:bg-cream-100/10 text-graphite-600 dark:text-sand-200 font-medium rounded-full text-xs flex items-center justify-center space-x-1.5 ae-btn group"
          >
            <span>Usar no navegador</span>
            <ArrowRight className="w-3.5 h-3.5 text-graphite-400 dark:text-sand-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Legal Notice & Terms Trigger (LGPD) */}
        <div className="pt-1 ae-reveal-up ae-stagger-6 space-y-1.5">
          <p className="text-[11px] text-graphite-500 dark:text-sand-300/90 leading-relaxed">
            Compromisso com a transparência e proteção de dados:{' '}
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="underline font-semibold text-sage-800 dark:text-cream-100 hover:text-sage-950 dark:hover:text-white inline-flex items-center gap-0.5"
            >
              <ShieldCheck className="w-3 h-3 inline" />
              <span>Resumo de Privacidade (LGPD)</span>
            </button>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-graphite-500 dark:text-sand-300/80">
            <a
              href="/termos-de-uso"
              onClick={(e) => {
                if (onNavigateLegal) {
                  e.preventDefault();
                  onNavigateLegal('/termos-de-uso');
                }
              }}
              className="underline hover:text-graphite-800 dark:hover:text-white"
            >
              Termos de Uso
            </a>
            <span>•</span>
            <a
              href="/politica-de-privacidade"
              onClick={(e) => {
                if (onNavigateLegal) {
                  e.preventDefault();
                  onNavigateLegal('/politica-de-privacidade');
                }
              }}
              className="underline hover:text-graphite-800 dark:hover:text-white"
            >
              Política de Privacidade
            </a>
            <span>•</span>
            <a
              href="/politica-de-cookies"
              onClick={(e) => {
                if (onNavigateLegal) {
                  e.preventDefault();
                  onNavigateLegal('/politica-de-cookies');
                }
              }}
              className="underline hover:text-graphite-800 dark:hover:text-white"
            >
              Cookies e Dados
            </a>
          </div>
        </div>
      </div>

      {/* Footer (Stagger 6) */}
      <footer className="pt-2 text-[10px] text-graphite-400 dark:text-sand-300/70 ae-reveal-up ae-stagger-6">
        <p>Amanhecer 2.0 • Sem fins lucrativos • Para a glória de Deus</p>
      </footer>

      {/* Terms of Use & Privacy Policy Modal */}
      <TermsAndPrivacyModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
};
