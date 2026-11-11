import React, { useState, useEffect } from 'react';
import { Shield, SlidersHorizontal, ExternalLink, Info } from 'lucide-react';
import {
  shouldShowConsentBanner,
  grantAnalyticsConsent,
  refuseAnalyticsConsent,
  onConsentChange,
  ConsentOrigin,
} from '../services/consent/consent-manager';

interface PrivacyConsentBannerProps {
  origin?: ConsentOrigin;
  onNavigateLegal?: (path: '/termos-de-uso' | '/politica-de-privacidade' | '/politica-de-cookies') => void;
}

export const PrivacyConsentBanner: React.FC<PrivacyConsentBannerProps> = ({
  origin = 'banner',
  onNavigateLegal,
}) => {
  const [visible, setVisible] = useState<boolean>(() => shouldShowConsentBanner());
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [showDataDetails, setShowDataDetails] = useState<boolean>(false);

  // Checkboxes independentes (Seção 20: o checkbox de analytics inicia SEMPRE desmarcado)
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [analyticsChecked, setAnalyticsChecked] = useState<boolean>(false);

  useEffect(() => {
    setVisible(shouldShowConsentBanner());
    const unsub = onConsentChange(() => {
      setVisible(shouldShowConsentBanner());
    });
    return unsub;
  }, []);

  if (!visible) return null;

  const handleRefuse = () => {
    refuseAnalyticsConsent(origin, true);
    setVisible(false);
  };

  const handleAccept = () => {
    grantAnalyticsConsent(origin, true);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    if (analyticsChecked) {
      grantAnalyticsConsent(origin, termsChecked || true);
    } else {
      refuseAnalyticsConsent(origin, termsChecked || true);
    }
    setVisible(false);
  };

  const openLegalLink = (
    e: React.MouseEvent,
    path: '/termos-de-uso' | '/politica-de-privacidade' | '/politica-de-cookies'
  ) => {
    if (onNavigateLegal) {
      e.preventDefault();
      onNavigateLegal(path);
    }
  };

  return (
    <aside
      role="region"
      aria-label="Aviso de Privacidade e Consentimento LGPD"
      data-testid="privacy-consent-banner"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white dark:bg-graphite-900 border border-sand-300 dark:border-graphite-700 shadow-xl p-4 sm:p-5 text-left transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-sand-100 dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-sage-800 dark:text-sand-300" />
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50">
                Sua privacidade importa.
              </h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sand-100 dark:bg-graphite-800 text-graphite-600 dark:text-sand-300 border border-sand-200 dark:border-graphite-700">
                LGPD • Privacidade por Padrão
              </span>
            </div>

            <p className="text-xs text-graphite-600 dark:text-cream-200/90 leading-relaxed">
              O Amanhecer utiliza os recursos necessários para funcionar. Com sua autorização,
              também podemos coletar estatísticas de utilização para entender como melhorar o
              aplicativo. Você pode recusar ou mudar sua escolha a qualquer momento, sem perder
              acesso aos devocionais.
            </p>

            {/* Links diretos destacados para documentos legais */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-0.5">
              <a
                href="/politica-de-privacidade"
                onClick={(e) => openLegalLink(e, '/politica-de-privacidade')}
                className="font-semibold underline text-graphite-700 dark:text-sand-200 hover:text-sage-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>Política de Privacidade</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="/termos-de-uso"
                onClick={(e) => openLegalLink(e, '/termos-de-uso')}
                className="font-semibold underline text-graphite-700 dark:text-sand-200 hover:text-sage-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>Termos de Uso</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="/politica-de-cookies"
                onClick={(e) => openLegalLink(e, '/politica-de-cookies')}
                className="font-semibold underline text-graphite-700 dark:text-sand-200 hover:text-sage-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span>Política de Armazenamento</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <button
                type="button"
                onClick={() => setShowDataDetails((v) => !v)}
                className="font-medium text-graphite-500 dark:text-sand-300 hover:text-graphite-800 dark:hover:text-white inline-flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                <span>{showDataDetails ? 'Ocultar finalidades' : 'Quais dados são usados?'}</span>
              </button>
            </div>

            {showDataDetails && (
              <div className="p-3 rounded-xl bg-sand-50 dark:bg-graphite-850 border border-sand-200 dark:border-graphite-700 text-[11px] text-graphite-600 dark:text-cream-200 space-y-1.5">
                <p>
                  <strong>1. Armazenamento essencial no aparelho (sem envio externo):</strong>{' '}
                  Suas anotações no Diário de Oração, devocionais favoritos, histórico local e
                  ajustes de leitura (tema e fonte) ficam guardados apenas no seu dispositivo.
                </p>
                <p>
                  <strong>2. Estatísticas de utilização (Opcional — desativado por padrão):</strong>{' '}
                  Se autorizado, coletamos métricas de navegação, conclusão de leituras,
                  compartilhamentos e falhas técnicas com identificador pseudônimo aleatório, sem
                  coletar nome, e-mail, IP completo, localização precisa ou textos pessoais.
                </p>
              </div>
            )}

            {/* Painel Personalizar com checkboxes independentes (Seção 20) */}
            {isCustomizing && (
              <div
                data-testid="consent-customize-panel"
                className="p-3.5 rounded-xl bg-sand-50/90 dark:bg-graphite-850 border border-sand-200 dark:border-graphite-700 space-y-2.5 text-xs"
              >
                <label className="flex items-start gap-2.5 cursor-pointer text-graphite-700 dark:text-cream-100">
                  <input
                    type="checkbox"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    data-testid="checkbox-terms"
                    className="mt-0.5 w-4 h-4 rounded accent-sage-700"
                  />
                  <span>
                    Li e aceito os{' '}
                    <a
                      href="/termos-de-uso"
                      onClick={(e) => openLegalLink(e, '/termos-de-uso')}
                      className="underline font-semibold"
                    >
                      Termos de Uso
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-graphite-700 dark:text-cream-100">
                  <input
                    type="checkbox"
                    checked={analyticsChecked}
                    onChange={(e) => setAnalyticsChecked(e.target.checked)}
                    data-testid="checkbox-analytics"
                    className="mt-0.5 w-4 h-4 rounded accent-sage-700"
                  />
                  <span>
                    Autorizo a coleta opcional de dados de utilização para melhorar o Amanhecer.
                    <span className="block text-[11px] text-graphite-500 dark:text-sand-300/80">
                      Opcional. Desmarcado por padrão. A recusa não afeta o acesso aos devocionais.
                    </span>
                  </span>
                </label>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    data-testid="btn-save-custom-consent"
                    className="py-2 px-4 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 hover:bg-sand-100 dark:hover:bg-graphite-700 text-graphite-800 dark:text-cream-50 text-xs font-semibold transition-colors"
                  >
                    Confirmar minhas escolhas
                  </button>
                </div>
              </div>
            )}

            {/* Três botões simétricos sem indução visual (Seção 31) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleRefuse}
                data-testid="btn-refuse-analytics"
                className="py-2.5 px-3 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 hover:bg-sand-100 dark:hover:bg-graphite-700 text-graphite-800 dark:text-cream-50 text-xs font-semibold transition-colors text-center"
              >
                Recusar analytics
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizing((prev) => !prev)}
                data-testid="btn-customize-consent"
                className="py-2.5 px-3 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 hover:bg-sand-100 dark:hover:bg-graphite-700 text-graphite-800 dark:text-cream-50 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Personalizar</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                data-testid="btn-accept-analytics"
                className="py-2.5 px-3 rounded-xl border border-graphite-300 dark:border-graphite-600 bg-white dark:bg-graphite-800 hover:bg-sand-100 dark:hover:bg-graphite-700 text-graphite-800 dark:text-cream-50 text-xs font-semibold transition-colors text-center"
              >
                Aceitar analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
