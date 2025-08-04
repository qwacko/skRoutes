import type { StandardSchemaV1 } from '@standard-schema/spec';

// Route configuration for individual routes using StandardSchema
export interface RouteConfigDefinition<
  ParamsSchema extends StandardSchemaV1 = StandardSchemaV1,
  SearchParamsSchema extends StandardSchemaV1 = StandardSchemaV1
> {
  // Schema definitions
  params?: ParamsSchema;
  searchParams?: SearchParamsSchema;
  
  // Error handling functions - accepting any return type for now
  // TODO: Future enhancement could try to infer types from StandardSchema
  onParamsError?: (
    error: StandardSchemaV1.FailureResult, 
    rawParams: Record<string, string>
  ) => 
    | Response 
    | { redirect: string } 
    | { params: any }
    | void;
    
  onSearchParamsError?: (
    error: StandardSchemaV1.FailureResult, 
    rawSearchParams: Record<string, string | string[]>
  ) => 
    | Response 
    | { redirect: string }
    | { searchParams: any }
    | void;
    
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

// Error handling result types
export type RouteErrorResult = 
  | Response 
  | { redirect: string }
  | { params?: any; searchParams?: any }
  | void;

// For backwards compatibility - convert old validation functions to new format
export interface LegacyRouteConfig {
  paramsValidation?: StandardSchemaV1;
  searchParamsValidation?: StandardSchemaV1;
}

// Convert legacy config to new unified format
export function convertLegacyConfig(legacy: LegacyRouteConfig): RouteConfigDefinition {
  return {
    params: legacy.paramsValidation,
    searchParams: legacy.searchParamsValidation
  };
}