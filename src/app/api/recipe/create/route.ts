// src/app/api/recipe/create/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateHtmlForMealie } from '@/ai/flows/generate-html-for-mealie';
import type { Recipe } from '@/types';
import { setRecipeHtml } from '@/lib/recipe-cache';

export async function POST(request: Request) {
  try {
    const recipe = (await request.json()) as Recipe;
    if (!recipe) {
      return NextResponse.json({ error: 'No recipe data provided' }, { status: 400 });
    }

    // Generate the schema.org HTML
    const { html } = await generateHtmlForMealie(recipe);
    if (!html) {
      return NextResponse.json({ error: 'Failed to generate recipe HTML' }, { status: 500 });
    }

    // Store it in the cache
    const id = uuidv4();
    setRecipeHtml(id, html);
    
    return NextResponse.json({ id });
  } catch (error: any) {
    console.error('Error creating temporary recipe:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
