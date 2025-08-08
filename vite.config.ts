import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { skRoutesPlugin } from './src/lib/vite-plugin-skroutes.js';

export default defineConfig({
	plugins: [
		sveltekit(),
		skRoutesPlugin({
			imports: [],
			errorURL: '/error'
			// Using new defaults: unconfiguredParams: 'deriveParams', unconfiguredSearchParams: 'never'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/test-setup.ts']
	},
	server: {
		allowedHosts: true
	}
});
