import React, { useState } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { requestAndSubscribePush, requestOSNotificationPermission } from '../services/notifications/push-client';
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
  const [isBlocked, setIsBlocked] = useState(false);

  if (!isOpen) return null;

  const cleanName = userName.trim();

  const handleActivate = async () => {
    setIsLoading(true);
    setIsBlocked(false);

    const perm = await requestOSNotificationPermission();
    const res = await requestAndSubscribePush(undefined, true, perm);

    setIsLoading(false);

    if (res.success && res.permission === 'granted') {
      const updated = saveUserPreferences({
        notificationsEnabled: true,
        dailyVerseEnabled: true,
        reminderEnabled: true,
        notifBugfixV23Seen: true,
        notifBugfixV24Seen: true,
        notifBugfixV25Seen: true,
        forceNotifPromptV1Seen: true,
      });
      setStatusMessage('Notificação ativada com sucesso!');
      setTimeout(() => {
        onClose(updated);
      }, 1200);
    } else {
      setIsBlocked(true);
    }
  };

  const handleDismiss = () => {
    const updated = saveUserPreferences({
      notifBugfixV23Seen: true,
      notifBugfixV24Seen: true,
      notifBugfixV25Seen: true,
      forceNotifPromptV1Seen: true,
    });
    onClose(updated);
  };

  return (
    <div
      className="ae-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="ae-modal-card bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-sm w-full p-6 shadow-xl relative overflow-hidden text-center space-y-4">
        <button
          onClick={handleDismiss}
          className="ae-btn absolute top-4 right-4 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 p-1.5 rounded-full"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="ae-spring-pop w-14 h-14 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center mx-auto ring-6 ring-sage-50 dark:ring-sage-950/40">
          <Bell className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2
            id="notif-modal-title"
            className="text-xl font-bold font-serif text-graphite-700 dark:text-graphite-50"
          >
            {cleanName ? `Graça e paz, ${cleanName}!` : 'Notificações do Amanhecer'}
          </h2>
          <p className="text-xs text-graphite-500 dark:text-graphite-300 leading-relaxed">
            Deseja receber o <strong>Versículo do Dia às 06:06</strong> e lembretes para sua leitura diária?
          </p>
        </div>

        {/* Blocked message (only if Android actively blocked the permission) */}
        {isBlocked && (
          <div className="ae-reveal-scale p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-left text-xs space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Notificações bloqueadas no aparelho
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              Para desbloquear: toque no ícone ao lado do link no navegador (ou segure o ícone do app na tela inicial) e mude para <strong>Permitir</strong>.
            </p>
          </div>
        )}

        {/* Success message */}
        {statusMessage && (
          <div className="ae-reveal-scale p-3 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-xs font-semibold text-sage-800 dark:text-sage-200 flex items-center justify-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleActivate}
            disabled={isLoading || !!statusMessage}
            className="ae-btn ae-btn-shimmer w-full py-3.5 px-5 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs disabled:opacity-60"
          >
            <Bell className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Conectando...'
                : isBlocked
                ? 'Já permiti, tentar de novo'
                : 'Permitir Notificações'}
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
