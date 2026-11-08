import React, { useState, useEffect } from 'react';
import { Zap, X, Bell, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { scheduleExtremeTestNotification } from '../services/notifications/push-client';

interface ExtremeTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtremeTestModal: React.FC<ExtremeTestModalProps> = ({ isOpen, onClose }) => {
  const [delaySeconds, setDelaySeconds] = useState<number>(20);
  const [customTitle, setCustomTitle] = useState<string>('⚡ Notificação Extreme — Amanhecer');
  const [customBody, setCustomBody] = useState<string>(
    'Sucesso absoluto! A notificação chegou no horário agendado com o app fechado.'
  );
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduledSuccess, setScheduledSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleStartExtremeTest = async () => {
    setIsScheduling(true);
    setErrorMessage(null);
    setScheduledSuccess(false);

    const res = await scheduleExtremeTestNotification(delaySeconds, customTitle, customBody);

    setIsScheduling(false);

    if (res.success) {
      setScheduledSuccess(true);
      setCountdown(delaySeconds);
    } else {
      setErrorMessage(res.error || 'Falha ao agendar teste. Verifique se as notificações estão ativadas.');
    }
  };

  const presetTimes = [
    { label: '10 seg', value: 10 },
    { label: '20 seg', value: 20 },
    { label: '30 seg', value: 30 },
    { label: '45 seg', value: 45 },
    { label: '60 seg', value: 55 },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="extreme-test-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ae-reveal-scale surface-editorial rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto relative shadow-2xl border border-sand-300/40 dark:border-graphite-700 p-6 space-y-4"
      >
        <button
          onClick={onClose}
          className="ae-btn absolute top-3.5 right-3.5 p-1.5 rounded-full bg-sand-100 dark:bg-graphite-800 text-graphite-500 hover:text-graphite-800 dark:text-graphite-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Temporário */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Recurso Temporário</span>
          </div>
        </div>

        <div>
          <h2
            id="extreme-test-title"
            className="text-xl font-bold font-serif text-graphite-800 dark:text-cream-50 leading-tight"
          >
            Testar Notificação Extreme
          </h2>
          <p className="text-xs text-graphite-500 dark:text-cream-200/80 mt-1 leading-relaxed">
            Agende uma notificação real enviada direto pelo servidor Vercel para comprovar a chegada com o celular bloqueado ou app fechado.
          </p>
        </div>

        {/* Status de Agendamento Ativo / Contagem Regressiva */}
        {scheduledSuccess && countdown !== null && (
          <div className="ae-reveal-scale bg-sage-800 text-cream-50 rounded-2xl p-4 text-center space-y-2 shadow-lg border border-sage-600">
            <div className="flex items-center justify-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-widest">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Disparando em {countdown} segundos</span>
            </div>
            <p className="text-xs text-cream-100 font-medium">
              👉 <strong>FECHE O APP</strong> ou <strong>BLOQUEIE A TELA</strong> agora mesmo para ver a notificação apitar na barra do celular!
            </p>
            <div className="w-full bg-sage-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((delaySeconds - countdown) / delaySeconds) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="ae-reveal-scale bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Escolha do Tempo */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-graphite-600 dark:text-cream-100 uppercase tracking-wider block">
            Em quanto tempo disparar:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {presetTimes.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDelaySeconds(preset.value)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                  delaySeconds === preset.value
                    ? 'border-sage-700 bg-sage-800 text-cream-50 shadow-xs'
                    : 'border-sand-200 dark:border-graphite-700 text-graphite-600 dark:text-graphite-300 hover:border-sage-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-graphite-400 pt-1">
            <span>Tempo escolhido: <strong>{delaySeconds} segundos</strong></span>
            <span>Máximo: 55s</span>
          </div>
        </div>

        {/* Mensagem customizada */}
        <div className="space-y-2 pt-1 border-t border-sand-100 dark:border-graphite-800">
          <label className="text-xs font-bold text-graphite-600 dark:text-cream-100 uppercase tracking-wider block">
            Texto da Notificação:
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Título da Notificação"
            maxLength={60}
            className="w-full px-3.5 py-2 rounded-xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 text-xs text-graphite-800 dark:text-graphite-100 focus:outline-none focus:ring-2 focus:ring-sage-600"
          />
          <textarea
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder="Mensagem da Notificação"
            rows={2}
            maxLength={140}
            className="w-full px-3.5 py-2 rounded-xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 text-xs text-graphite-800 dark:text-graphite-100 focus:outline-none focus:ring-2 focus:ring-sage-600 resize-none"
          />
        </div>

        {/* Botão de Disparo */}
        <button
          onClick={handleStartExtremeTest}
          disabled={isScheduling}
          className="ae-btn w-full py-3.5 px-6 rounded-full font-bold text-sm bg-amber-500 hover:bg-amber-600 text-graphite-950 flex items-center justify-center space-x-2 shadow-md disabled:opacity-60 transition-all cursor-pointer"
        >
          {isScheduling ? (
            <span>Conectando com o servidor...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Agendar Notificação Extreme ({delaySeconds}s)</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-graphite-400 dark:text-graphite-500">
          Este teste utiliza o servidor oficial da Vercel e o serviço de Web Push (FCM/APNs).
        </p>
      </div>
    </div>
  );
};
