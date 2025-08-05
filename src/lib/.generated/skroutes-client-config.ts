// Auto-generated client-side config by skroutes-plugin
// This file only imports from client-side files and can be safely used in the browser
import type { StandardSchemaV1 } from '@standard-schema/spec';

// Import schema definitions from client-side page files only
import { _routeConfig as routeConfig0 } from '../../../src/routes/[id]/+page';

export const clientRouteConfig = {
	'/[id]': {
		paramsValidation: routeConfig0.paramsValidation,
		searchParamsValidation: routeConfig0.searchParamsValidation
	},
	'/': {
		paramsValidation: undefined,
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/api/users/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/error': {
		paramsValidation: undefined,
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/optional/[[slug]]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};

					result.slug = v.slug ? String(v.slug) : undefined;
					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/products/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/server/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/store/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/type-test/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	},
	'/users/[id]': {
		paramsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => {
					if (!v || typeof v !== 'object') return { value: {} };
					const result: Record<string, string | undefined> = {};
					result.id = String(v.id || '');

					return { value: result };
				}
			}
		},
		searchParamsValidation: {
			'~standard': {
				version: 1,
				vendor: 'skroutes',
				validate: (v: any) => ({ value: v || {} })
			}
		}
	}
} as const;

// Export route keys for type checking
export type RouteKeys =
	| '/[id]'
	| '/'
	| '/api/users/[id]'
	| '/error'
	| '/optional/[[slug]]'
	| '/products/[id]'
	| '/server/[id]'
	| '/store/[id]'
	| '/type-test/[id]'
	| '/users/[id]';

// Export type mapping for schema inference
export type RouteTypeMap = {
	'/[id]': {
		params: StandardSchemaV1.InferOutput<typeof routeConfig0.paramsValidation>;
		searchParams: StandardSchemaV1.InferOutput<typeof routeConfig0.searchParamsValidation>;
	};
	'/': { params: Record<string, string>; searchParams: Record<string, unknown> };
	'/api/users/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
	'/error': { params: Record<string, string>; searchParams: Record<string, unknown> };
	'/optional/[[slug]]': { params: { slug?: string }; searchParams: Record<string, unknown> };
	'/products/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
	'/server/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
	'/store/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
	'/type-test/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
	'/users/[id]': { params: { id: string }; searchParams: Record<string, unknown> };
};

// Convenience type aliases for accessing route param/search param types
export type RouteParams<T extends RouteKeys> = RouteTypeMap[T]['params'];
export type RouteSearchParams<T extends RouteKeys> = RouteTypeMap[T]['searchParams'];

// Re-export types for convenience
export type { RouteConfig } from '../skRoutes.svelte.js';

// Export plugin options for reference
export const pluginOptions = {
	errorURL: '/error'
};
