import { universalPageInfo } from '$lib/auto-skroutes-universal';

// Test route with no validation properties at all
export const _routeConfig = {
	// Empty config object - no paramsValidation or searchParamsValidation
};

export const load = (data) => {
	return {
		message: 'This route has no validation'
	};
};
