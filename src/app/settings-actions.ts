'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Settings } from '@/types';

const settingsFilePath = path.join(process.cwd(), 'settings.json');

export async function getSettings(): Promise<Settings> {
  try {
    const fileContent = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is invalid, return default settings
    console.error('Failed to read settings file, returning defaults:', error);
    return {
      mealieUrl: '',
      mealieApiToken: '',
      uiLang: 'en',
      targetLang: 'fr',
      targetSystem: 'metric',
    };
  }
}

export async function saveSettings(settings: Settings): Promise<{ success: boolean; error?: string }> {
  try {
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    return { success: false, error: error.message };
  }
}
