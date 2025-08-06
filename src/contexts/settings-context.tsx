'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { translations } from '@/lib/translations';

const defaultSettings: Settings = {
  mealieUrl: '',
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

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSettings = window.localStorage.getItem('mealie-transformer-settings');
      if (storedSettings) {
        setSettingsState(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
  }, []);

  const setSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettingsState((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        window.localStorage.setItem('mealie-transformer-settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
      return updatedSettings;
    });
  }, []);

  const t = useCallback(
    (key: keyof (typeof translations)['en']) => {
      return translations[settings.uiLang][key] || translations.en[key];
    },
    [settings.uiLang]
  );
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
}
