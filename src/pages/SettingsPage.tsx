import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Type, Bell, ShieldCheck, BookOpen, Send, User } from 'lucide-react';
import { UserPreferences, saveUserPreferences, FontSizePreset, AppTheme } from '../storage/preferences';
import { TermsAndPrivacyModal } from '../components/TermsAndPrivacyModal';
import {
  getPushStatus,
  requestAndSubscribePush,
  requestOSNotificationPermission,
  unsubscribePush,
  sendTestNotification,
  syncNotificationScheduleWithSW,
  PushStatus,
} from '../services/notifications/push-client';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ preferences, onUpdatePreferences }) => {
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [browserNotifBlocked, setBrowserNotifBlocked] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const status = await getPushStatus();
    setPushStatus(status);
  };

  const handleThemeChange = (theme: AppTheme) => {
    const updated = saveUserPreferences({ theme });
    onUpdatePreferences(updated);
  };

  const handleFontSizePresetChange = (preset: FontSizePreset) => {
    let size = 18;
    if (preset === 'small') size = 16;
    if (preset === 'medium') size = 18;
    if (preset === 'large') size = 22;
    if (preset === 'xlarge') size = 26;
    const updated = saveUserPreferences({ fontSizePreset: preset, fineFontSize: size });
    onUpdatePreferences(updated);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    const updated = saveUserPreferences({ fineFontSize: size });
    onUpdatePreferences(updated);
  };

  const handleTogglePushNotifications = async () => {
    if (preferences.notificationsEnabled) {
      await unsubscribePush();
      const updated = saveUserPreferences({ notificationsEnabled: false });
      onUpdatePreferences(updated);
      setBrowserNotifBlocked(false);
    } else {
      const permPromise = requestOSNotificationPermission();
      const perm = await permPromise;
      const res = await requestAndSubscribePush(undefined, true, perm);
      if (res.success && res.permission === 'granted') {
        const updated = saveUserPreferences({ notificationsEnabled: true });
        onUpdatePreferences(updated);
        setBrowserNotifBlocked(false);
        setTestSuccessMsg('Notificações ativadas! Enviamos um aviso na barra do seu celular.');
        setTimeout(() => setTestSuccessMsg(null), 5000);
      } else {
        setBrowserNotifBlocked(true);
      }
    }
    await checkStatus();
  };

  const handleToggleDailyVerse = (enabled: boolean) => {
    const updated = saveUserPreferences({ dailyVerseEnabled: enabled });
    onUpdatePreferences(updated);
    syncNotificationScheduleWithSW();
  };

  const handleToggleReminders = (enabled: boolean) => {
    const updated = saveUserPreferences({ reminderEnabled: enabled });
    onUpdatePreferences(updated);
    syncNotificationScheduleWithSW();
  };

  const handleSendTestNotification = async () => {
    setIsTestingPush(true);
    setTestSuccessMsg(null);
    const res = await sendTestNotification();
    if (res.success) {
      setBrowserNotifBlocked(false);
      setTestSuccessMsg('Notificação enviada na barra do seu celular!');
      setTimeout(() => setTestSuccessMsg(null), 5000);
    } else {
      setBrowserNotifBlocked(true);
    }
    setIsTestingPush(false);
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      <div className="ae-reveal-up ae-stagger-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
          Configurações
        </h1>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          Personalize sua experiência de leitura e lembretes diários
        </p>
      </div>

      {/* 0. Nome do Leitor */}
      <section className="ae-reveal-up ae-stagger-2 ae-card surface-editorial rounded-3xl p-5 sm:p-6 space-y-3">
        <h2 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider flex items-center space-x-2">
          <User className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
          <span>Como podemos te chamar</span>
        </h2>
        <input
          type="text"
          value={preferences.userName || ''}
          onChange={(e) => {
            const updated = saveUserPreferences({ userName: e.target.value });
            onUpdatePreferences(updated);
          }}
          placeholder="Digite seu nome ou apelido"
          maxLength={30}
          className="w-full px-4 py-2.5 rounded-2xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 text-sm text-graphite-800 dark:text-graphite-100 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-sage-600 transition-all"
        />
        <p className="text-[11px] text-graphite-400 dark:text-graphite-400">
          Seu nome é salvo com privacidade unicamente no seu dispositivo.
        </p>
      </section>

      {/* 1. Tema */}
      <section className="ae-reveal-up ae-stagger-3 ae-card surface-editorial rounded-3xl p-5 sm:p-6 space-y-3.5">
        <h2 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider flex items-center space-x-2">
          <Sun className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
          <span>Tema de Exibição</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
              preferences.theme === 'light'
                ? 'border-sage-600 bg-sage-50 text-sage-900 dark:bg-sage-900/60 font-bold shadow-xs'
                : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
              preferences.theme === 'dark'
                ? 'border-sage-500 bg-graphite-850 text-sage-200 font-bold shadow-xs'
                : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
            }`}
          >
            <Moon className="w-4 h-4 text-sage-300" />
            <span>Escuro</span>
          </button>
          <button
            onClick={() => handleThemeChange('auto')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
              preferences.theme === 'auto'
                ? 'border-sage-600 bg-sage-50 dark:bg-graphite-850 text-sage-900 dark:text-sage-200 font-bold shadow-xs'
                : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
            }`}
          >
            <Sparkles className="w-4 h-4 text-graphite-400" />
            <span>Automático</span>
          </button>
        </div>
      </section>

      {/* 2. Tamanho da Fonte */}
      <section className="ae-reveal-up ae-stagger-4 ae-card surface-editorial rounded-3xl p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider flex items-center space-x-2">
            <Type className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>Tamanho da Letra</span>
          </h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sand-100 dark:bg-graphite-700 text-graphite-600 dark:text-graphite-300">
            {preferences.fineFontSize}px
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['small', 'medium', 'large', 'xlarge'] as FontSizePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleFontSizePresetChange(preset)}
              className={`py-2 px-1 rounded-full text-xs font-semibold border text-center transition-all ${
                preferences.fontSizePreset === preset
                  ? 'border-sage-600 bg-sage-100 text-sage-900 dark:bg-sage-900/60 dark:text-sage-200 font-bold shadow-xs'
                  : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
              }`}
            >
              {preset === 'small' && 'Pequena'}
              {preset === 'medium' && 'Média'}
              {preset === 'large' && 'Grande'}
              {preset === 'xlarge' && 'Muito grande'}
            </button>
          ))}
        </div>

        <div className="space-y-1 pt-1">
          <input
            type="range"
            min="16"
            max="32"
            value={preferences.fineFontSize}
            onChange={handleSliderChange}
            className="w-full accent-sage-700 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-graphite-400">
            <span>16px (Padrão)</span>
            <span>24px (Grande)</span>
            <span>32px (Acessível)</span>
          </div>
        </div>

        {/* Prévia */}
        <div className="bg-cream-50 dark:bg-graphite-900 p-4 rounded-2xl border border-sand-200/80 dark:border-graphite-700">
          <span className="text-[10px] font-bold text-sage-700 dark:text-sage-400 uppercase tracking-wider block mb-1">
            Prévia do texto:
          </span>
          <p
            style={{ fontSize: `${preferences.fineFontSize}px`, lineHeight: 1.65 }}
            className="font-serif italic text-graphite-700 dark:text-graphite-100"
          >
            "Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento."
          </p>
        </div>
      </section>

      {/* 3. Notificações */}
      <section className="ae-reveal-up ae-stagger-5 ae-card surface-editorial rounded-3xl p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-graphite-400 dark:text-graphite-400 uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>Notificações Diárias</span>
          </h2>

          <button
            onClick={handleTogglePushNotifications}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
              preferences.notificationsEnabled
                ? 'bg-sage-800 text-cream-50'
                : 'bg-sand-200 dark:bg-graphite-700 text-graphite-600 dark:text-graphite-300'
            }`}
          >
            {preferences.notificationsEnabled ? 'Ativadas' : 'Desativadas'}
          </button>
        </div>

        <p className="text-xs text-graphite-500 dark:text-graphite-400 leading-relaxed">
          Receba o versículo matinal e lembretes discretos para cultivar o seu momento com Deus.
        </p>

        {browserNotifBlocked && (
          <div className="ae-reveal-scale bg-amber-50/90 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold">Notificações bloqueadas no aparelho</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Toque no ícone ao lado do link no navegador (ou segure o ícone do app na tela inicial) e mude Notificações para <strong>Permitir</strong>.
            </p>
          </div>
        )}

        {preferences.notificationsEnabled && (
          <div className="space-y-3 pt-2 border-t border-sand-100 dark:border-graphite-700">
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <div>
                <span className="font-semibold text-graphite-700 dark:text-graphite-200 block">
                  ☀️ Versículo do Dia às 06:06
                </span>
                <span className="text-graphite-400 text-[11px]">
                  Enviado pontualmente toda manhã
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.dailyVerseEnabled}
                onChange={(e) => handleToggleDailyVerse(e.target.checked)}
                className="w-4 h-4 accent-sage-700 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <div>
                <span className="font-semibold text-graphite-700 dark:text-graphite-200 block">
                  📖 Lembretes de leitura pendente
                </span>
                <span className="text-graphite-400 text-[11px]">
                  Às 11:00, 16:00 e 21:00 (param após a leitura)
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.reminderEnabled}
                onChange={(e) => handleToggleReminders(e.target.checked)}
                className="w-4 h-4 accent-sage-700 rounded"
              />
            </label>

            <button
              onClick={handleSendTestNotification}
              disabled={isTestingPush}
              className="ae-btn mt-2 w-full py-2.5 px-3 bg-sand-100 dark:bg-graphite-700 hover:bg-sand-200 text-graphite-700 dark:text-graphite-200 text-xs font-semibold rounded-full flex items-center justify-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingPush ? 'Enviando...' : 'Testar Notificação Agora'}</span>
            </button>

            {testSuccessMsg && (
              <p className="ae-reveal-scale text-center text-[11px] font-semibold text-sage-800 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/60 py-2 px-3 rounded-2xl border border-sage-200 dark:border-sage-800">
                ✓ {testSuccessMsg}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 4. Compromisso Teológico */}
      <section className="ae-reveal-up ae-stagger-6 ae-card surface-warm-sand rounded-3xl p-5 sm:p-6 space-y-2.5 text-xs text-graphite-600 dark:text-graphite-300">
        <h2 className="text-xs font-bold text-graphite-700 dark:text-graphite-200 uppercase tracking-wider flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-sage-700 dark:text-sage-300" />
          <span>Fidelidade Bíblica</span>
        </h2>

        <p className="leading-relaxed">
          O Amanhecer adota como autoridade inerrante a Bíblia Cristã, fundamentada no <strong>cânon protestante de 66 livros</strong>.
        </p>

        <ul className="space-y-1 list-disc list-inside text-graphite-500 dark:text-graphite-400">
          <li>100% gratuito: sem anúncios, planos ou cobranças.</li>
          <li>Sem teologia da prosperidade ou promessas levianas.</li>
          <li>Sem manipulação espiritual ou culpa religiosa.</li>
          <li>Avaliação automatizada com corte mínimo de 90/100.</li>
        </ul>

        <div className="pt-2 border-t border-sand-300/60 dark:border-sand-300/20">
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-sage-800 dark:text-cream-100 underline hover:text-sage-950"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300" />
            <span>Ler Termos de Uso e Política de Privacidade (LGPD)</span>
          </button>
        </div>
      </section>

      <TermsAndPrivacyModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
};
