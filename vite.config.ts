import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { skRoutesPlugin } from './src/lib/vite-plugin-skroutes.js';

export default defineConfig({
	plugins: [
		sveltekit(), 
		skRoutesPlugin({
			imports: ["import { z } from 'zod';"],
			errorURL: '/error'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
