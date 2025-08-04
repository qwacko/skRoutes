import { json } from '@sveltejs/kit';
import { z } from 'zod';

// Define schemas locally in the server file using underscore prefix (SvelteKit allows this)
export const _paramsSchema = z.object({
  id: z.string().uuid()
});

export const _searchParamsSchema = z.object({
  include: z.array(z.string()).optional(),
  format: z.enum(['json', 'xml']).default('json')
});

export async function GET({ params, url }) {
  // This would be properly typed if we used serverPageInfo here
  return json({
    userId: params.id,
    query: Object.fromEntries(url.searchParams)
  });
}