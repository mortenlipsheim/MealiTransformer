'use server';

/**
 * @fileOverview Extracts a recipe from a YouTube video, translates it if needed,
 * and formats it for Mealie.
 *
 * - extractRecipeFromYoutube - A function that handles the recipe extraction process.
 * - ExtractRecipeFromYoutubeInput - The input type for the extractRecipeFromYoutube function.
 * - ExtractRecipeFromYoutubeOutput - The return type for the extractRecipeFromYoutube function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractRecipeFromYoutubeInputSchema = z.object({
  youtubeUrl: z.string().describe('The URL of the YouTube video containing the recipe.'),
  targetLanguage: z.string().optional().describe('The target language for the recipe translation (e.g., fr, en).'),
  targetMeasuringSystem: z
    .enum(['metric', 'us'])
    .default('metric')
    .describe('The target measuring system for the recipe.'),
});
export type ExtractRecipeFromYoutubeInput = z.infer<typeof ExtractRecipeFromYoutubeInputSchema>;

const ExtractRecipeFromYoutubeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  instructions: z.array(z.string()).describe('A list of instructions for the recipe.'),
  originalLanguage: z.string().optional().describe('The original language of the recipe.'),
});
export type ExtractRecipeFromYoutubeOutput = z.infer<typeof ExtractRecipeFromYoutubeOutputSchema>;

export async function extractRecipeFromYoutube(input: ExtractRecipeFromYoutubeInput): Promise<ExtractRecipeFromYoutubeOutput> {
  return extractRecipeFromYoutubeFlow(input);
}

const extractRecipePrompt = ai.definePrompt({
  name: 'extractRecipePrompt',
  input: {schema: ExtractRecipeFromYoutubeInputSchema},
  output: {schema: ExtractRecipeFromYoutubeOutputSchema},
  prompt: `You are an expert recipe extractor. Your task is to extract recipe information from a YouTube video.

  1.  **Analyze the Video Content:** Attempt to extract the recipe from the video's transcript (if available) or, if not, attempt to understand the spoken recipe.
  2.  **Identify Recipe Elements:** Identify the recipe name, ingredients, and instructions.
  3.  **Translate if Needed:** If the recipe is not in the target language ({{targetLanguage}}), translate it to the target language.
  4.  **Format for Mealie:** Format the extracted recipe information into a clear and precise recipe with ingredients and instructions.
  5.  **Handle Incomplete Information:** In cases where there is no clear "recipe-structure" to the recipe on a YouTube video, you must put it together to make a clear and precise recipe.

  Here is the YouTube video URL: {{{youtubeUrl}}}

  Please extract the recipe information in the following format:
  Recipe Name: (recipe name)
  Ingredients: (list of ingredients, each on a new line)
  Instructions: (list of instructions, each on a new line)

  Original Language: (original language of the recipe, if different from target language)
  `,
});

const extractRecipeFromYoutubeFlow = ai.defineFlow(
  {
    name: 'extractRecipeFromYoutubeFlow',
    inputSchema: ExtractRecipeFromYoutubeInputSchema,
    outputSchema: ExtractRecipeFromYoutubeOutputSchema,
  },
  async input => {
    const {output} = await extractRecipePrompt(input);
    return output!;
  }
);
