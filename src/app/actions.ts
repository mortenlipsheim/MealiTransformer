'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { extractRecipeFromYoutube } from '@/ai/flows/extract-recipe-from-youtube';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { generateHtmlForMealie } from '@/ai/flows/generate-html-for-mealie';
import { translateAndFormatRecipe } from '@/ai/flows/translate-and-format-recipe';
import type { Recipe, Settings } from '@/types';

// Helper to parse unstructured text into a recipe object
const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  description: z.string().optional().describe('A short description of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients.'),
  instructions: z.array(z.string()).describe('A list of instructions.'),
  prepTime: z.string().optional().describe('The prep time, e.g., "15 minutes".'),
  cookTime: z.string().optional().describe('The cook time, e.g., "30 minutes".'),
  totalTime: z.string().optional().describe('The total time, e.g., "45 minutes".'),
  recipeYield: z.string().optional().describe('The number of servings, e.g., "4 servings".'),
  recipeCategory: z.string().optional().describe('The category, e.g., "Dessert".'),
  recipeCuisine: z.string().optional().describe('The cuisine, e.g., "Italian".'),
});

async function parseTextToRecipe(text: string, settings: Settings): Promise<Recipe> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: `Parse the following recipe text into a structured format. The user's target language is '${settings.targetLang}' and their measurement system is '${settings.targetSystem}'. Translate and convert units as necessary. The text is: \n\n${text}`,
    output: {
      schema: RecipeSchema,
    },
    config: {
      temperature: 0.2,
    }
  });

  if (!output) {
    throw new Error('AI parsing failed');
  }

  return output as Recipe;
}

// Main transform action
interface TransformInput {
  type: 'url' | 'text' | 'image' | 'youtube';
  source: string;
  settings: Settings;
}

export async function transformRecipe(input: TransformInput): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
  try {
    let recipeData: Recipe;

    if (input.type === 'youtube') {
      const result = await extractRecipeFromYoutube({ 
        youtubeUrl: input.source, 
        targetLanguage: input.settings.targetLang,
        targetMeasuringSystem: input.settings.targetSystem,
      });
      recipeData = { ...result, description: '' };
    } else {
      let rawText = '';
      if (input.type === 'text') {
        rawText = input.source;
      } else if (input.type === 'image') {
        const result = await extractTextFromImage({ photoDataUri: input.source });
        rawText = result.extractedText;
      } else if (input.type === 'url') {
        // Basic URL fetch and text extraction
        const response = await fetch(input.source);
        const html = await response.text();
        // A simple way to get text, could be improved with a proper library
        rawText = html.replace(/<style[^>]*>.*<\/style>/gs, '')
                      .replace(/<script[^>]*>.*<\/script>/gs, '')
                      .replace(/<[^>]+>/g, '\n')
                      .replace(/\s{2,}/g, ' ')
                      .trim();
      }

      const translated = await translateAndFormatRecipe({
        recipeContent: rawText,
        targetLanguage: input.settings.targetLang,
        targetMeasurementSystem: input.settings.targetSystem,
      });
      
      recipeData = await parseTextToRecipe(translated.translatedRecipe, input.settings);
    }

    return { success: true, recipe: recipeData };
  } catch (error: any) {
    console.error('Transformation error:', error);
    return { success: false, error: error.message || 'An unknown error occurred during transformation.' };
  }
}

// Action to generate HTML and post to dpaste
export async function generateAndPost(recipe: Recipe): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { html } = await generateHtmlForMealie(recipe);
    const response = await fetch('https://dpaste.org/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        content: html,
        syntax: 'html',
        title: recipe.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`dpaste API error: ${response.statusText}`);
    }

    const url = await response.text();
    return { success: true, url: url.trim() };
  } catch (error: any) {
    console.error('Dpaste post error:', error);
    return { success: false, error: error.message || 'Failed to post to dpaste.' };
  }
}

// Action to send URL to Mealie
export async function sendToMealie(url: string, mealieUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fullUrl = new URL('/api/recipes/url', mealieUrl).toString();

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown Mealie API error' }));
        throw new Error(`Mealie API Error: ${errorData.detail || response.statusText}`);
    }
    
    const recipeId = await response.text();
    // Mealie returns the ID of the new recipe slug, which is a string.
    const recipeSlug = recipeId.replace(/"/g, ''); 
    const finalUrl = new URL(`/recipe/${recipeSlug}`, mealieUrl).toString();

    return { success: true, url: finalUrl };
  } catch (error: any) {
    console.error('Mealie send error:', error);
    return { success: false, error: error.message || 'Failed to send to Mealie.' };
  }
}
