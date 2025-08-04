import { type RouteParams, type RouteSearchParams } from './auto-skroutes.js';

// Example: Using route validation outside of page components
export function validateUserInput() {
  // Type-only usage examples
  type ServerParams = RouteParams<'/server/[id]'>; // { id: string }
  type ServerSearchParams = RouteSearchParams<'/server/[id]'>; // Record<string, unknown>
  
  type ApiParams = RouteParams<'/api/users/[id]'>; // { id: string }
  type ApiSearchParams = RouteSearchParams<'/api/users/[id]'>; // Record<string, unknown>

  // You can use these types in your functions
  function processServerData(params: ServerParams, searchParams: ServerSearchParams) {
    console.log(`Processing server data for ID: ${params.id}`);
    // Note: searchParams is Record<string, unknown> so we need to cast or check types
    if (searchParams.data && typeof searchParams.data === 'string') {
      console.log(`Data: ${searchParams.data}`);
    }
    if (searchParams.date && searchParams.date instanceof Date) {
      console.log(`Date: ${searchParams.date.toISOString()}`);
    }
  }

  function processApiData(params: ApiParams, searchParams: ApiSearchParams) {
    console.log(`Processing API data for UUID: ${params.id}`);
    if (searchParams.format && typeof searchParams.format === 'string') {
      console.log(`Format: ${searchParams.format}`);
    }
    if (searchParams.include && Array.isArray(searchParams.include)) {
      console.log(`Includes: ${searchParams.include.join(', ')}`);
    }
  }

  return {
    processServerData,
    processApiData
  };
}