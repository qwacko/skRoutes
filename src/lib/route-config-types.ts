import type { StandardSchemaV1 } from '@standard-schema/spec';

// Route configuration for individual routes using StandardSchema
export interface RouteConfigDefinition<
	ParamsSchema extends StandardSchemaV1 = StandardSchemaV1,
	SearchParamsSchema extends StandardSchemaV1 = StandardSchemaV1
> {
	// Schema definitions
	paramsValidation?: ParamsSchema;
	searchParamsValidation?: SearchParamsSchema;

	// Error handling functions - accepting any return type for now
	// TODO: Future enhancement could try to infer types from StandardSchema
	onParamsError?: (
		error: StandardSchemaV1.FailureResult,
		rawParams: Record<string, string>
	) => Response | { redirect: string } | { params: any } | void;

	onSearchParamsError?: (
		error: StandardSchemaV1.FailureResult,
		rawSearchParams: Record<string, string | string[]>
	) => Response | { redirect: string } | { searchParams: any } | void;

	// Optional metadata
	meta?: {
		title?: string;
		description?: string;
		tags?: string[];
		[key: string]: any;
	};
}

// Helper type alias for route configs
export type RouteConfig<
	ParamsSchema extends StandardSchemaV1 = StandardSchemaV1,
	SearchParamsSchema extends StandardSchemaV1 = StandardSchemaV1
> = RouteConfigDefinition<ParamsSchema, SearchParamsSchema>;
