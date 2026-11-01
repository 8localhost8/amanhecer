import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { InAppNotificationPayload, subscribeToInAppNotifications } from '../services/notifications/push-client';

interface InAppNotificationBannerProps {
  onOpenDevotional?: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  onOpenDevotional,
}) => {
  const [activeNotif, setActiveNotif] = useState<InAppNotificationPayload | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((notif) => {
      setActiveNotif(notif);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeNotif) return;
    const timer = setTimeout(() => {
      setActiveNotif(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeNotif]);

  if (!activeNotif) return null;

  return (
    <div
      className="fixed top-3 inset-x-0 z-[100] flex justify-center px-3 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        onClick={() => {
          setActiveNotif(null);
          if (onOpenDevotional) onOpenDevotional();
        }}
        className="ae-spring-pop pointer-events-auto max-w-md w-full bg-white/95 dark:bg-graphite-800/95 backdrop-blur-md border border-sand-200 dark:border-graphite-700 rounded-3xl p-3.5 shadow-xl flex items-start space-x-3 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-sand-200 dark:ring-graphite-700">
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

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-graphite-800 dark:text-graphite-50 truncate">
              {activeNotif.title}
            </span>
            <span className="text-[10px] text-graphite-400 ml-2 flex-shrink-0">agora</span>
          </div>
          <p className="text-xs text-graphite-600 dark:text-graphite-300 line-clamp-2 mt-0.5 leading-snug">
            {activeNotif.body}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveNotif(null);
          }}
          className="p-1 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 rounded-full flex-shrink-0"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
