import { serverPageInfo } from '../../routeConfig.js';

export const load = (data) => {
	const urlData = serverPageInfo(data);

	return urlData;
};
