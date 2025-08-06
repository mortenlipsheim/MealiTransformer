
'use server';
/**
 * @fileOverview A flow to generate schema.org-compliant HTML for Mealie scraping.
 *
 * - generateHtmlForMealie - A function that generates the HTML content.
 * - GenerateHtmlForMealieInput - The input type for the generateHtmlForMealie function.
 * - GenerateHtmlForMealieOutput - The return type for the generateHtmlForMealie function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHtmlForMealieInputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients.'),
  instructions: z.array(z.string()).describe('A list of instructions.'),
  prepTime: z.string().optional().describe('The prep time of the recipe.'),
  cookTime: z.string().optional().describe('The cook time of the recipe.'),
  totalTime: z.string().optional().describe('The total time of the recipe.'),
  recipeYield: z.string().optional().describe('The recipe yield.'),
  recipeCategory: z.string().optional().describe('The recipe category.'),
  recipeCuisine: z.string().optional().describe('The recipe cuisine.'),
  image: z.string().optional().describe('URL or data URI of the recipe image.'),
  description: z.string().optional().describe('A short description of the recipe.'),
});
export type GenerateHtmlForMealieInput = z.infer<typeof GenerateHtmlForMealieInputSchema>;

const GenerateHtmlForMealieOutputSchema = z.object({
  html: z.string().describe('The generated HTML content.'),
});
export type GenerateHtmlForMealieOutput = z.infer<typeof GenerateHtmlForMealieOutputSchema>;

export async function generateHtmlForMealie(input: GenerateHtmlForMealieInput): Promise<GenerateHtmlForMealieOutput> {
  return generateHtmlForMealieFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHtmlForMealiePrompt',
  input: {schema: GenerateHtmlForMealieInputSchema},
  output: {schema: GenerateHtmlForMealieOutputSchema},
  prompt: `Generate schema.org-compliant HTML for a recipe named "{{name}}".

Here are the ingredients:
{{#each ingredients}}
  - {{{this}}}
{{/each}}

Here are the instructions:
{{#each instructions}}
  - {{{this}}}
{{/each}}

{{#if description}}
Description: {{{description}}}
{{/if}}

{{#if prepTime}}
Prep Time: {{{prepTime}}}
{{/if}}

{{#if cookTime}}
Cook Time: {{{cookTime}}}
{{/if}}

{{#if totalTime}}
Total Time: {{{totalTime}}}
{{/if}}

{{#if recipeYield}}
Recipe Yield: {{{recipeYield}}}
{{/if}}

{{#if recipeCategory}}
Recipe Category: {{{recipeCategory}}}
{{/if}}

{{#if recipeCuisine}}
Recipe Cuisine: {{{recipeCuisine}}}
{{/if}}

Ensure the HTML is well-formed and follows schema.org Recipe standards. Include all provided information.

Remember to include <script type="application/ld+json"> tags around the JSON-LD.

Output ONLY the HTML.
`,
});

const generateHtmlForMealieFlow = ai.defineFlow(
  {
    name: 'generateHtmlForMealieFlow',
    inputSchema: GenerateHtmlForMealieInputSchema,
    outputSchema: GenerateHtmlForMealieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {html: output!.html!};
  }
);
