
'use server';

import type { Recipe } from '@/types';
import { generateHtmlForMealie } from '@/ai/flows/generate-html-for-mealie';
import { v4 as uuidv4 } from 'uuid';

export async function generateMealieHtml(recipe: Recipe): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    const { html } = await generateHtmlForMealie(recipe);
    if (!html) {
      throw new Error('Failed to generate recipe HTML.');
    }
    return { success: true, html };
  } catch (error: any) {
    console.error('Error generating Mealie HTML:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
