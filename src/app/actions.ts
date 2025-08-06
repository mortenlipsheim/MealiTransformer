'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { extractRecipeFromYoutube } from '@/ai/flows/extract-recipe-from-youtube';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { translateAndFormatRecipe } from '@/ai/flows/translate-and-format-recipe';
import { generateHtmlForMealie } from '@/ai/flows/generate-html-for-mealie';
import type { Recipe, Settings } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
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

interface MealieResponse {
  id: string; // This is the recipe slug
}

export async function generateAndPostToMealie(recipe: Recipe): Promise<{ success: boolean; recipeSlug?: string; error?: string }> {
  try {
    // 1. Create a temporary page on our own app
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not set in the environment variables.");
    }
    
    const createResponse = await fetch(`${appUrl}/api/recipe/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
    });

    if (!createResponse.ok) {
        throw new Error(`Failed to create temporary recipe page: ${await createResponse.text()}`);
    }
    const { id } = await createResponse.json();
    const tempRecipeUrl = `${appUrl}/api/recipe/${id}`;


    // 2. Tell Mealie to scrape that URL
    const mealieUrl = process.env.MEALIE_URL;
    const mealieToken = process.env.MEALIE_API_TOKEN;

    if (!mealieUrl || !mealieToken) {
      throw new Error('Mealie URL or API token is not configured in environment variables.');
    }

    const fullUrl = new URL('/api/recipes/scrape-url/', mealieUrl).toString();

    const headers = new Headers({
        'Authorization': `Bearer ${mealieToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url: tempRecipeUrl, include_tags: true }),
    });

    if (response.status === 405) {
      throw new Error('Mealie API Error: Method not allowed. The scrape-url endpoint may be disabled or you might be using an older Mealie version.');
    }
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Mealie API Error:', errorBody);
      throw new Error(`Mealie API request failed with status ${response.status}: ${errorBody}`);
    }

    const recipeSlug = (await response.json()) as string; // Mealie returns the slug directly

    return { success: true, recipeSlug };

  } catch (error: any) {
    console.error('Error in generateAndPostToMealie:', error);
    return { success: false, error: error.message || 'Failed to post recipe to Mealie.' };
  }
}
