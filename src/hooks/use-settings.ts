'use client';

import { useContext } from 'react';
import { SettingsContext, type SettingsContextValue } from '@/contexts/settings-context';

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
