// src/app/api/recipe/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// This is a simple in-memory store. In a real application, you might use a database like Redis.
const recipeStore = new Map<string, string>();

export async function POST(request: Request) {
  try {
    const { htmlContent } = await request.json();
    if (!htmlContent) {
      return NextResponse.json({ error: 'Missing htmlContent' }, { status: 400 });
    }

    const id = uuidv4();
    recipeStore.set(id, htmlContent);

    // Clean up the stored recipe after a short time to prevent memory leaks
    setTimeout(() => {
      recipeStore.delete(id);
    }, 5 * 60 * 1000); // 5 minutes

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is not set');
    }

    const url = new URL(`/api/recipe/${id}`, appUrl).toString();

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error in recipe POST route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    if (!id || !recipeStore.has(id)) {
      return new Response('Recipe not found or expired', { status: 404 });
    }

    const htmlContent = recipeStore.get(id);
    // Important: We can delete it after the first GET request as Mealie should have scraped it.
    recipeStore.delete(id); 

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('Error in recipe GET route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
