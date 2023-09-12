export const objectToSearchParams = (obj: Record<string, unknown>): URLSearchParams => {
	const urlSearchParams = new URLSearchParams();

	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			urlSearchParams.append(key, value.toString());
			return;
		}
		urlSearchParams.append(key, JSON.stringify(value));
	});

	return urlSearchParams;
};

export const getUrlParams = (query: string): Record<string, unknown> =>
	Array.from(new URLSearchParams(query)).reduce((p, [k, v]) => {
		try {
			const newValue: unknown = JSON.parse(v);
			return { ...p, [k]: newValue };
		} catch {
			return { ...p, [k]: v };
		}
	}, {} as Record<string, unknown>);
