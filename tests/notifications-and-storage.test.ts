import { describe, it, expect } from 'vitest';
import { DEFAULT_PREFERENCES, UserPreferences } from '../src/storage/preferences';

describe('Políticas de Notificações e Armazenamento Anônimo', () => {
  it('1. As preferências padrão do usuário iniciam sem cadastro e sem permissão invasiva', () => {
    expect(DEFAULT_PREFERENCES.onboardingCompleted).toBe(false);
    expect(DEFAULT_PREFERENCES.notificationsEnabled).toBe(false);
    expect(DEFAULT_PREFERENCES.dailyVerseEnabled).toBe(true);
    expect(DEFAULT_PREFERENCES.reminderEnabled).toBe(true);
    expect(DEFAULT_PREFERENCES.fineFontSize).toBe(18);
  });

  it('2. Regra de Coexistência de Notificações: Se o versículo diário das 06:06 estiver ativado, substitui o lembrete das 06:00', () => {
    // Logic test mirroring send-reminders handler
    function shouldSendReminderSlot(slot: string, prefs: UserPreferences, isCompletedToday: boolean): boolean {
      if (!prefs.reminderEnabled) return false;
      if (isCompletedToday) return false; // Parada imediata após leitura
      if (slot === '06:00' && prefs.dailyVerseEnabled) return false; // 06:06 substitui 06:00
      return true;
    }

    // Caso A: Versículo ativado, devocional NÃO lido
    const prefsVerseActive: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      dailyVerseEnabled: true,
      reminderEnabled: true,
    };
    expect(shouldSendReminderSlot('06:00', prefsVerseActive, false)).toBe(false); // 06:06 substituiu
    expect(shouldSendReminderSlot('11:00', prefsVerseActive, false)).toBe(true);
    expect(shouldSendReminderSlot('16:00', prefsVerseActive, false)).toBe(true);
    expect(shouldSendReminderSlot('21:00', prefsVerseActive, false)).toBe(true);

    // Caso B: Leitura CONCLUÍDA hoje -> todos os lembretes restantes devem PARAR imediatamente
    expect(shouldSendReminderSlot('11:00', prefsVerseActive, true)).toBe(false);
    expect(shouldSendReminderSlot('16:00', prefsVerseActive, true)).toBe(false);
    expect(shouldSendReminderSlot('21:00', prefsVerseActive, true)).toBe(false);

    // Caso C: Versículo desativado pelo usuário, mas lembretes ativados -> slot 06:00 é enviado
    const prefsVerseDisabled: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      dailyVerseEnabled: false,
      reminderEnabled: true,
    };
    expect(shouldSendReminderSlot('06:00', prefsVerseDisabled, false)).toBe(true);
  });
});
