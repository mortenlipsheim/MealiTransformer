
'use server';

import type { Recipe, Settings } from '@/types';
import { generateHtmlForMealie } from '@/ai/flows/generate-html-for-mealie';
import { processRecipe } from '@/ai/flows/recipe-processor';


export async function transformRecipe(params: {
  type: 'url' | 'text' | 'image' | 'youtube';
  source: string;
  settings: Settings;
}): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
  try {
    const { recipe } = await processRecipe({
      inputType: params.type,
      source: params.source,
      targetLanguage: params.settings.targetLang,
      targetMeasuringSystem: params.settings.targetSystem,
    });
    if (!recipe) {
      throw new Error('AI failed to process the recipe.');
    }
    return { success: true, recipe };
  } catch (error: any) {
    console.error('Error transforming recipe:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

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
