import { serverPageInfo } from '$lib/auto-skroutes.js';
import { z } from 'zod';

// Define schemas locally in the page file using underscore prefix (SvelteKit allows this)
export const _paramsSchema = z.object({
	id: z.string()
});

export const _searchParamsSchema = z.object({
	data: z.string()
});

export const load = (data) => {
	const { current: urlData } = serverPageInfo('/server/[id]', data);

	return urlData;
};
