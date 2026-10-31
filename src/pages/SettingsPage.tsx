import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Type, Bell, ShieldCheck, BookOpen, Send, User } from 'lucide-react';
import { UserPreferences, saveUserPreferences, FontSizePreset, AppTheme } from '../storage/preferences';
import { getPushStatus, requestAndSubscribePush, unsubscribePush, PushStatus } from '../services/notifications/push-client';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ preferences, onUpdatePreferences }) => {
  const [pushStatus, setPushStatus] = useState<PushStatus | null>(null);
  const [isTestingPush, setIsTestingPush] = useState(false);

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
    } else {
      const res = await requestAndSubscribePush();
      if (res.success) {
        const updated = saveUserPreferences({ notificationsEnabled: true });
        onUpdatePreferences(updated);
      } else {
        alert(res.error || 'Não foi possível ativar notificações.');
      }
    }
    await checkStatus();
  };

  const handleToggleDailyVerse = (enabled: boolean) => {
    const updated = saveUserPreferences({ dailyVerseEnabled: enabled });
    onUpdatePreferences(updated);
  };

  const handleToggleReminders = (enabled: boolean) => {
    const updated = saveUserPreferences({ reminderEnabled: enabled });
    onUpdatePreferences(updated);
  };

  const handleSendTestNotification = async () => {
    setIsTestingPush(true);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('☀️ Versículo do Dia — Amanhecer', {
        body: 'Provérbios 3:5-6 — Confia no SENHOR de todo o teu coração...',
        icon: '/icons/icon-192x192.png',
      });
      alert('Notificação de teste enviada!');
    } else {
      alert('Ative as notificações primeiro para realizar o teste.');
    }
    setIsTestingPush(false);
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-700 dark:text-graphite-50 tracking-tight">
          Configurações
        </h1>
        <p className="text-xs text-graphite-400 dark:text-graphite-400 mt-0.5">
          Personalize sua experiência de leitura e lembretes diários
        </p>
      </div>

      {/* 0. Nome do Leitor */}
      <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
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
      <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
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
      <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
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
      <section className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
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
              className="mt-2 w-full py-2.5 px-3 bg-sand-100 dark:bg-graphite-700 hover:bg-sand-200 text-graphite-700 dark:text-graphite-200 text-xs font-semibold rounded-full flex items-center justify-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Testar Notificação Agora</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. Compromisso Teológico */}
      <section className="bg-sand-50 dark:bg-graphite-850 border border-sand-200 dark:border-graphite-700 rounded-3xl p-5 sm:p-6 space-y-2.5 text-xs text-graphite-600 dark:text-graphite-300 shadow-xs">
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
      </section>
    </div>
  );
};
