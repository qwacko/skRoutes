import { serverPageInfo } from '../../routeConfig.js';

export const load = (data) => {
	const urlData = serverPageInfo('/server/[id]', data);

	return urlData;
};
