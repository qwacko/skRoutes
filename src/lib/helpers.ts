import { isObject } from 'lodash-es';

function pruneUndefined(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	Object.keys(obj).forEach((key) => {
		const value = obj[key];
		if (Array.isArray(value)) {
			// Directly map arrays without modification
			result[key] = value;
		} else if (typeof value === 'object' && value !== null) {
			// Recursively prune sub-objects
			result[key] = pruneUndefined(value as Record<string, unknown>);
		} else if (value !== undefined) {
			// Copy value if it's not undefined
			result[key] = value;
		}
	});

	return result;
}

export const objectToSearchParams = (objIn: Record<string, unknown>): URLSearchParams => {
	const urlSearchParams = new URLSearchParams();

	const obj = pruneUndefined(objIn);

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
	Array.from(new URLSearchParams(query)).reduce(
		(p, [k, v]) => {
			try {
				const newValue: unknown = JSON.parse(v);
				return { ...p, [k]: newValue };
			} catch {
				return { ...p, [k]: v };
			}
		},
		{} as Record<string, unknown>
	);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function customMerge<T extends Record<string, any>, U extends Record<string, any>>(
	obj1: T,
	obj2: U
): T {
	const result: Partial<T> = {};

	Object.keys(obj1).forEach((key) => {
		const typedKey = key as keyof typeof obj1;
		if (
			isObject(obj1[typedKey]) &&
			Object.prototype.hasOwnProperty.call(obj2, key) &&
			isObject(obj2[key as keyof typeof obj2])
		) {
			// Ensure that the type is correctly handled
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKey] = customMerge(obj1[typedKey], obj2[key as keyof typeof obj2] as any) as any;
		} else {
			result[typedKey] = obj1[typedKey];
		}
	});

	Object.keys(obj2).forEach((key) => {
		const typedKey = key as keyof typeof obj2;
		const typedKeyReturn = key as keyof typeof result;
		if (Array.isArray(obj2[typedKey])) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKeyReturn] = obj2[typedKey] as any;
		} else if (obj2[typedKey] === undefined) {
			delete result[typedKeyReturn];
		} else if (!(key in obj1) || obj1[key as keyof typeof obj1] !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[typedKeyReturn] = obj2[typedKey] as any;
		}
	});

	return result as T;
}
