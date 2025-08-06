import { config } from 'dotenv';
config();

import '@/ai/flows/generate-html-for-mealie.ts';
import '@/ai/flows/translate-and-format-recipe.ts';
import '@/ai/flows/extract-recipe-from-youtube.ts';
import '@/ai/flows/extract-text-from-image.ts';
