import { skRoutes } from '$lib/skRoutes.js';
import { z } from 'zod';

export const { pageInfo, urlGenerator, serverPageInfo, pageInfoStore } = skRoutes({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() })
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }),
			searchParamsValidation: z.object({ data: z.string().optional() })
		},
		'/store/[id]/': {
			paramsValidation: z.object({ id: z.string() }),
			searchParamsValidation: z
				.object({
					topLevel: z.string().optional(),
					nested: z
						.object({ item1: z.string().optional(), item2: z.string().optional() })
						.optional()
				})
				.optional()
				.catch({})
		}
	},
	errorURL: '/error'
});
