
'use server';

/**
 * @fileOverview A Genkit flow for processing a recipe from various sources.
 *
 * - processRecipe - A function that handles recipe processing.
 * - ProcessRecipeInput - The input type for the processRecipe function.
 * - ProcessRecipeOutput - The return type for the processRecipe function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Recipe } from '@/types';

const ProcessRecipeInputSchema = z.object({
  inputType: z.enum(['url', 'text', 'image', 'youtube']),
  source: z.string().describe('The recipe source content. This can be a URL, plain text, a data URI for an image, or a YouTube URL.'),
  targetLanguage: z.string().describe('The target language for translation.'),
  targetMeasuringSystem: z.string().describe('The target measurement system (e.g., Metric, US).'),
});
export type ProcessRecipeInput = z.infer<typeof ProcessRecipeInputSchema>;

const RecipeSchema = z.object({
    name: z.string().describe('The name of the recipe.'),
    description: z.string().optional().describe('A short description of the recipe.'),
    prepTime: z.string().optional().describe('The prep time for the recipe, e.g., "30 minutes".'),
    cookTime: z.string().optional().describe('The cook time for the recipe, e.g., "1 hour".'),
    totalTime: z.string().optional().describe('The total time for the recipe.'),
    recipeYield: z.string().optional().describe('The number of servings, e.g., "4 servings".'),
    recipeCategory: z.string().optional().describe('The category of the recipe, e.g., "Dessert".'),
    recipeCuisine: z.string().optional().describe('The cuisine of the recipe, e.g., "Italian".'),
    ingredients: z.array(z.string()).describe('A list of ingredients.'),
    instructions: z.array(z.string()).describe('A list of step-by-step instructions.'),
    image: z.string().optional().describe('A URL to an image of the recipe.'),
  });
  

const ProcessRecipeOutputSchema = z.object({
  recipe: RecipeSchema,
});
export type ProcessRecipeOutput = z.infer<typeof ProcessRecipeOutputSchema>;

export async function processRecipe(input: ProcessRecipeInput): Promise<ProcessRecipeOutput> {
  return processRecipeFlow(input);
}

const processRecipePrompt = ai.definePrompt({
  name: 'processRecipePrompt',
  input: { schema: ProcessRecipeInputSchema },
  output: { schema: ProcessRecipeOutputSchema },
  prompt: `You are an expert recipe parsing AI. Your task is to analyze the provided recipe source, extract all relevant information, and format it into a structured JSON object.

  The recipe source type is: {{inputType}}

  The recipe source is:
  {{#if (eq inputType "image")}}
  {{media url=source}}
  {{else}}
  {{{source}}}
  {{/if}}

  Follow these instructions:
  1.  **Analyze the source:** Carefully examine the content. It could be a webpage (URL), plain text, an image of a handwritten or printed recipe, or a YouTube video.
  2.  **Extract Information:** Identify all the key components of the recipe: name, description, preparation time, cook time, total time, yield (servings), category, cuisine, ingredients, and instructions.
  3.  **Translate and Convert:** Translate all extracted text to the target language: **{{targetLanguage}}**. Convert all measurements to the **{{targetMeasuringSystem}}** system.
  4.  **Format Output:** Structure the extracted and converted information precisely according to the output schema.
  5.  **Handle Missing Information:** If some information (like prep time or cuisine) is not present in the source, omit it from the output. Do not invent data. The only required fields are name, ingredients and instructions.
`,
});

const processRecipeFlow = ai.defineFlow(
  {
    name: 'processRecipeFlow',
    inputSchema: ProcessRecipeInputSchema,
    outputSchema: ProcessRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await processRecipePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);
