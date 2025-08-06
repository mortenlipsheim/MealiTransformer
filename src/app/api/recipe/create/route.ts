// src/app/api/recipe/create/route.ts
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
      console.log(`Cleaned up recipe ${id}`);
    }, 5 * 60 * 1000); // 5 minutes

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json({ error: 'Server configuration error: NEXT_PUBLIC_APP_URL is not set' }, { status: 500 });
    }

    const url = new URL(`/api/recipe/${id}`, appUrl).toString();

    return NextResponse.json({ url, id });
  } catch (error: any) {
    console.error('Error in recipe POST route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// This map is exported so the GET route can access it.
// This is a workaround for the fact that these are separate, stateless serverless functions.
// In a real app, a database (like Redis, a key-value store) would be used here.
export { recipeStore };
