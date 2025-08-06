// src/ai/flows/extract-text-from-image.ts
'use server';

/**
 * @fileOverview Extracts text from an image of a handwritten recipe using OCR,
 *               optionally translates and formats it for use in Mealie.
 *
 * - extractTextFromImage - A function that handles the text extraction process.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a handwritten recipe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z
    .string()
    .optional()
    .describe('The target language for translation (e.g., fr for French).'),
  targetMeasuringSystem: z
    .string()
    .optional()
    .describe('The target measuring system (e.g., Metric or US).'),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
  translatedText: z
    .string()
    .optional()
    .describe('The translated text, if a target language was provided.'),
  formattedText: z
    .string()
    .optional()
    .describe('The formatted text, if a target measuring system was provided.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(
  input: ExtractTextFromImageInput
): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {schema: ExtractTextFromImageInputSchema},
  output: {schema: ExtractTextFromImageOutputSchema},
  prompt: `Extract the text from the following image of a handwritten recipe:

  {{media url=photoDataUri}}

  The extracted text should be as accurate as possible.

  {% if targetLanguage %}
  Also translate the extracted text to {{targetLanguage}}.
  {% endif %}

  {% if targetMeasuringSystem %}
  Also format the recipe to use the {{targetMeasuringSystem}} measuring system.
  {% endif %}`,
});

const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);
