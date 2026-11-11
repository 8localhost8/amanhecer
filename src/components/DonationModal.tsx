import React, { useState } from 'react';
import { Heart, Copy, Check, Sparkles, X } from 'lucide-react';
import { trackEvent } from '../services/analytics/analytics-client';

interface DonationModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const pixKey = '9ef6b117-6a64-40ca-931c-fe2a2218ab8d';

  if (!isOpen) return null;

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      trackEvent('donation_pix_copied', { source: 'startup_modal' });
      setTimeout(() => setCopied(false), 3500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = pixKey;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        trackEvent('donation_pix_copied', { source: 'startup_modal' });
        setTimeout(() => setCopied(false), 3500);
      } catch {
        // Silently ignore
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDismiss = () => {
    onClose(dontShowAgain);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ae-reveal-scale surface-editorial rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-sand-300/40 dark:border-graphite-700 p-6 space-y-4 text-center"
      >
        {/* Botão Fechar no topo */}
        <button
          onClick={handleDismiss}
          className="ae-btn absolute top-3.5 right-3.5 p-1.5 rounded-full bg-sand-100 dark:bg-graphite-800 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-[11px] font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-current text-rose-600 dark:text-rose-300" />
          <span>Apoio Comunitário</span>
        </div>

        {/* Título e Mensagem */}
        <div className="space-y-1.5">
          <h2
            id="donation-modal-title"
            className="text-xl font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
          >
            Apoie o Projeto Amanhecer
          </h2>
          <p className="text-xs text-graphite-600 dark:text-cream-200/90 leading-relaxed">
            O Amanhecer é um app gratuito e sem anúncios, considere apoiar os desenvolvedores, qualquer valor ajuda!
          </p>
        </div>

        {/* Caixa Pix */}
        <div className="p-3.5 rounded-2xl bg-sand-50/80 dark:bg-graphite-900/80 border border-sand-200 dark:border-graphite-700 space-y-2.5 text-left">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-graphite-500 dark:text-sand-300">
              Chave Pix:
            </span>
            {copied && (
              <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] ae-reveal-scale">
                <Check className="w-3 h-3" />
                <span>Copiada!</span>
              </span>
            )}
          </div>

          <div className="py-2 px-3 rounded-xl bg-white dark:bg-graphite-800 border border-sand-200/80 dark:border-graphite-700/80 font-mono text-[11px] text-graphite-700 dark:text-cream-100 select-all overflow-x-auto text-center">
            {pixKey}
          </div>

          <button
            type="button"
            onClick={handleCopyPix}
            className={`ae-btn w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'btn-tactile-sage'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Chave Pix Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Chave Pix</span>
              </>
            )}
          </button>
        </div>

        {/* Aviso de Fé / Rodapé */}
        <p className="text-[11px] text-graphite-500 dark:text-sand-300/80 italic">
          (não considere esta doação como seu dízimo pessoal)
        </p>

        {/* Checkbox "Não mostrar mais" */}
        <div className="pt-2 border-t border-sand-200/60 dark:border-graphite-700/60 flex flex-col items-center space-y-2.5">
          <label className="flex items-center space-x-2 text-xs text-graphite-600 dark:text-cream-200/90 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-sand-300 dark:border-graphite-600 text-sage-700 focus:ring-sage-500 w-4 h-4 cursor-pointer"
            />
            <span>Não mostrar mais</span>
          </label>

          <button
            type="button"
            onClick={handleDismiss}
            className="ae-btn w-full py-2.5 px-4 rounded-2xl bg-sand-100 hover:bg-sand-200 dark:bg-graphite-800 dark:hover:bg-graphite-700 text-graphite-700 dark:text-cream-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            Continuar para o aplicativo
          </button>
        </div>
      </div>
    </div>
  );
};
