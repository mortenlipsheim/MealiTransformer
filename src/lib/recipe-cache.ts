
// A simple in-memory cache to store recipe HTML for a short period.
// In a production environment with multiple server instances, you would
// replace this with a distributed cache like Redis or Memcached.

const cache = new Map<string, string>();
const TTL = 5 * 60 * 1000; // 5 minutes

export function setRecipeHtml(id: string, html: string): void {
  cache.set(id, html);
  // Automatically remove the entry after TTL
  setTimeout(() => {
    cache.delete(id);
  }, TTL);
}

export function getRecipeHtml(id: string): string | undefined {
  return cache.get(id);
}
