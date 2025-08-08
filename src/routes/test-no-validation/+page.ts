// Test route with no validation properties at all
export const _routeConfig = {
	// Empty config object - no paramsValidation or searchParamsValidation
};

export const load = () => {
	return {
		message: 'This route has no validation'
	};
};