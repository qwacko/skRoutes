import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { skRoutesPlugin } from 'skroutes/plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		skRoutesPlugin()
	],
	define: {
		// Optional: Define any global constants here
	}
});