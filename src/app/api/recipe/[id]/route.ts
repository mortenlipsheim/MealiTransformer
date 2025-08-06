// src/app/api/recipe/[id]/route.ts
import { recipeStore } from '../create/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
    try {
    const id = params.id;

    if (!id || !recipeStore.has(id)) {
      return new Response(`Recipe with ID ${id} not found or expired. Store size: ${recipeStore.size}`, { status: 404 });
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
