import { serverPageInfo } from '../../routeConfig.js';

export const load = (data) => {
	const { current: urlData } = serverPageInfo('/server/[id]', data);

	return urlData;
};
