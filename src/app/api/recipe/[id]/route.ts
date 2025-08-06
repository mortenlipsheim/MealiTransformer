// src/app/api/recipe/[id]/route.ts
import { NextResponse } from 'next/server';
import { getRecipeHtml } from '@/lib/recipe-cache';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return new Response('No recipe ID provided', { status: 400 });
    }
    
    const html = getRecipeHtml(id);

    if (!html) {
      return new Response('Recipe not found or has expired', { status: 404 });
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error retrieving temporary recipe:', error);
    return new Response('An internal server error occurred', { status: 500 });
  }
}
