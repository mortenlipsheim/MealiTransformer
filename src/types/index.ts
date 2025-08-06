export interface Recipe {
  name: string;
  description: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

export interface Settings {
  uiLang: 'en' | 'fr';
  targetLang: 'en' | 'fr' | 'de' | 'es' | 'it';
  targetSystem: 'metric' | 'us';
}
