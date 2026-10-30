import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Bell, ArrowRight, Check, Type } from 'lucide-react';
import { UserPreferences, saveUserPreferences, FontSizePreset, AppTheme } from '../storage/preferences';
import { requestAndSubscribePush } from '../services/notifications/push-client';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  initialPreferences: UserPreferences;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialPreferences,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [theme, setTheme] = useState<AppTheme>(initialPreferences.theme);
  const [fontSizePreset, setFontSizePreset] = useState<FontSizePreset>(initialPreferences.fontSizePreset);
  const [fineFontSize, setFineFontSize] = useState<number>(initialPreferences.fineFontSize);
  const [dailyVerseEnabled, setDailyVerseEnabled] = useState<boolean>(initialPreferences.dailyVerseEnabled);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(initialPreferences.reminderEnabled);
  const [pushRequested, setPushRequested] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    saveUserPreferences({ theme: newTheme });
  };

  const handleFontSizePresetChange = (preset: FontSizePreset) => {
    setFontSizePreset(preset);
    let size = 18;
    if (preset === 'small') size = 16;
    if (preset === 'medium') size = 18;
    if (preset === 'large') size = 22;
    if (preset === 'xlarge') size = 26;
    setFineFontSize(size);
    saveUserPreferences({ fontSizePreset: preset, fineFontSize: size });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setFineFontSize(size);
    saveUserPreferences({ fineFontSize: size });
  };

  const handleActivatePush = async () => {
    setPushRequested(true);
    await requestAndSubscribePush();
    saveUserPreferences({
      notificationsEnabled: true,
      dailyVerseEnabled,
      reminderEnabled,
    });
    setStep(3);
  };

  const handleSkipPush = () => {
    saveUserPreferences({
      notificationsEnabled: false,
      dailyVerseEnabled: false,
      reminderEnabled: false,
    });
    finishOnboarding();
  };

  const finishOnboarding = () => {
    saveUserPreferences({
      onboardingCompleted: true,
      theme,
      fontSizePreset,
      fineFontSize,
      dailyVerseEnabled,
      reminderEnabled,
    });
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-dawn-600 dark:bg-dawn-400'
                    : s < step
                    ? 'w-4 bg-dawn-300 dark:bg-dawn-800'
                    : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Etapa {step} de 3</span>
        </div>

        {/* Step 1: Boas-vindas */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center py-4 space-y-4 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-dawn-700 via-dawn-500 to-gold-400 p-1 shadow-xl shadow-dawn-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-gold-300" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Bem-vindo ao Amanhecer!
              </h1>
              <p className="text-base text-dawn-600 dark:text-dawn-400 font-medium">
                "Um momento com Deus, todos os dias."
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              Seu devocional cristão gratuito, sem cadastro, sem anúncios e com fidelidade inegociável às Escrituras Sagradas.
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Preferências de Leitura */}
        {step === 2 && (
          <div className="flex flex-col py-2 space-y-5 overflow-y-auto pr-1">
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Preferências de Leitura
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ajuste para o seu maior conforto visual
              </p>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tema de visualização
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'light'
                      ? 'border-dawn-500 bg-dawn-50 text-dawn-700 dark:bg-dawn-950/60'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'dark'
                      ? 'border-dawn-500 bg-dawn-950 text-dawn-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-dawn-400" />
                  <span>Escuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('auto')}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'auto'
                      ? 'border-dawn-500 bg-dawn-50 dark:bg-dawn-950/60 text-dawn-700 dark:text-dawn-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Automático</span>
                </button>
              </div>
            </div>

            {/* Font Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                  <Type className="w-3.5 h-3.5" />
                  <span>Tamanho da letra ({fineFontSize}px)</span>
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(['small', 'medium', 'large', 'xlarge'] as FontSizePreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleFontSizePresetChange(preset)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                      fontSizePreset === preset
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

              {/* Fine tuning slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={fineFontSize}
                  onChange={handleSliderChange}
                  className="w-full accent-dawn-600 cursor-pointer"
                  aria-label="Ajuste fino do tamanho da fonte"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>16px</span>
                  <span>24px</span>
                  <span>32px</span>
                </div>
              </div>
            </div>

            {/* Real Text Preview */}
            <div className="bg-slate-50 dark:bg-midnight-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-dawn-600 dark:text-dawn-400 uppercase tracking-wider block mb-1">
                Prévia do Texto Bíblico:
              </span>
              <p
                style={{ fontSize: `${fineFontSize}px`, lineHeight: 1.6 }}
                className="font-serif text-slate-800 dark:text-slate-100 italic"
              >
                "Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento."
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-2 font-sans font-medium">
                — Provérbios 3:5
              </span>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full mt-2 py-3.5 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: Notificações */}
        {step === 3 && (
          <div className="flex flex-col py-2 space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-dawn-100 dark:bg-dawn-950/80 text-dawn-600 dark:text-dawn-400 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Notificações Diárias
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Gostaria de receber um versículo todas as manhãs e lembretes para seu devocional?
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-midnight-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Versículo às 06:06:</strong> Comece o dia inspirado pela Palavra.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Lembretes serenos:</strong> Se você não tiver lido, receberá lembretes às 11:00, 16:00 e 21:00.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Parada automática:</strong> Ao concluir a leitura, os lembretes restantes do dia param imediatamente.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">100% Opcional:</strong> Pode ser desativado a qualquer momento nas configurações.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleActivatePush}
                className="w-full py-3.5 px-6 bg-dawn-600 hover:bg-dawn-700 text-white font-semibold rounded-2xl shadow-lg shadow-dawn-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <Bell className="w-4 h-4" />
                <span>Ativar Notificações</span>
              </button>

              <button
                onClick={handleSkipPush}
                className="w-full py-2.5 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold rounded-2xl transition-all"
              >
                Agora não
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
