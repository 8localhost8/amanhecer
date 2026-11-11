import React, { useState } from 'react';
import { Heart, Copy, Check, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/analytics/analytics-client';

interface DonationCardProps {
  source?: 'home' | 'settings' | 'modal';
  className?: string;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  source = 'home',
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const pixKey = '9ef6b117-6a64-40ca-931c-fe2a2218ab8d';

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      trackEvent('donation_pix_copied', { source });
      setTimeout(() => setCopied(false), 3500);
    } catch {
      // Fallback manual para navegadores que bloqueiam clipboard assíncrono
      const textArea = document.createElement('textarea');
      textArea.value = pixKey;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        trackEvent('donation_pix_copied', { source });
        setTimeout(() => setCopied(false), 3500);
      } catch {
        // Silently ignore
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <section
      aria-labelledby="donation-card-title"
      className={`surface-editorial rounded-3xl p-6 sm:p-7 relative overflow-hidden ae-reveal-up ae-card ${className}`}
    >
      {/* Decorative accent glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-sand-300/20 dark:bg-sand-300/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header com badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-rose-100 to-rose-200 dark:from-rose-950/60 dark:to-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shadow-2xs shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3
                id="donation-card-title"
                className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
              >
                Apoie o Projeto Amanhecer
              </h3>
              <p className="text-[11px] text-graphite-500 dark:text-sand-300/90 font-medium">
                Contribuição voluntária
              </p>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sand-100 dark:bg-sand-300/10 border border-sand-200/80 dark:border-sand-300/20 text-[10px] font-bold uppercase tracking-wider text-sage-800 dark:text-sand-200">
            <Sparkles className="w-3 h-3 text-sand-500 dark:text-sand-300" />
            <span>Gratuito & Sem Anúncios</span>
          </span>
        </div>

        {/* Mensagem Acolhedora */}
        <p className="text-xs sm:text-[13px] text-graphite-600 dark:text-cream-200/95 leading-relaxed">
          O <strong>Amanhecer</strong> é um aplicativo 100% gratuito e sem anúncios. Considere apoiar os desenvolvedores; qualquer valor nos ajuda a manter a infraestrutura e novos recursos no ar!
        </p>

        {/* Caixa da Chave Pix */}
        <div className="p-3.5 rounded-2xl bg-sand-50/80 dark:bg-graphite-900/80 border border-sand-200 dark:border-graphite-700 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-graphite-500 dark:text-sand-300">
              Chave Pix (Aleatória):
            </span>
            {copied && (
              <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] ae-reveal-scale">
                <Check className="w-3 h-3" />
                <span>Chave copiada!</span>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-graphite-800 border border-sand-200/80 dark:border-graphite-700/80 font-mono text-[11px] text-graphite-700 dark:text-cream-100 select-all overflow-x-auto text-center sm:text-left">
              {pixKey}
            </div>

            <button
              type="button"
              onClick={handleCopyPix}
              className={`ae-btn py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white border border-emerald-500 scale-98'
                  : 'btn-tactile-sage'
              }`}
              title="Copiar Chave Pix"
              aria-label="Copiar Chave Pix"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Pix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aviso de Fé e Consciência */}
        <p className="text-[11px] text-center text-graphite-500 dark:text-sand-300/80 italic pt-0.5">
          (não considere esta doação como seu dízimo pessoal)
        </p>
      </div>
    </section>
  );
};
