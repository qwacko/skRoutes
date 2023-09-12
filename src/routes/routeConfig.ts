import { createURLGenerator } from '$lib/skNavHelper.js';
import { z } from 'zod';

export const { pageStoreURLInfo, urlGenerator, serverLoadValidation } = createURLGenerator({
	config: {
		'/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		},
		'/server/[id]': {
			paramsValidation: z.object({ id: z.string() }).parse
		}
	},
	errorURL: '/error'
});
