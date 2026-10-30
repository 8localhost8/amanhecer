import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Type, Bell, ShieldCheck, Heart, Info, BookOpen, Send } from 'lucide-react';
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
    <div className="space-y-8 pb-28 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Personalize sua experiência devocional, visual e de avisos
        </p>
      </div>

      {/* 1. Aparência e Tema */}
      <section className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Tema de Exibição</span>
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleThemeChange('light')}
            className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 border transition-all ${
              preferences.theme === 'light'
                ? 'border-dawn-500 bg-dawn-50 text-dawn-700 dark:bg-dawn-950 font-bold shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 border transition-all ${
              preferences.theme === 'dark'
                ? 'border-dawn-500 bg-dawn-950 text-dawn-300 font-bold shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-dawn-400" />
            <span>Escuro</span>
          </button>
          <button
            onClick={() => handleThemeChange('auto')}
            className={`py-3 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 border transition-all ${
              preferences.theme === 'auto'
                ? 'border-dawn-500 bg-dawn-50 dark:bg-dawn-950 text-dawn-700 dark:text-dawn-300 font-bold shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5 text-slate-400" />
            <span>Automático</span>
          </button>
        </div>
      </section>

      {/* 2. Tamanho da Fonte para Leitura Acessível */}
      <section className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Type className="w-4 h-4 text-dawn-600 dark:text-dawn-400" />
            <span>Tamanho da Letra</span>
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {preferences.fineFontSize}px
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(['small', 'medium', 'large', 'xlarge'] as FontSizePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleFontSizePresetChange(preset)}
              className={`py-2 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                preferences.fontSizePreset === preset
                  ? 'border-dawn-500 bg-dawn-50 dark:bg-dawn-950 text-dawn-700 dark:text-dawn-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
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
            className="w-full accent-dawn-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>16px (Padrão)</span>
            <span>24px (Grande)</span>
            <span>32px (Muito Acessível)</span>
          </div>
        </div>

        {/* Real-time preview */}
        <div className="bg-slate-50 dark:bg-midnight-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-dawn-600 dark:text-dawn-400 uppercase tracking-wider block mb-1">
            Prévia do texto:
          </span>
          <p
            style={{ fontSize: `${preferences.fineFontSize}px`, lineHeight: 1.6 }}
            className="font-serif italic text-slate-900 dark:text-slate-100"
          >
            "Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento."
          </p>
        </div>
      </section>

      {/* 3. Notificações Web Push */}
      <section className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-4 h-4 text-dawn-600 dark:text-dawn-400" />
            <span>Notificações Diárias</span>
          </h2>

          <button
            onClick={handleTogglePushNotifications}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
              preferences.notificationsEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {preferences.notificationsEnabled ? 'Ativadas' : 'Desativadas'}
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Receba versículo matinal e lembretes serenos sem pressão espiritual.
        </p>

        {preferences.notificationsEnabled && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  ☀️ Versículo do Dia às 06:06
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Enviado pontualmente todas as manhãs
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.dailyVerseEnabled}
                onChange={(e) => handleToggleDailyVerse(e.target.checked)}
                className="w-4 h-4 accent-dawn-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  📖 Lembretes de leitura pendente
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Às 11:00, 16:00 e 21:00 (param imediatamente após a leitura)
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.reminderEnabled}
                onChange={(e) => handleToggleReminders(e.target.checked)}
                className="w-4 h-4 accent-dawn-600 rounded"
              />
            </label>

            <button
              onClick={handleSendTestNotification}
              disabled={isTestingPush}
              className="mt-2 w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Testar Notificação Agora</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. Compromisso Teológico e Bíblico */}
      <section className="bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-dawn-600 dark:text-dawn-400" />
          <span>Fidelidade Bíblica Inegociável</span>
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          O Amanhecer adota como autoridade suprema e inerrante a Bíblia Cristã, fundamentada no <strong>cânon protestante de 66 livros</strong>.
        </p>

        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
          <li>100% gratuito: sem anúncios, planos pagos ou paywalls.</li>
          <li>Sem teologia da prosperidade ou promessas levianas de riqueza material.</li>
          <li>Sem manipulação espiritual ou culpa religiosa.</li>
          <li>Inteligência artificial auditada criticamente com nota de corte 90/100.</li>
        </ul>
      </section>

      {/* 5. Privacidade & Dados */}
      <section className="bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacidade Sem Cadastro</span>
        </div>
        <p className="leading-relaxed">
          Você utiliza o Amanhecer sem informar e-mail, telefone ou senha. Todo o seu histórico de leitura, favoritos e anotações do diário residem exclusivamente no armazenamento do seu próprio navegador/aparelho.
        </p>
      </section>
    </div>
  );
};
