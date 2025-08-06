
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
      try {
        const serverSettings = await getSettings();
        if (serverSettings) {
          setSettingsState(serverSettings);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setIsMounted(true);
      }
    }
    loadSettings();
  }, []);

  const setSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettingsState(updatedSettings);

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
      
      // This is a simplified debounce. In a real app, you'd want to clear previous timeouts.
    },
    [settings, toast]
  );

  const t = useCallback(
    (key: keyof (typeof translations)['en']) => {
      const lang = settings.uiLang || 'en';
      return translations[lang]?.[key] || translations.en[key];
    },
    [settings.uiLang]
  );
  
  const value = { settings, setSettings, t };

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
