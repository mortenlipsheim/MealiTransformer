'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { translations } from '@/lib/translations';
import { getSettings, saveSettings } from '@/app/settings-actions';
import { useToast } from '@/hooks/use-toast';

const defaultSettings: Settings = {
  mealieUrl: '',
  mealieApiToken: '',
  uiLang: 'en',
  targetLang: 'fr',
  targetSystem: 'metric',
};

export interface SettingsContextValue {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  t: (key: keyof (typeof translations)['en']) => string;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      const serverSettings = await getSettings();
      setSettingsState(serverSettings);
      setIsMounted(true);
    }
    loadSettings();
  }, []);

  const setSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettingsState(prevSettings => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        // Debounce saving to avoid too many requests
        const timer = setTimeout(async () => {
          const result = await saveSettings(updatedSettings);
          if (!result.success) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to save settings.',
            });
          }
        }, 500);
        return () => clearTimeout(timer);
        return updatedSettings;
      });
    },
    [toast]
  );

  const t = useCallback(
    (key: keyof (typeof translations)['en']) => {
      return translations[settings.uiLang][key] || translations.en[key];
    },
    [settings.uiLang]
  );

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return <SettingsContext.Provider value={{ settings, setSettings, t }}>{children}</SettingsContext.Provider>;
}
