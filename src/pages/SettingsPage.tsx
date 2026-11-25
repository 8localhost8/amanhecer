import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Mail,
  Zap,
  Check,
  Maximize2,
  X,
  RotateCcw,
  Clock,
  Play,
  Share2,
} from 'lucide-react';
import {
  UserPreferences,
  saveUserPreferences,
  FontSizePreset,
  AppTheme,
} from '../storage/preferences';
import { TermsAndPrivacyModal } from '../components/TermsAndPrivacyModal';
import { ExtremeTestModal } from '../components/ExtremeTestModal';
import { DonationCard } from '../components/DonationCard';
import {
  getPushStatus,
  requestAndSubscribePush,
  requestOSNotificationPermission,
  unsubscribePush,
  sendTestNotification,
  syncNotificationScheduleWithSW,
  PushStatus,
} from '../services/notifications/push-client';
import { trackEvent } from '../services/analytics/analytics-client';
import {
  getConsentRecord,
  grantAnalyticsConsent,
  revokeAnalyticsConsent,
  requestAnalyticsDataDeletion,
  onConsentChange,
  CURRENT_POLICY_VERSION,
} from '../services/consent/consent-manager';
import {
  WALLPAPER_CATALOG,
  compressGalleryImageToDataUrl,
  getCustomWallpaperDataUrl,
  loadCustomWallpaperHighRes,
  saveCustomWallpaperDataUrl,
  resolveActiveWallpaperUrl,
} from '../content/wallpapers/catalog';
import {
  AnimatedBellIcon,
  AnimatedBookOpenIcon,
  AnimatedBookmarkDiaryIcon,
  AnimatedCheckCircleIcon,
  AnimatedClockHistoryIcon,
  AnimatedHeartIcon,
  AnimatedImageWallpaperIcon,
  AnimatedMoonIcon,
  AnimatedSendIcon,
  AnimatedSettingsIcon,
  AnimatedShieldCheckIcon,
  AnimatedSunIcon,
  AnimatedTypeIcon,
  AnimatedUploadGalleryIcon,
  AnimatedUserIcon,
} from '../components/AnimatedIcons';

