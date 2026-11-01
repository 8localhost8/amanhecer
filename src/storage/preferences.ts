export type AppTheme = 'light' | 'dark' | 'auto';
export type FontSizePreset = 'small' | 'medium' | 'large' | 'xlarge';

export interface UserPreferences {
  onboardingCompleted: boolean;
  userName?: string;
  theme: AppTheme;
  fontSizePreset: FontSizePreset;
  fineFontSize: number; // 16 to 32
  notificationsEnabled: boolean;
  dailyVerseEnabled: boolean;
  reminderEnabled: boolean;
  pushSubscriptionToken?: string | null;
  notifBugfixV23Seen?: boolean;
  notifBugfixV24Seen?: boolean;
  notifBugfixV25Seen?: boolean;
}

const PREF_STORAGE_KEY = 'amanhecer_user_preferences_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  userName: '',
  theme: 'auto',
  fontSizePreset: 'medium',
  fineFontSize: 18,
  notificationsEnabled: false,
  dailyVerseEnabled: true,
  reminderEnabled: true,
  pushSubscriptionToken: null,
  notifBugfixV23Seen: false,
  notifBugfixV24Seen: false,
  notifBugfixV25Seen: false,
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = loadUserPreferences();
    const updated: UserPreferences = { ...current, ...prefs };
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(updated));
    applyThemeAndFont(updated);
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyThemeAndFont(prefs: UserPreferences): void {
  if (typeof document === 'undefined') return;

  // Apply Font Size CSS Variable
  document.documentElement.style.setProperty('--font-reading-size', `${prefs.fineFontSize}px`);

  // Apply Theme
  const isDark =
    prefs.theme === 'dark' ||
    (prefs.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
