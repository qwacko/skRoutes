import { serverLoadValidation } from '../../routeConfig.js';

export const load = (data) => {
	const urlData = serverLoadValidation(data);

	return urlData;
};
