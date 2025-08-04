import { serverPageInfo } from '$lib/auto-skroutes.js';
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

export async function GET(data) {
	const { current: urlInfo } = serverPageInfo('/server/[id]', data);
	// This would be properly typed if we used serverPageInfo here
	return json({
		userId: urlInfo.params.id,
		query: urlInfo.searchParams
	});
}
