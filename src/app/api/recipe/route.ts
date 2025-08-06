// src/app/api/recipe/route.ts
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// A simple in-memory store for the recipe HTML.
// In a production app, you would use a proper database or cache (e.g., Redis, Vercel KV).
const recipeStore = new Map<string, string>();
const STORE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    const { html } = await request.json();
    if (!html) {
      return NextResponse.json({ error: 'Missing HTML content' }, { status: 400 });
    }

    const id = randomBytes(16).toString('hex');
    recipeStore.set(id, html);

    // Clean up old entries after TTL
    setTimeout(() => recipeStore.delete(id), STORE_TTL);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Failed to handle recipe post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return new NextResponse('Missing recipe ID', { status: 400 });
        }

        const html = recipeStore.get(id);

        if (!html) {
            return new NextResponse('Recipe not found or expired', { status: 404 });
        }

        // The recipe is consumed after being read once
        recipeStore.delete(id);

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Failed to handle recipe get:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}