import { routeInfo, type RouteParams, type RouteSearchParams } from './auto-skroutes.js';

// Example: Using route validation outside of page components
export function validateUserInput() {
  // Get the validators for a specific route
  const serverRouteInfo = routeInfo('/server/[id]');
  const apiRouteInfo = routeInfo('/api/users/[id]');

  // Access validators directly for external validation
  const serverParamsValidator = serverRouteInfo.paramsValidator;
  const serverSearchParamsValidator = serverRouteInfo.searchParamsValidator;
  
  const apiParamsValidator = apiRouteInfo.paramsValidator;
  const apiSearchParamsValidator = apiRouteInfo.searchParamsValidator;

  // Use validators in your logic
  try {
    const serverParamsResult = serverParamsValidator!['~standard'].validate({ id: 'test123' });
    console.log('Server params valid:', serverParamsResult);
    
    const apiParamsResult = apiParamsValidator!['~standard'].validate({ id: 'invalid-uuid' });
    console.log('API params result:', apiParamsResult);
  } catch (error) {
    console.error('Validation error:', error);
  }

  // Type-only usage examples
  type ServerParams = RouteParams<'/server/[id]'>; // { id: string }
  type ServerSearchParams = RouteSearchParams<'/server/[id]'>; // { data: string, date?: Date }
  
  type ApiParams = RouteParams<'/api/users/[id]'>; // { id: string } (with UUID validation)
  type ApiSearchParams = RouteSearchParams<'/api/users/[id]'>; // { include?: string[], format: 'json' | 'xml' }

  // You can use these types in your functions
  function processServerData(params: ServerParams, searchParams: ServerSearchParams) {
    console.log(`Processing server data for ID: ${params.id}`);
    console.log(`Data: ${searchParams.data}`);
    if (searchParams.date) {
      console.log(`Date: ${searchParams.date.toISOString()}`);
    }
  }

  function processApiData(params: ApiParams, searchParams: ApiSearchParams) {
    console.log(`Processing API data for UUID: ${params.id}`);
    console.log(`Format: ${searchParams.format}`);
    if (searchParams.include) {
      console.log(`Includes: ${searchParams.include.join(', ')}`);
    }
  }

  return {
    serverParamsValidator,
    serverSearchParamsValidator,
    apiParamsValidator,
    apiSearchParamsValidator,
    processServerData,
    processApiData
  };
}