import { serverPageInfo } from '$lib/auto-skroutes.js';
import { z } from 'zod';

// Define schemas locally in the page file using underscore prefix (SvelteKit allows this)
export const _paramsSchema = z.object({
	id: z.string()
});

export const _searchParamsSchema = z.object({
	data: z.string(),
	date: z.date().optional()
});

export const load = (data) => {
	const { current: urlData } = serverPageInfo('/server/[id]', data);

	// Test type checking - urlData.params should be typed as { id: string }
	// and urlData.searchParams should be typed as { data: string }
	console.log('Param ID (typed):', urlData.params.id);
	console.log('Search param data (typed):', urlData.searchParams.data);

	return {
		params: urlData.params,
		searchParams: urlData.searchParams
	};
};
