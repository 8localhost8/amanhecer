import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, AppView } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { DevotionalPage } from './pages/DevotionalPage';
import { HistoryPage } from './pages/HistoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { DiaryPage } from './pages/DiaryPage';
import { SettingsPage } from './pages/SettingsPage';
import { EvaluationDashboardPage } from './pages/EvaluationDashboardPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { CelebrationModal } from './components/CelebrationModal';
import { InstallModal } from './components/InstallModal';
import { IntroSplash } from './components/IntroSplash';
import { NotificationBugfixModal } from './components/NotificationBugfixModal';
import { NewFeatureShareModal } from './components/NewFeatureShareModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { CURRENT_UPDATE } from './content/updates/current-update';

import { loadUserPreferences, saveUserPreferences, applyThemeAndFont, UserPreferences } from './storage/preferences';
import { getDevotionalForDate, getAllPublishedDevotionals } from './content/devotionals/vault';
import { selectDailyVerse, getSaoPauloDateString } from './services/daily-verse/selection-engine';
import { saveCompletion, getCompletion, getAllCompletions, toggleFavorite, isFavorite, getAllFavorites } from './storage/db';
import { syncCompletionWithPushServer, initLocalNotificationScheduler, resyncPushSubscription } from './services/notifications/push-client';
import { recordAppInstallationOnce } from './services/stats/install-counter';
import { DevotionalPublic } from './services/ai/schemas';
import { initAnalyticsSDK, trackEvent } from './services/analytics/analytics-client';
import { isAnalyticsConsentGranted } from './services/consent/consent-manager';
import { PrivacyConsentBanner } from './components/PrivacyConsentBanner';
import { LegalPages, LegalRouteType } from './pages/LegalPages';
import { AnalyticsDashboardPage } from './pages/analytics/AnalyticsDashboardPage';

