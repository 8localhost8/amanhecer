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
  const [dailyVerseEnabled] = useState<boolean>(initialPreferences.dailyVerseEnabled);
  const [reminderEnabled] = useState<boolean>(initialPreferences.reminderEnabled);

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
    await requestAndSubscribePush();
    saveUserPreferences({
      notificationsEnabled: true,
      dailyVerseEnabled,
      reminderEnabled,
    });
    finishOnboarding();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-graphite-800 border border-sand-200 dark:border-graphite-700 rounded-3xl max-w-sm w-full p-6 shadow-xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all ${
                  s === step
                    ? 'w-7 bg-sage-800 dark:bg-sage-400'
                    : s < step
                    ? 'w-3.5 bg-sage-300 dark:bg-sage-700'
                    : 'w-3.5 bg-sand-200 dark:bg-graphite-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-graphite-400">Etapa {step} de 3</span>
        </div>

        {/* Step 1: Boas-vindas */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center py-3 space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-sand-100 dark:bg-graphite-700 text-sage-800 dark:text-sage-300 flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold font-serif text-graphite-700 dark:text-graphite-50">
                Bem-vindo ao Amanhecer
              </h1>
              <p className="text-xs text-sage-700 dark:text-sage-300 font-serif italic">
                "Um momento com Deus, todos os dias."
              </p>
            </div>

            <p className="text-xs text-graphite-500 dark:text-graphite-400 leading-relaxed max-w-xs">
              Devocionais diários com fidelidade bíblica, leitura serena e sem necessidade de cadastro ou senhas.
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-2 py-3.5 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs transition-all active:scale-95"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Preferências de Leitura */}
        {step === 2 && (
          <div className="flex flex-col py-1 space-y-4 overflow-y-auto">
            <div className="text-left">
              <h2 className="text-xl font-bold font-serif text-graphite-700 dark:text-graphite-50">
                Preferências de Leitura
              </h2>
              <p className="text-[11px] text-graphite-400 mt-0.5">
                Ajuste para o seu maior conforto visual
              </p>
            </div>

            {/* Tema */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300">
                Tema de visualização
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'light'
                      ? 'border-sage-600 bg-sage-50 text-sage-900 dark:bg-sage-900/60 font-bold'
                      : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'dark'
                      ? 'border-sage-500 bg-graphite-850 text-sage-200 font-bold'
                      : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-sage-300" />
                  <span>Escuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('auto')}
                  className={`py-2 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                    theme === 'auto'
                      ? 'border-sage-600 bg-sage-50 dark:bg-graphite-850 text-sage-900 dark:text-sage-200 font-bold'
                      : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-graphite-400" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Tamanho da Fonte */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-graphite-600 dark:text-graphite-300 flex items-center space-x-1">
                <Type className="w-3.5 h-3.5" />
                <span>Tamanho da letra ({fineFontSize}px)</span>
              </label>

              <div className="grid grid-cols-4 gap-1">
                {(['small', 'medium', 'large', 'xlarge'] as FontSizePreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleFontSizePresetChange(preset)}
                    className={`py-1.5 px-1 rounded-full text-[11px] font-medium border text-center transition-all ${
                      fontSizePreset === preset
                        ? 'border-sage-600 bg-sage-100 text-sage-900 dark:bg-sage-900/60 font-bold'
                        : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                    }`}
                  >
                    {preset === 'small' && 'Pequena'}
                    {preset === 'medium' && 'Média'}
                    {preset === 'large' && 'Grande'}
                    {preset === 'xlarge' && 'Muito'}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={fineFontSize}
                  onChange={handleSliderChange}
                  className="w-full accent-sage-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Prévia */}
            <div className="bg-cream-50 dark:bg-graphite-900 p-3.5 rounded-2xl border border-sand-200/80 dark:border-graphite-700">
              <p
                style={{ fontSize: `${fineFontSize}px`, lineHeight: 1.6 }}
                className="font-serif text-graphite-700 dark:text-graphite-100 italic"
              >
                "Confia no SENHOR de todo o teu coração..."
              </p>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs transition-all active:scale-95"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Notificações */}
        {step === 3 && (
          <div className="flex flex-col py-1 space-y-3.5 my-auto">
            <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center mx-auto shadow-xs">
              <Bell className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-serif text-graphite-700 dark:text-graphite-50">
                Notificações Diárias
              </h2>
              <p className="text-xs text-graphite-500 dark:text-graphite-400">
                Deseja receber o versículo matinal e lembretes discretos?
              </p>
            </div>

            <div className="bg-sand-50 dark:bg-graphite-900 p-3.5 rounded-2xl border border-sand-200/60 dark:border-graphite-700 text-xs text-graphite-600 dark:text-graphite-300 space-y-2">
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-sage-700 flex-shrink-0 mt-0.5" />
                <p><strong>06:06 da manhã:</strong> Versículo do Dia no seu aparelho.</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-sage-700 flex-shrink-0 mt-0.5" />
                <p><strong>Parada automática:</strong> Lembretes cessam imediatamente ao concluir a leitura.</p>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-sage-700 flex-shrink-0 mt-0.5" />
                <p><strong>Opcional:</strong> Desative a qualquer momento nos ajustes.</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleActivatePush}
                className="w-full py-3.5 px-6 bg-sage-800 hover:bg-sage-900 text-cream-50 font-semibold rounded-full shadow-xs flex items-center justify-center space-x-2 text-xs transition-all active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>Ativar Notificações</span>
              </button>

              <button
                onClick={handleSkipPush}
                className="w-full py-2 px-4 text-graphite-400 hover:text-graphite-700 dark:hover:text-graphite-200 text-xs font-semibold rounded-full transition-all"
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
