import React, { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AppUpdateInfo } from '../content/updates/current-update';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: AppUpdateInfo;
  onUpdateApp?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onUpdateApp,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePerformUpdate = async () => {
    setIsUpdating(true);

    try {
      // 1. Marca a versão atual como vista no localStorage (preservando nome, notas e diário)
      localStorage.setItem('amanhecer_seen_update_version', updateInfo.version);
      localStorage.setItem('amanhecer_force_update_v230', 'true');

      if (onUpdateApp) {
        onUpdateApp();
      }

      // 2. Limpa caches estáticos antigos do Workbox/SW (NÃO toca em localStorage nem IndexedDB)
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        } catch {
          // ignore cache deletion errors
        }
      }

      // 3. Atualiza o Service Worker de forma segura e limpa
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update().catch(() => {});

          if (reg.waiting) {
            let reloaded = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              if (!reloaded) {
                reloaded = true;
                window.location.reload();
              }
            });
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            setTimeout(() => {
              if (!reloaded) window.location.reload();
            }, 800);
            return;
          }
        }
      }

      // 4. Recarrega o app suavemente
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-update-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ae-reveal-scale surface-editorial rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-sand-300/40 dark:border-graphite-700 p-6 space-y-4 text-center"
      >
        {/* Botão Fechar no topo */}
        <button
          onClick={onClose}
          disabled={isUpdating}
          className="ae-btn absolute top-3.5 right-3.5 p-1.5 rounded-full bg-sand-100 dark:bg-graphite-800 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 transition-colors"
          aria-label="Lembrar mais tarde"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge da versão */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-[11px] font-bold text-sage-800 dark:text-sand-200 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sand-300" />
          <span>{updateInfo.badge}</span>
        </div>

        {/* Título e Subtítulo */}
        <div className="space-y-1">
          <h2
            id="modal-update-title"
            className="text-xl font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
          >
            {updateInfo.title}
          </h2>
          <p className="text-xs text-graphite-600 dark:text-cream-200/90 leading-relaxed">
            {updateInfo.subtitle}
          </p>
        </div>

        {/* Garantia de dados salvos */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] font-medium text-sage-700 dark:text-sand-300 bg-sage-50/80 dark:bg-graphite-900 py-1.5 px-3 rounded-full border border-sage-200/60 dark:border-graphite-700">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-600 dark:text-sand-300 shrink-0" />
          <span>Seu nome, diário e notas continuam 100% salvos.</span>
        </div>

        {/* Botão de Ação Principal: Atualizar Agora */}
        <button
          onClick={handlePerformUpdate}
          disabled={isUpdating}
          className="ae-btn w-full py-3.5 px-6 rounded-full font-bold text-sm btn-tactile-sage flex items-center justify-center space-x-2 shadow-md disabled:opacity-70 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Atualizando aplicativo...' : 'Atualizar para a versão mais atual'}</span>
        </button>

        {/* Botão Discreto: "O que há de novo?" */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-graphite-500 hover:text-sage-800 dark:text-sand-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>O que há de novo?</span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Painel expansível com detalhes da versão */}
          {showDetails && (
            <div className="ae-reveal-scale mt-3 text-left bg-cream-50 dark:bg-graphite-900 rounded-2xl p-4 border border-sand-200/80 dark:border-graphite-700 space-y-2.5">
              <p className="text-xs font-medium text-graphite-700 dark:text-graphite-200 leading-relaxed">
                {updateInfo.summary}
              </p>

              <div className="space-y-2 pt-1 border-t border-sand-200/60 dark:border-graphite-700">
                {updateInfo.changes.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 text-[11px] text-graphite-600 dark:text-cream-200/90 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 dark:text-sand-300 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-graphite-400 dark:text-graphite-500 text-right pt-1">
                Lançado em {updateInfo.releaseDate}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
