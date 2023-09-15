import { skRoutes } from '$lib/skRoutes.js';
import { z } from 'zod';

export const { pageInfo, urlGenerator, serverPageInfo, pageInfoStore } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse,
			searchParamsValidation: z.object({ data: z.string().optional() }).parse
		},
		'/store/[id]/': {
			paramsValidation: z.object({ id: z.string() }).parse,
			searchParamsValidation: z
				.object({
					topLevel: z.string().optional(),
					nested: z
						.object({ item1: z.string().optional(), item2: z.string().optional() })
						.optional()
				})
				.optional()
				.catch({}).parse
		}
	},
	errorURL: '/error'
});