export const App: React.FC = () => {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const navigateToPath = (nextPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', nextPath);
      setPathname(window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    initAnalyticsSDK();
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !loadUserPreferences().onboardingCompleted);
  const [isNotifBugfixOpen, setIsNotifBugfixOpen] = useState<boolean>(() => {
    const p = loadUserPreferences();
    return Boolean(p.onboardingCompleted && !p.forceNotifPromptV1Seen);
  });
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isShareNewsOpen, setIsShareNewsOpen] = useState<boolean>(
    () => !loadUserPreferences().featureShareImageV6Seen
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const seen = localStorage.getItem('amanhecer_seen_update_version');
    const forcedV230 = localStorage.getItem('amanhecer_force_update_v230');
    return seen !== CURRENT_UPDATE.version || forcedV230 !== 'true';
  });
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Check if opened as standalone PWA
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );

  // Determine initial view:
  // 1. If installed/standalone -> open directly in 'home'
  // 2. If in regular browser and user previously selected "Usar no navegador" in this session -> 'home'
  // 3. Otherwise -> 'landing'
  const [currentView, setCurrentView] = useState<AppView | 'landing'>(() => {
    if (isStandalone) {
      return 'home';
    }
    if (typeof window !== 'undefined' && sessionStorage.getItem('amanhecer_use_browser') === 'true') {
      return 'home';
    }
    return 'landing';
  });

  const [todayStr] = useState<string>(() => getSaoPauloDateString());
  const [devotional, setDevotional] = useState<DevotionalPublic>(() => getDevotionalForDate(todayStr));
  const [dailyVerse] = useState(() => selectDailyVerse(todayStr));
  
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(false);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<DevotionalPublic[]>([]);
  const [isCurrentFav, setIsCurrentFav] = useState<boolean>(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Apply theme and font styles on mount
  useEffect(() => {
    applyThemeAndFont(preferences);
  }, [preferences]);

  // Initialize autonomous notification scheduler (06:06 Daily Verse & Reminders)
  // and record anonymous installation after initial paint to prevent launch stutter
  useEffect(() => {
    const timer = setTimeout(() => {
      initLocalNotificationScheduler();
      resyncPushSubscription();
      trackEvent('app_opened', {
        mode: isStandalone ? 'standalone' : 'browser',
        initial_view: currentView,
      });
      if (isStandalone) {
        trackEvent('pwa_standalone_opened', { source: 'launch' });
        if (isAnalyticsConsentGranted()) {
          recordAppInstallationOnce();
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isStandalone]);

  // Track internal view navigation when consent is active
  useEffect(() => {
    if (currentView !== 'landing') {
      trackEvent('page_viewed', { view: currentView });
    }
  }, [currentView]);

  // Network offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sync any offline reading completions
      syncCompletionWithPushServer(todayStr);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [todayStr]);

  // Check for new server deployments / updates on focus and online
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => reg?.update()).catch(() => {});
        }
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const seen = localStorage.getItem('amanhecer_seen_update_version');
          const forcedV230 = localStorage.getItem('amanhecer_force_update_v230');
          if ((data.version && data.version !== seen) || forcedV230 !== 'true') {
            setIsUpdateModalOpen(true);
          }
        }
      } catch {
        // Offline; ignore
      }
    };

    checkForUpdates();
    window.addEventListener('focus', checkForUpdates);
    return () => window.removeEventListener('focus', checkForUpdates);
  }, []);

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Load IndexedDB state (completions & favorites)
  useEffect(() => {
    loadDbState();
  }, [devotional.id]);

  const loadDbState = async () => {
    const comp = await getCompletion(todayStr);
    setIsCompletedToday(!!comp);

    const allComps = await getAllCompletions();
    setCompletedDates(allComps.map(c => c.date));

    const favs = await getAllFavorites();
    setFavorites(favs);

    const favStatus = await isFavorite(devotional.id);
    setIsCurrentFav(favStatus);
  };

  const handleCompleteReading = async () => {
    const wasFirst = completedDates.length === 0;
    setIsFirstCompletion(wasFirst);
    await saveCompletion(devotional.id, devotional.date);
    setIsCompletedToday(true);
    setIsCelebrationOpen(true);
    await loadDbState();

    // Sync with push backend so remaining reminders for today stop
    syncCompletionWithPushServer(devotional.date);
  };

  const handleToggleFav = async () => {
    const added = await toggleFavorite(devotional);
    setIsCurrentFav(added);
    const updatedFavs = await getAllFavorites();
    setFavorites(updatedFavs);
    if (added) {
      trackEvent('devotional_favorited', {
        devotional_id: devotional.id,
        date: devotional.date,
        title: devotional.title,
      });
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    const updated = saveUserPreferences({ theme: nextTheme });
    setPreferences(updated);
    trackEvent('settings_changed', { setting: 'theme', value: nextTheme });
  };

  const handleSelectDevotionalFromList = (d: DevotionalPublic) => {
    setDevotional(d);
    setCurrentView('devotional');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterAppFromLanding = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('amanhecer_use_browser', 'true');
    }
    setCurrentView('home');
    if (!preferences.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  };

  // Rota Administrativa: /colossenses323analytics
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/colossenses323analytics') {
    return <AnalyticsDashboardPage onExitToApp={() => navigateToPath('/')} />;
  }

  // Rotas Públicas Legais (LGPD): /termos-de-uso, /politica-de-privacidade, /politica-de-cookies
  if (
    normalizedPath === '/termos-de-uso' ||
    normalizedPath === '/politica-de-privacidade' ||
    normalizedPath === '/politica-de-cookies'
  ) {
    return (
      <LegalPages
        route={normalizedPath as LegalRouteType}
        onNavigate={(target) => navigateToPath(target)}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <main className="min-h-screen bg-cream-100 dark:bg-graphite-950 text-graphite-700 dark:text-graphite-50">
        <LandingPage
          onEnterApp={handleEnterAppFromLanding}
          onOpenHelp={() => setIsInstallModalOpen(true)}
          deferredPrompt={deferredPrompt}
          onNavigateLegal={(target) => navigateToPath(target)}
        />
        <InstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
        />
        <PrivacyConsentBanner
          origin="landing"
          onNavigateLegal={(target) => navigateToPath(target)}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-graphite-950 text-graphite-700 dark:text-graphite-50 transition-colors">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        theme={preferences.theme}
        onThemeToggle={handleThemeToggle}
        onOpenHelp={() => setIsInstallModalOpen(true)}
        isOffline={isOffline}
      />

      <main key={currentView} className="flex-1 max-w-xl w-full mx-auto px-4 pt-4 pb-20">
        {currentView === 'home' && (
          <HomePage
            devotional={devotional}
            dailyVerse={dailyVerse}
            isCompleted={isCompletedToday}
            onStartReading={() => setCurrentView('devotional')}
            onNavigate={(view) => setCurrentView(view)}
            isFav={isCurrentFav}
            onToggleFav={handleToggleFav}
            userName={preferences.userName}
            onOpenShareNews={() => setIsUpdateModalOpen(true)}
          />
        )}

        {currentView === 'devotional' && (
          <DevotionalPage
            devotional={devotional}
            onBack={() => setCurrentView('home')}
            onComplete={handleCompleteReading}
            isCompleted={isCompletedToday}
            isFav={isCurrentFav}
            onToggleFav={handleToggleFav}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            devotionals={getAllPublishedDevotionals()}
            completedDates={completedDates}
            onSelectDevotional={handleSelectDevotionalFromList}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesPage
            favorites={favorites}
            onSelectDevotional={handleSelectDevotionalFromList}
            onRemoveFavorite={async (id, e) => {
              e.stopPropagation();
              const target = favorites.find(f => f.id === id);
              if (target) {
                await toggleFavorite(target);
                await loadDbState();
              }
            }}
          />
        )}

        {currentView === 'diary' && <DiaryPage />}

        {currentView === 'settings' && (
          <SettingsPage
            preferences={preferences}
            onUpdatePreferences={(updated) => setPreferences(updated)}
            onNavigateLegal={(target) => navigateToPath(target)}
          />
        )}

        {currentView === 'audit' && <EvaluationDashboardPage devotional={devotional} />}
      </main>

      {/* Floating Bottom Bar Navigation (Matching UX Reference) */}
      <BottomNav
        currentView={currentView as AppView}
        onNavigate={(view) => {
          if (view === 'home') {
            setDevotional(getDevotionalForDate(todayStr));
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
      />

      {/* Onboarding Wizard (First access) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setPreferences(loadUserPreferences());
        }}
        onStartFirstDevotional={() => {
          setIsOnboardingOpen(false);
          setPreferences(loadUserPreferences());
          setCurrentView('devotional');
        }}
        initialPreferences={preferences}
      />

      {/* Celebration Modal upon reading completion */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        devotional={devotional}
        isFirstDevotional={isFirstCompletion}
        userName={preferences.userName}
      />

      {/* Help & Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Notification Bugfix Re-permission Modal (for existing users) */}
      <NotificationBugfixModal
        isOpen={!showIntro && !isOnboardingOpen && !isUpdateModalOpen && isNotifBugfixOpen}
        onClose={(updatedPrefs) => {
          setIsNotifBugfixOpen(false);
          setPreferences(updatedPrefs);
        }}
        userName={preferences.userName}
      />

      {/* Intro Video Splash Screen (Plays on every app opening) */}
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}

      {/* Novidade: compartilhamento em imagem (aparece uma vez para todos os usuários) */}
      <NewFeatureShareModal
        isOpen={!showIntro && !isOnboardingOpen && !isUpdateModalOpen && !isNotifBugfixOpen && isShareNewsOpen}
        onClose={() => {
          setIsShareNewsOpen(false);
          setPreferences(saveUserPreferences({ featureShareImageV6Seen: true }));
        }}
      />

      {/* Card de Nova Atualização (prioridade máxima após o splash para forçar aviso de atualização) */}
      <AppUpdateModal
        isOpen={!showIntro && isUpdateModalOpen}
        onClose={() => {
          localStorage.setItem('amanhecer_seen_update_version', CURRENT_UPDATE.version);
          localStorage.setItem('amanhecer_force_update_v230', 'true');
          setIsUpdateModalOpen(false);
        }}
        updateInfo={CURRENT_UPDATE}
      />

      {/* Gestor de Privacidade e Consentimento (LGPD - exibe apenas se ainda não decidido) */}
      {!showIntro && !isOnboardingOpen && (
        <PrivacyConsentBanner
          origin="pwa"
          onNavigateLegal={(target) => navigateToPath(target)}
        />
      )}
    </div>
  );
};
export default App;
