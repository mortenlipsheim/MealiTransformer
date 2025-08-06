// src/app/api/recipe/[id]/route.ts
import { recipeStore } from '../create/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
    try {
    const id = params.id;

    if (!id || !recipeStore.has(id)) {
      return new Response(`Recipe with ID ${id} not found or expired.`, { status: 404 });
    }

    const htmlContent = recipeStore.get(id);
    
    // Clean up after the first GET request as Mealie should have scraped it.
    // Use a small timeout to ensure the response is sent before deleting.
    setTimeout(() => {
        recipeStore.delete(id);
    }, 1000); 

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('Error in recipe GET route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
