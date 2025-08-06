'use server';

/**
 * @fileOverview A Genkit flow for translating and formatting recipes.
 *
 * - translateAndFormatRecipe - A function that handles the recipe translation and formatting process.
 * - TranslateAndFormatRecipeInput - The input type for the translateAndFormatRecipe function.
 * - TranslateAndFormatRecipeOutput - The return type for the translateAndFormatRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAndFormatRecipeInputSchema = z.object({
  recipeContent: z.string().describe('The recipe content as a string.'),
  sourceLanguage: z.string().optional().describe('The language of the recipe content.'),
  targetLanguage: z.string().describe('The target language for translation.'),
  targetMeasurementSystem: z
    .string()
    .describe('The target measurement system (e.g., Metric, US).'),
});

export type TranslateAndFormatRecipeInput = z.infer<
  typeof TranslateAndFormatRecipeInputSchema
>;

const TranslateAndFormatRecipeOutputSchema = z.object({
  translatedRecipe: z.string().describe('The translated and reformatted recipe.'),
});

export type TranslateAndFormatRecipeOutput = z.infer<
  typeof TranslateAndFormatRecipeOutputSchema
>;

export async function translateAndFormatRecipe(
  input: TranslateAndFormatRecipeInput
): Promise<TranslateAndFormatRecipeOutput> {
  return translateAndFormatRecipeFlow(input);
}

const translateAndFormatRecipePrompt = ai.definePrompt({
  name: 'translateAndFormatRecipePrompt',
  input: {schema: TranslateAndFormatRecipeInputSchema},
  output: {schema: TranslateAndFormatRecipeOutputSchema},
  prompt: `You are a recipe translator and formatter. You will translate the given recipe to the target language and reformat the ingredients and instructions to the specified measurement system.

  Source Language: {{sourceLanguage}}
  Target Language: {{targetLanguage}}
  Target Measurement System: {{targetMeasurementSystem}}

  Recipe:
  {{recipeContent}}

  Ensure the translated recipe is clear, accurate, and easy to follow. Pay close attention to ingredient quantities and cooking instructions.
  Output only the translated and formatted recipe. Do not include any additional text or explanations.
`,
});

const translateAndFormatRecipeFlow = ai.defineFlow(
  {
    name: 'translateAndFormatRecipeFlow',
    inputSchema: TranslateAndFormatRecipeInputSchema,
    outputSchema: TranslateAndFormatRecipeOutputSchema,
  },
  async input => {
    const {output} = await translateAndFormatRecipePrompt(input);
    return output!;
  }
);
