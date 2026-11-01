import React, { useState } from 'react';
import { Bell, CheckCircle2, Sparkles, X } from 'lucide-react';
import { requestAndSubscribePush } from '../services/notifications/push-client';
import { saveUserPreferences, UserPreferences } from '../storage/preferences';

interface NotificationBugfixModalProps {
  isOpen: boolean;
  onClose: (updatedPrefs: UserPreferences) => void;
  userName?: string;
}

export const NotificationBugfixModal: React.FC<NotificationBugfixModalProps> = ({
  isOpen,
  onClose,
  userName = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanName = userName.trim();

  const handleConfirmPermission = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Force refresh subscription with fixed VAPID & Service Worker engine
    const res = await requestAndSubscribePush(undefined, true);
    setIsLoading(false);

    if (res.success) {
      const updated = saveUserPreferences({
        notificationsEnabled: true,
        dailyVerseEnabled: true,
        reminderEnabled: true,
        notifBugfixV23Seen: true,
      });
      setStatusMessage('Permissão atualizada com sucesso! Uma notificação de teste foi enviada.');
      setTimeout(() => {
        onClose(updated);
      }, 1400);
    } else {
      setErrorMessage(
        res.error ||
          'Não foi possível ativar. Verifique se as notificações estão permitidas no cadeado da barra de endereço.'
      );
    }
  };

  const handleDismiss = () => {
    const updated = saveUserPreferences({
      notifBugfixV23Seen: true,
    });
    onClose(updated);
  };

  return (
    <div
      className="ae-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-bugfix-title"
    >
      <div className="ae-modal-card bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-sm w-full p-6 shadow-xl relative overflow-hidden text-center space-y-4">
        <button
          onClick={handleDismiss}
          className="ae-btn absolute top-4 right-4 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 p-1.5 rounded-full"
          aria-label="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon with spring pop */}
        <div className="ae-spring-pop w-14 h-14 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center mx-auto ring-6 ring-sage-50 dark:ring-sage-950/40">
          <Bell className="w-7 h-7" />
        </div>

        {/* Badge */}
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-sand-100 dark:bg-graphite-700 text-sage-800 dark:text-sage-300 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Atualização de Correção de Bug</span>
          </span>
        </div>

        {/* Title & Explanation */}
        <div className="space-y-1.5">
          <h2
            id="notif-bugfix-title"
            className="text-xl font-bold font-serif text-graphite-700 dark:text-graphite-50"
          >
            {cleanName
              ? `${cleanName}, corrigimos as notificações!`
              : 'Corrigimos as notificações!'}
          </h2>
          <p className="text-xs text-graphite-500 dark:text-graphite-300 leading-relaxed">
            Lançamos uma atualização que corrige a falha que impedia o envio das notificações no aplicativo instalado.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-cream-50 dark:bg-graphite-900 p-3.5 rounded-2xl border border-sand-200/80 dark:border-graphite-700 text-left text-xs text-graphite-600 dark:text-graphite-300 space-y-1.5">
          <p className="font-semibold text-graphite-700 dark:text-graphite-100">
            Para receber o Versículo do Dia às 06:06 e seus lembretes:
          </p>
          <p className="text-[11px] text-graphite-500 dark:text-graphite-400 leading-relaxed">
            Toque no botão abaixo para renovar a permissão de notificações neste aparelho com a nova versão corrigida.
          </p>
        </div>

        {statusMessage && (
          <div className="ae-reveal-scale p-3 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="ae-reveal-scale p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleConfirmPermission}
            disabled={isLoading || !!statusMessage}
            className="ae-btn ae-btn-shimmer w-full py-3.5 px-5 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs disabled:opacity-60"
          >
            <Bell className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Atualizando permissão...'
                : 'Permitir e Atualizar Notificações'}
            </span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2 text-[11px] font-semibold text-graphite-400 hover:text-graphite-600 dark:hover:text-graphite-300 transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
