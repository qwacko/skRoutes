import { vi } from 'vitest';

// Mock SvelteKit globals
Object.defineProperty(globalThis, '__SVELTEKIT_PAYLOAD__', {
	value: { data: {} },
	writable: true
});

// Mock SvelteKit's goto function
vi.mock('$app/navigation', () => ({
	goto: vi.fn(() => Promise.resolve()),
	invalidate: vi.fn(() => Promise.resolve()),
	invalidateAll: vi.fn(() => Promise.resolve()),
	preloadData: vi.fn(() => Promise.resolve()),
	preloadCode: vi.fn(() => Promise.resolve())
}));

// Mock browser environment
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: 'test'
}));