export type SettingsSectionId =
  | 'menu'
  | 'profile'
  | 'wallpaper'
  | 'theme'
  | 'typography'
  | 'notifications'
  | 'privacy'
  | 'donation'
  | 'theology';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
  onNavigateLegal?: (
    path: '/termos-de-uso' | '/politica-de-privacidade' | '/politica-de-cookies'
  ) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onNavigateLegal,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('menu');
  const [, setPushStatus] = useState<PushStatus | null>(null);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [browserNotifBlocked, setBrowserNotifBlocked] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isExtremeTestOpen, setIsExtremeTestOpen] = useState(false);

  const [consentRecord, setConsentRecord] = useState(() => getConsentRecord());
  const [privacyNotice, setPrivacyNotice] = useState<string | null>(null);
  const [isDeletingAnalytics, setIsDeletingAnalytics] = useState(false);

  // Wallpaper state
  const [customGalleryUrl, setCustomGalleryUrl] = useState<string | null>(() =>
    getCustomWallpaperDataUrl()
  );
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [wallpaperNotice, setWallpaperNotice] = useState<string | null>(null);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    checkStatus();
    loadCustomWallpaperHighRes().then((url) => {
      if (url) setCustomGalleryUrl(url);
    });
    const unsub = onConsentChange((rec) => setConsentRecord(rec));
    return unsub;
  }, []);

  const checkStatus = async () => {
    const status = await getPushStatus();
    setPushStatus(status);
  };

  const openSection = (section: SettingsSectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThemeChange = (theme: AppTheme) => {
    const updated = saveUserPreferences({ theme });
    onUpdatePreferences(updated);
    trackEvent('settings_changed', { setting: 'theme', value: theme });
  };

  const handleFontSizePresetChange = (preset: FontSizePreset) => {
    let size = 18;
    if (preset === 'small') size = 16;
    if (preset === 'medium') size = 18;
    if (preset === 'large') size = 22;
    if (preset === 'xlarge') size = 26;
    const updated = saveUserPreferences({ fontSizePreset: preset, fineFontSize: size });
    onUpdatePreferences(updated);
    trackEvent('settings_changed', { setting: 'font_size', value: `${size}px` });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    const updated = saveUserPreferences({ fineFontSize: size });
    onUpdatePreferences(updated);
    trackEvent('settings_changed', { setting: 'font_size', value: `${size}px` });
  };

  const handleSelectWallpaper = (wallpaperId: string) => {
    const currentOpacity =
      typeof preferences.wallpaperOpacity === 'number' ? preferences.wallpaperOpacity : 55;
    const updated = saveUserPreferences({
      wallpaperId,
      wallpaperOpacity: currentOpacity,
    });
    onUpdatePreferences(updated);
    trackEvent('settings_changed', { setting: 'wallpaper', value: wallpaperId });
  };

  const handleWallpaperOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
    const updated = saveUserPreferences({ wallpaperOpacity: opacity });
    onUpdatePreferences(updated);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingGallery(true);
    setWallpaperNotice(null);

    try {
      const compressedDataUrl = await compressGalleryImageToDataUrl(file);
      const saved = await saveCustomWallpaperDataUrl(compressedDataUrl);
      if (saved) {
        setCustomGalleryUrl(compressedDataUrl);
        const currentOpacity =
          typeof preferences.wallpaperOpacity === 'number' ? preferences.wallpaperOpacity : 55;
        const updated = saveUserPreferences({
          wallpaperId: 'custom',
          wallpaperOpacity: currentOpacity,
        });
        onUpdatePreferences(updated);
        setWallpaperNotice('Foto da galeria aplicada e salva com segurança no aparelho!');
        trackEvent('settings_changed', { setting: 'wallpaper', value: 'custom_gallery' });
        setTimeout(() => setWallpaperNotice(null), 4500);
      } else {
        setWallpaperNotice('Não foi possível salvar a imagem (espaço insuficiente no navegador).');
      }
    } catch {
      setWallpaperNotice('Não foi possível carregar esta imagem. Tente outra foto da galeria.');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleTogglePushNotifications = async () => {
    if (preferences.notificationsEnabled) {
      await unsubscribePush();
      const updated = saveUserPreferences({ notificationsEnabled: false });
      onUpdatePreferences(updated);
      setBrowserNotifBlocked(false);
      trackEvent('notification_disabled', { source: 'settings' });
    } else {
      const permPromise = requestOSNotificationPermission();
      const perm = await permPromise;
      const res = await requestAndSubscribePush(undefined, true, perm);
      if (res.success && res.permission === 'granted') {
        const updated = saveUserPreferences({ notificationsEnabled: true });
        onUpdatePreferences(updated);
        setBrowserNotifBlocked(false);
        trackEvent('notification_permission_granted', {
          source: 'settings',
          mode: res.mode || 'web-push',
        });
        trackEvent('notification_scheduled', {
          daily_verse: updated.dailyVerseEnabled,
          reminders: updated.reminderEnabled,
          mode: res.mode || 'web-push',
        });
        setTestSuccessMsg('Notificações ativadas! Enviamos um aviso na barra do seu celular.');
        setTimeout(() => setTestSuccessMsg(null), 5000);
      } else {
        setBrowserNotifBlocked(true);
        trackEvent('notification_permission_denied', { source: 'settings' });
      }
    }
    await checkStatus();
  };

  const handleToggleDailyVerse = (enabled: boolean) => {
    const updated = saveUserPreferences({ dailyVerseEnabled: enabled });
    onUpdatePreferences(updated);
    syncNotificationScheduleWithSW();
    trackEvent('notification_scheduled', {
      daily_verse: enabled,
      reminders: updated.reminderEnabled,
    });
  };

  const handleToggleReminders = (enabled: boolean) => {
    const updated = saveUserPreferences({ reminderEnabled: enabled });
    onUpdatePreferences(updated);
    syncNotificationScheduleWithSW();
    trackEvent('notification_scheduled', {
      daily_verse: updated.dailyVerseEnabled,
      reminders: enabled,
    });
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

  // Wallpaper helpers
  const activeWallpaperId = preferences.wallpaperId || 'none';
  const activeWallpaperOpacity =
    typeof preferences.wallpaperOpacity === 'number' ? preferences.wallpaperOpacity : 55;
  const activeWallpaperUrl = resolveActiveWallpaperUrl(activeWallpaperId, customGalleryUrl);
  const activeWallpaperTitle =
    activeWallpaperId === 'none'
      ? 'Padrão do App (Sem imagem)'
      : activeWallpaperId === 'custom'
      ? `Foto da Galeria • ${activeWallpaperOpacity}%`
      : `${
          WALLPAPER_CATALOG.find((w) => w.id === activeWallpaperId)?.title || 'Fundo 1'
        } • ${activeWallpaperOpacity}%`;

  const themeLabel =
    preferences.theme === 'dark'
      ? 'Modo Escuro'
      : preferences.theme === 'light'
      ? 'Modo Claro'
      : 'Automático';

  const renderSectionBackHeader = (title: string, subtitle: string) => (
    <div className="space-y-3 ae-reveal-up">
      <button
        type="button"
        onClick={() => openSection('menu')}
        className="ae-btn inline-flex items-center space-x-2 py-2 px-3.5 rounded-full surface-editorial text-xs font-bold text-graphite-700 dark:text-cream-100 hover:text-sage-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-sage-700 dark:text-sand-300" />
        <span>Voltar para Configurações</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50 tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-graphite-500 dark:text-sand-300 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  /**
   * Renderiza a Prévia em Tempo Real com A INTERFACE REAL DO APP sobre o Wallpaper escolhido.
   */
  const renderRealAppWallpaperPreview = (isExpanded = false) => {
    const previewHasWallpaper = Boolean(activeWallpaperUrl && activeWallpaperId !== 'none');

    return (
      <div
        className={`relative overflow-hidden rounded-[32px] border-2 border-sand-300/70 dark:border-graphite-700 shadow-2xl select-none transition-all ${
          isExpanded ? 'w-full max-w-[360px] mx-auto h-[640px]' : 'w-full h-[370px]'
        } ${previewHasWallpaper ? 'bg-black' : 'bg-cream-100 dark:bg-graphite-950'}`}
      >
        {/* Camada do Wallpaper (0% = preto total, 100% = imagem sólida) */}
        {previewHasWallpaper && activeWallpaperUrl && (
          <img
            src={activeWallpaperUrl}
            alt="Prévia do Papel de Parede"
            style={{ opacity: activeWallpaperOpacity / 100 }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
          />
        )}

        {/* Interface Real do Amanhecer dentro do Preview */}
        <div className="relative z-10 flex flex-col justify-between h-full text-graphite-800 dark:text-cream-50">
          {/* 1. Navbar Real */}
          <div className="px-3.5 py-2.5 bg-cream-100/80 dark:bg-graphite-950/80 backdrop-blur-md border-b border-sand-200/60 dark:border-graphite-800/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl overflow-hidden ring-1 ring-sand-300/80 dark:ring-graphite-700 shrink-0">
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
              <div>
                <span className="text-sm font-bold font-serif block leading-none text-graphite-800 dark:text-cream-50">
                  Amanhecer
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-widest text-sage-700 dark:text-sand-300 block">
                  Devocional Diário
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <div className="surface-editorial p-1.5 rounded-full">
                <AnimatedShieldCheckIcon className="w-3 h-3 text-sage-700 dark:text-sand-300" />
              </div>
              <div className="surface-editorial p-1.5 rounded-full">
                <AnimatedMoonIcon className="w-3 h-3 text-sand-300" />
              </div>
            </div>
          </div>

          {/* 2. Conteúdo Real da Home (Saudação + Card Devocional + Versículo do Dia) */}
          <div className="flex-1 px-3.5 py-2.5 space-y-2.5 overflow-hidden">
            {/* Saudação */}
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full surface-editorial text-[9px] font-semibold text-graphite-700 dark:text-cream-100">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-sand-300" />
                  <span> Prévia ao Vivo</span>
                </span>
                <h4
                  className={`font-bold font-serif tracking-tight mt-1 ${
                    previewHasWallpaper
                      ? 'text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]'
                      : 'text-graphite-800 dark:text-cream-50'
                  } ${isExpanded ? 'text-lg' : 'text-sm'}`}
                >
                  {preferences.userName?.trim()
                    ? `Graça e paz, ${preferences.userName.trim()}!`
                    : 'Graça e paz!'}
                </h4>
              </div>

              {!isExpanded && (
                <button
                  type="button"
                  onClick={() => setIsFullPreviewOpen(true)}
                  className="ae-btn inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/55 hover:bg-black/75 text-white border border-white/25 text-[10px] font-semibold backdrop-blur-md cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expandir</span>
                </button>
              )}
            </div>

            {/* Hero Card Devocional de Hoje */}
            <div className="surface-hero-sage text-cream-50 rounded-2xl p-3.5 relative overflow-hidden space-y-1.5 shadow-md">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[8px] font-semibold uppercase tracking-wider text-sand-200">
                <Sparkles className="w-2.5 h-2.5 text-sand-300" />
                <span>Devocional de Hoje</span>
                <span>•</span>
                <Clock className="w-2.5 h-2.5" />
                <span>5 min</span>
              </div>
              <h5 className={`font-bold font-serif text-white leading-snug ${isExpanded ? 'text-base' : 'text-xs'}`}>
                Quando Passares pelas Águas, Estarei Contigo
              </h5>
              <p className="text-[9px] text-sand-200">
                Isaías 43:1-3 • Presença Soberana e Proteção Divina
              </p>
              <div className="pt-1 flex items-center space-x-2">
                <span className="py-1.5 px-3.5 btn-tactile-cream font-bold rounded-full text-[9px] inline-flex items-center space-x-1">
                  <Play className="w-2.5 h-2.5 fill-current text-sage-800" />
                  <span>Começar Leitura</span>
                </span>
              </div>
            </div>

            {/* Card Versículo do Dia */}
            <div className="surface-editorial rounded-2xl p-3 relative overflow-hidden space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-widest text-sage-800 dark:text-sand-300">
                  Versículo do Dia
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cream-100/80 dark:bg-cream-100/10 border border-sand-200/80 dark:border-sand-300/35 text-[8px] font-semibold">
                  <Share2 className="w-2 h-2" />
                  <span>Compartilhar</span>
                </span>
              </div>
              <p className={`font-serif italic text-graphite-800 dark:text-cream-50 leading-snug ${isExpanded ? 'text-xs' : 'text-[10px] line-clamp-2'}`}>
                "O SENHOR é a minha luz e a minha salvação; de quem terei medo?"
              </p>
              <div className="text-[9px] font-bold text-graphite-700 dark:text-cream-100">
                — Salmos 27:1
              </div>
            </div>
          </div>

          {/* 3. Barra Inferior Real no Preview (Apple Liquid Glass) */}
          <div className="px-3 pb-2.5 pt-1">
            <div className="apple-liquid-glass-bar backdrop-blur-md rounded-full px-2 py-1 flex items-center justify-around relative">
              <div className="relative px-2.5 py-1 rounded-full apple-liquid-droplet-lens flex flex-col items-center text-graphite-900 dark:text-white">
                <AnimatedBookOpenIcon className="w-3.5 h-3.5" active={true} />
                <span className="text-[8px] font-bold mt-0.5">Hoje</span>
              </div>
              <div className="flex flex-col items-center text-graphite-700/80 dark:text-white/75">
                <AnimatedClockHistoryIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] mt-0.5">Histórico</span>
              </div>
              <div className="flex flex-col items-center text-graphite-700/80 dark:text-white/75">
                <AnimatedHeartIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] mt-0.5">Favoritos</span>
              </div>
              <div className="flex flex-col items-center text-graphite-700/80 dark:text-white/75">
                <AnimatedBookmarkDiaryIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] mt-0.5">Diário</span>
              </div>
              <div className="flex flex-col items-center text-graphite-700/80 dark:text-white/75">
                <AnimatedSettingsIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] mt-0.5">Ajustes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl mx-auto">
      {/* =====================================================================
          MENU PRINCIPAL DE CONFIGURAÇÕES (ESTILO CONFIGURAÇÕES DO CELULAR)
         ===================================================================== */}
      {activeSection === 'menu' && (
        <div className="space-y-6 ae-reveal-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-graphite-800 dark:text-cream-50 tracking-tight">
              Configurações
            </h1>
            <p className="text-xs text-graphite-500 dark:text-sand-300 mt-0.5">
              Escolha uma seção para personalizar seu aplicativo
            </p>
          </div>

          {/* 1. Card de Perfil (Estilo Topo de Ajustes do Celular) */}
          <button
            type="button"
            onClick={() => openSection('profile')}
            className="w-full surface-editorial rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3.5 text-left ae-card group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl btn-tactile-sage flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <AnimatedUserIcon active={true} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold font-serif text-graphite-800 dark:text-cream-50 truncate">
                  {preferences.userName?.trim()
                    ? preferences.userName.trim()
                    : 'Como podemos te chamar?'}
                </h2>
                <p className="text-xs text-graphite-500 dark:text-sand-300/90 truncate mt-0.5">
                  {preferences.userName?.trim()
                    ? 'Toque para alterar seu nome ou apelido'
                    : 'Toque para personalizar a saudação diária'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* 2. Grupo: Aparência, Wallpaper e Leitura */}
          <div className="space-y-2">
            <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-graphite-500 dark:text-sand-300">
              Aparência e Leitura
            </h3>

            <div className="surface-editorial rounded-3xl overflow-hidden divide-y divide-sand-200/70 dark:divide-graphite-800">
              {/* Papel de Parede (Wallpaper) */}
              <button
                type="button"
                onClick={() => openSection('wallpaper')}
                data-testid="open-wallpaper-settings-btn"
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-700 to-sage-900 dark:from-sand-200 dark:to-sand-300 text-cream-50 dark:text-sage-950 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <AnimatedImageWallpaperIcon active={true} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-graphite-800 dark:text-cream-50">
                        Papel de Parede
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sand-300/20 text-sage-800 dark:text-sand-200 text-[9px] font-bold uppercase tracking-wider">
                        Novo
                      </span>
                    </div>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      {activeWallpaperTitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Tema de Exibição */}
              <button
                type="button"
                onClick={() => openSection('theme')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-sand-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {preferences.theme === 'dark' ? (
                      <AnimatedMoonIcon className="w-5 h-5" />
                    ) : (
                      <AnimatedSunIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Tema de Exibição
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      {themeLabel}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Tamanho da Letra */}
              <button
                type="button"
                onClick={() => openSection('typography')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-sage-600/15 dark:bg-sage-400/15 text-sage-800 dark:text-sage-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AnimatedTypeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Tamanho da Letra
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      Fonte de leitura em {preferences.fineFontSize}px
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* 3. Grupo: Notificações e Privacidade */}
          <div className="space-y-2">
            <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-graphite-500 dark:text-sand-300">
              Lembretes e Privacidade
            </h3>

            <div className="surface-editorial rounded-3xl overflow-hidden divide-y divide-sand-200/70 dark:divide-graphite-800">
              {/* Notificações Diárias */}
              <button
                type="button"
                onClick={() => openSection('notifications')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-sage-700/15 dark:bg-sand-300/15 text-sage-800 dark:text-sand-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AnimatedBellIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Notificações Diárias
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      {preferences.notificationsEnabled
                        ? 'Ativadas (06:06 e lembretes)'
                        : 'Desativadas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      preferences.notificationsEnabled
                        ? 'bg-sage-800 text-cream-50 dark:bg-sand-300 dark:text-sage-950'
                        : 'bg-sand-200 dark:bg-graphite-700 text-graphite-600 dark:text-graphite-300'
                    }`}
                  >
                    {preferences.notificationsEnabled ? 'Ativas' : 'Inativas'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Privacidade e Dados (LGPD) */}
              <button
                type="button"
                onClick={() => openSection('privacy')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AnimatedShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Privacidade e Dados (LGPD)
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      {consentRecord.analyticsAllowed
                        ? 'Estatísticas anônimas autorizadas'
                        : 'Coleta opcional desativada'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* 4. Grupo: Sobre e Apoio */}
          <div className="space-y-2">
            <h3 className="px-2 text-[11px] font-bold uppercase tracking-widest text-graphite-500 dark:text-sand-300">
              Projeto Amanhecer
            </h3>

            <div className="surface-editorial rounded-3xl overflow-hidden divide-y divide-sand-200/70 dark:divide-graphite-800">
              {/* Apoie o Projeto */}
              <button
                type="button"
                onClick={() => openSection('donation')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AnimatedHeartIcon filled={true} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Apoie o Projeto Amanhecer
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      100% gratuito e sem anúncios • Chave Pix
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Fidelidade Bíblica e Termos */}
              <button
                type="button"
                onClick={() => openSection('theology')}
                className="w-full p-4 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-sand-100/50 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-sand-300/35 dark:bg-sand-300/15 text-sage-900 dark:text-sand-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AnimatedBookOpenIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-graphite-800 dark:text-cream-50 block">
                      Fidelidade Bíblica e Termos
                    </span>
                    <p className="text-xs text-graphite-500 dark:text-sand-300/85 truncate mt-0.5">
                      Cânon protestante de 66 livros e compromissos
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-graphite-400 dark:text-sand-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 1: PERFIL DO LEITOR
         ===================================================================== */}
      {activeSection === 'profile' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Como podemos te chamar',
            'Personalize a saudação exibida na tela inicial e nas celebrações de leitura'
          )}

          <section className="surface-editorial rounded-3xl p-5 sm:p-6 space-y-4">
            <label className="text-xs font-bold text-graphite-500 dark:text-sand-300 uppercase tracking-wider flex items-center space-x-2">
              <AnimatedUserIcon active={true} className="w-4 h-4 text-sage-700 dark:text-sand-300" />
              <span>Seu Nome ou Apelido</span>
            </label>

            <input
              type="text"
              value={preferences.userName || ''}
              onChange={(e) => {
                const updated = saveUserPreferences({ userName: e.target.value });
                onUpdatePreferences(updated);
              }}
              placeholder="Digite seu nome ou apelido"
              maxLength={30}
              className="w-full px-4 py-3 rounded-2xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 text-sm text-graphite-800 dark:text-graphite-100 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-sage-600 transition-all"
            />

            <p className="text-xs text-graphite-500 dark:text-graphite-400 leading-relaxed">
              Seu nome é salvo com privacidade unicamente no seu dispositivo e mantido mesmo quando o aplicativo é atualizado.
            </p>
          </section>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 2: PAPEL DE PAREDE (WALLPAPER + PREVIEW REAL + OPACIDADE + GALERIA)
         ===================================================================== */}
      {activeSection === 'wallpaper' && (
        <div className="space-y-5 ae-reveal-up" data-testid="wallpaper-settings-section">
          {renderSectionBackHeader(
            'Papel de Parede',
            'Escolha uma paisagem inspiradora ou envie da sua galeria com ajuste de opacidade'
          )}

          {/* 1. Preview ao Vivo da Interface Real do App */}
          <section className="surface-editorial rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AnimatedImageWallpaperIcon
                  active={true}
                  className="w-4 h-4 text-sage-700 dark:text-sand-300"
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-cream-100">
                  Prévia da Interface Real
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-sage-800 dark:text-sand-300">
                {activeWallpaperTitle}
              </span>
            </div>

            {renderRealAppWallpaperPreview(false)}

            {/* Controle Único de Opacidade (0% = Preto Total | 100% = Imagem Sólida) */}
            <div className="p-4 rounded-2xl bg-sand-50/90 dark:bg-graphite-900/90 border border-sand-200 dark:border-graphite-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-graphite-700 dark:text-cream-100">
                  Opacidade do Papel de Parede
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sage-800 text-cream-50 dark:bg-sand-300 dark:text-sage-950 text-xs font-bold tabular-nums">
                  {activeWallpaperOpacity}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={activeWallpaperOpacity}
                onChange={handleWallpaperOpacityChange}
                data-testid="wallpaper-opacity-slider"
                className="w-full accent-sage-700 dark:accent-sand-300 cursor-pointer h-2 rounded-lg"
              />

              <div className="flex items-center justify-between text-[10px] font-medium text-graphite-500 dark:text-sand-300/80">
                <span>0% = Preto total</span>
                <span>50% = Equilibrado</span>
                <span>100% = Imagem sólida</span>
              </div>
            </div>

            {/* Botões de Ação: Subir da Galeria + Restaurar Padrão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingGallery}
                className="ae-btn py-3 px-4 rounded-2xl btn-tactile-sage text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <AnimatedUploadGalleryIcon active={true} className="w-4 h-4" />
                <span>
                  {isUploadingGallery ? 'Processando foto...' : 'Subir Imagem da Galeria'}
                </span>
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => handleSelectWallpaper('none')}
                disabled={activeWallpaperId === 'none'}
                className="ae-btn py-3 px-4 rounded-2xl border border-sand-300 dark:border-graphite-700 bg-white/80 dark:bg-graphite-800 text-graphite-700 dark:text-cream-100 text-xs font-semibold flex items-center justify-center space-x-2 disabled:opacity-45 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Usar Fundo Padrão do App</span>
              </button>
            </div>

            {wallpaperNotice && (
              <div className="ae-reveal-scale p-3 rounded-2xl bg-sage-50 dark:bg-sage-950/70 border border-sage-200 dark:border-sage-800 text-xs font-semibold text-sage-900 dark:text-sand-200 text-center">
                ✓ {wallpaperNotice}
              </div>
            )}
          </section>

          {/* 2. Coleção de 70 Wallpapers Originais em Full HD Vertical (1080x1920) */}
          <section className="surface-editorial rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold font-serif text-graphite-800 dark:text-cream-50">
                  Coleção de Fundos ({WALLPAPER_CATALOG.length})
                </h3>
                <p className="text-[11px] text-graphite-500 dark:text-sand-300/85">
                  Imagens em proporção vertical Full HD (1080×1920) sem cortes nem perda de nitidez.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sage-100 dark:bg-graphite-800 text-sage-800 dark:text-sand-200 text-[10px] font-bold shrink-0">
                1080×1920 HD
              </span>
            </div>

            {/* Card especial caso o usuário tenha enviado foto da galeria */}
            {customGalleryUrl && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectWallpaper('custom')}
                  className={`w-full p-2.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    activeWallpaperId === 'custom'
                      ? 'border-sage-600 dark:border-sand-300 bg-sage-50/70 dark:bg-graphite-800'
                      : 'border-sand-200 dark:border-graphite-700 bg-sand-50/50 dark:bg-graphite-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={customGalleryUrl}
                      alt="Minha foto da galeria"
                      className="w-12 h-16 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                    <div className="text-left">
                      <span className="text-xs font-bold text-graphite-800 dark:text-cream-50 block">
                        Minha Foto da Galeria
                      </span>
                      <span className="text-[11px] text-graphite-500 dark:text-sand-300">
                        Salva em qualidade original neste dispositivo
                      </span>
                    </div>
                  </div>
                  {activeWallpaperId === 'custom' && (
                    <span className="w-7 h-7 rounded-full btn-tactile-sage flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Grid de Miniaturas em Aspecto 9:16 Vertical Nativo (1080x1920) sem sobreposição escura */}
            <div className="grid grid-cols-3 gap-2.5">
              {WALLPAPER_CATALOG.map((item) => {
                const isSelected = activeWallpaperId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectWallpaper(item.id)}
                    className={`group relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-graphite-900 ${
                      isSelected
                        ? 'border-sage-700 dark:border-sand-300 ring-2 ring-sage-600/45 dark:ring-sand-300/45 scale-[1.01]'
                        : 'border-sand-200/40 dark:border-graphite-700/60 hover:border-sand-300'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-xs text-[10px] font-semibold text-white/95">
                      #{item.number}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full btn-tactile-sage flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Modal de Prévia em Tela Cheia */}
          {isFullPreviewOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-[360px] flex items-center justify-between mb-3 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-sand-200">
                  Prévia Real • Opacidade {activeWallpaperOpacity}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullPreviewOpen(false)}
                  className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderRealAppWallpaperPreview(true)}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 3: TEMA DE EXIBIÇÃO
         ===================================================================== */}
      {activeSection === 'theme' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Tema de Exibição',
            'Escolha entre o modo claro editorial, modo escuro noturno ou automático'
          )}

          <section className="surface-editorial rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-2 border transition-all cursor-pointer ${
                  preferences.theme === 'light'
                    ? 'border-sage-600 bg-sage-50 text-sage-900 dark:bg-sage-900/60 dark:text-cream-50 font-bold shadow-xs'
                    : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                }`}
              >
                <AnimatedSunIcon active={preferences.theme === 'light'} className="w-5 h-5 text-amber-600" />
                <span>Claro</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-2 border transition-all cursor-pointer ${
                  preferences.theme === 'dark'
                    ? 'border-sage-500 bg-graphite-850 text-sage-200 font-bold shadow-xs'
                    : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                }`}
              >
                <AnimatedMoonIcon active={preferences.theme === 'dark'} className="w-5 h-5 text-sand-300" />
                <span>Escuro</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('auto')}
                className={`py-4 px-3 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center space-y-2 border transition-all cursor-pointer ${
                  preferences.theme === 'auto'
                    ? 'border-sage-600 bg-sage-50 dark:bg-graphite-850 text-sage-900 dark:text-sage-200 font-bold shadow-xs'
                    : 'border-sand-200 dark:border-graphite-700 text-graphite-500'
                }`}
              >
                <Sparkles className="w-5 h-5 text-graphite-400" />
                <span>Automático</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 4: TAMANHO DA LETRA
         ===================================================================== */}
      {activeSection === 'typography' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Tamanho da Letra',
            'Ajuste o conforto visual para a leitura dos devocionais'
          )}

          <section className="surface-editorial rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-graphite-500 dark:text-sand-300 uppercase tracking-wider flex items-center space-x-2">
                <AnimatedTypeIcon active={true} className="w-4 h-4 text-sage-700 dark:text-sand-300" />
                <span>Escala de Leitura</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sand-100 dark:bg-graphite-700 text-graphite-700 dark:text-cream-100">
                {preferences.fineFontSize}px
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['small', 'medium', 'large', 'xlarge'] as FontSizePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleFontSizePresetChange(preset)}
                  className={`py-2.5 px-1 rounded-full text-xs font-semibold border text-center transition-all cursor-pointer ${
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
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 5: NOTIFICAÇÕES DIÁRIAS
         ===================================================================== */}
      {activeSection === 'notifications' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Notificações Diárias',
            'Versículo matinal às 06:06 e lembretes inteligentes de leitura'
          )}

          <section className="surface-editorial rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-graphite-500 dark:text-sand-300 uppercase tracking-wider flex items-center space-x-2">
                <AnimatedBellIcon active={preferences.notificationsEnabled} className="w-4 h-4 text-sage-700 dark:text-sand-300" />
                <span>Status dos Alertas</span>
              </h2>

              <button
                type="button"
                onClick={handleTogglePushNotifications}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  preferences.notificationsEnabled
                    ? 'bg-sage-800 text-cream-50 dark:bg-sand-300 dark:text-sage-950'
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
                      Versículo do Dia às 06:06
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
                      Lembretes de leitura pendente
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
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={isTestingPush}
                  className="ae-btn mt-2 w-full py-2.5 px-3 bg-sand-100 dark:bg-graphite-700 hover:bg-sand-200 text-graphite-700 dark:text-graphite-200 text-xs font-semibold rounded-full flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <AnimatedSendIcon className="w-3.5 h-3.5" />
                  <span>{isTestingPush ? 'Enviando...' : 'Testar Notificação Agora'}</span>
                </button>

                <button
                  onClick={() => setIsExtremeTestOpen(true)}
                  type="button"
                  className="ae-btn mt-2 w-full py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/40 text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>Testar Notificação Extreme (Temporário)</span>
                </button>

                {testSuccessMsg && (
                  <p className="ae-reveal-scale text-center text-[11px] font-semibold text-sage-800 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/60 py-2 px-3 rounded-2xl border border-sage-200 dark:border-sage-800">
                    ✓ {testSuccessMsg}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 6: PRIVACIDADE E DADOS (LGPD)
         ===================================================================== */}
      {activeSection === 'privacy' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Privacidade e Dados (LGPD)',
            'Transparência total e controle sobre suas preferências de privacidade'
          )}

          <section
            data-testid="privacy-settings-section"
            className="surface-editorial rounded-3xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-graphite-500 dark:text-sand-300 uppercase tracking-wider flex items-center space-x-2">
                <AnimatedShieldCheckIcon active={true} className="w-4 h-4 text-sage-700 dark:text-sand-300" />
                <span>Estatísticas de Uso</span>
              </h2>

              <button
                type="button"
                data-testid="toggle-optional-analytics-btn"
                onClick={() => {
                  if (consentRecord.analyticsAllowed) {
                    const updated = revokeAnalyticsConsent('settings');
                    setConsentRecord(updated);
                    setPrivacyNotice(
                      'Coleta opcional desativada. Identificadores e filas locais foram limpos imediatamente.'
                    );
                  } else {
                    const updated = grantAnalyticsConsent('settings', true);
                    setConsentRecord(updated);
                    setPrivacyNotice('Analytics opcionais autorizados com sucesso.');
                  }
                }}
                className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  consentRecord.analyticsAllowed
                    ? 'bg-sage-800 text-cream-50'
                    : 'bg-sand-200 dark:bg-graphite-700 text-graphite-600 dark:text-graphite-300'
                }`}
              >
                {consentRecord.analyticsAllowed ? 'Analytics Ativos' : 'Analytics Desativados'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-sand-50 dark:bg-graphite-900 border border-sand-200 dark:border-graphite-700 text-xs space-y-1.5 text-graphite-600 dark:text-graphite-300">
              <p>
                <strong>Escolha atual:</strong>{' '}
                {consentRecord.analyticsAllowed
                  ? 'Coleta opcional autorizada'
                  : consentRecord.status === 'revoked'
                  ? 'Consentimento revogado (Coleta bloqueada)'
                  : consentRecord.status === 'refused'
                  ? 'Analytics recusados (Coleta bloqueada)'
                  : 'Não decidido (Coleta bloqueada por padrão)'}
              </p>
              <p className="text-[11px] text-graphite-400">
                Versão da Política: {CURRENT_POLICY_VERSION}
                {consentRecord.decidedAt &&
                  ` • Decisão registrada em ${new Date(consentRecord.decidedAt).toLocaleString('pt-BR')}`}
              </p>
            </div>

            <p className="text-xs text-graphite-500 dark:text-graphite-400 leading-relaxed">
              Você pode ativar, desativar ou revogar o consentimento de estatísticas de uso a qualquer
              momento. A recusa nunca afeta a leitura dos devocionais nem apaga seu Diário de Oração ou seu Papel de Parede.
            </p>

            {privacyNotice && (
              <div className="p-3 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-xs text-sage-900 dark:text-sage-200 font-medium">
                ✓ {privacyNotice}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={isDeletingAnalytics}
                data-testid="delete-analytics-data-btn"
                onClick={async () => {
                  setIsDeletingAnalytics(true);
                  const res = await requestAnalyticsDataDeletion();
                  setConsentRecord(getConsentRecord());
                  setPrivacyNotice(res.message);
                  setIsDeletingAnalytics(false);
                }}
                className="py-2 px-3.5 rounded-full border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeletingAnalytics
                    ? 'Eliminando registros...'
                    : 'Revogar e Eliminar Dados Analíticos Anteriores'}
                </span>
              </button>

              <a
                href="mailto:contato@amanhecer.app?subject=Privacidade%20e%20Direitos%20LGPD%20-%20Amanhecer"
                className="py-2 px-3.5 rounded-full border border-sand-200 dark:border-graphite-700 bg-sand-50 dark:bg-graphite-800 text-graphite-700 dark:text-graphite-200 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contatar Responsável (LGPD)</span>
              </a>
            </div>

            <div className="pt-2 border-t border-sand-200/70 dark:border-graphite-700 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <a
                href="/politica-de-privacidade"
                onClick={(e) => {
                  if (onNavigateLegal) {
                    e.preventDefault();
                    onNavigateLegal('/politica-de-privacidade');
                  }
                }}
                className="font-semibold underline text-sage-800 dark:text-sand-300 inline-flex items-center gap-1"
              >
                <span>Política de Privacidade</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/termos-de-uso"
                onClick={(e) => {
                  if (onNavigateLegal) {
                    e.preventDefault();
                    onNavigateLegal('/termos-de-uso');
                  }
                }}
                className="font-semibold underline text-sage-800 dark:text-sand-300 inline-flex items-center gap-1"
              >
                <span>Termos de Uso</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/politica-de-cookies"
                onClick={(e) => {
                  if (onNavigateLegal) {
                    e.preventDefault();
                    onNavigateLegal('/politica-de-cookies');
                  }
                }}
                className="font-semibold underline text-sage-800 dark:text-sand-300 inline-flex items-center gap-1"
              >
                <span>Política de Cookies e Armazenamento</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 7: APOIE O PROJETO AMANHECER
         ===================================================================== */}
      {activeSection === 'donation' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Apoie o Projeto Amanhecer',
            'Contribuição voluntária para manter o aplicativo 100% gratuito e sem anúncios'
          )}

          <DonationCard source="settings" />
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 8: FIDELIDADE BÍBLICA E TERMOS
         ===================================================================== */}
      {activeSection === 'theology' && (
        <div className="space-y-5 ae-reveal-up">
          {renderSectionBackHeader(
            'Fidelidade Bíblica',
            'Compromisso teológico e princípios editoriais do Amanhecer'
          )}

          <section className="surface-warm-sand rounded-3xl p-5 sm:p-6 space-y-3 text-xs text-graphite-600 dark:text-graphite-300">
            <h2 className="text-xs font-bold text-graphite-700 dark:text-graphite-200 uppercase tracking-wider flex items-center space-x-2">
              <AnimatedBookOpenIcon active={true} className="w-4 h-4 text-sage-700 dark:text-sage-300" />
              <span>Autoridade Bíblica</span>
            </h2>

            <p className="leading-relaxed">
              O Amanhecer adota como autoridade inerrante a Bíblia Cristã, fundamentada no{' '}
              <strong>cânon protestante de 66 livros</strong>.
            </p>

            <ul className="space-y-1.5 text-graphite-600 dark:text-graphite-300">
              <li className="flex items-center gap-2">
                <AnimatedCheckCircleIcon active={true} className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
                <span>100% gratuito: sem anúncios, planos ou cobranças.</span>
              </li>
              <li className="flex items-center gap-2">
                <AnimatedCheckCircleIcon active={true} className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
                <span>Sem teologia da prosperidade ou promessas levianas.</span>
              </li>
              <li className="flex items-center gap-2">
                <AnimatedCheckCircleIcon active={true} className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
                <span>Sem manipulação espiritual ou culpa religiosa.</span>
              </li>
              <li className="flex items-center gap-2">
                <AnimatedCheckCircleIcon active={true} className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300 shrink-0" />
                <span>Avaliação automatizada com corte mínimo de 90/100.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-sand-300/60 dark:border-sand-300/20">
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-sage-800 dark:text-cream-100 underline hover:text-sage-950 cursor-pointer"
              >
                <AnimatedShieldCheckIcon className="w-3.5 h-3.5 text-sage-700 dark:text-sand-300" />
                <span>Ler Termos de Uso e Política de Privacidade (LGPD)</span>
              </button>
            </div>
          </section>
        </div>
      )}

      <TermsAndPrivacyModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      <ExtremeTestModal isOpen={isExtremeTestOpen} onClose={() => setIsExtremeTestOpen(false)} />
    </div>
  );
};
