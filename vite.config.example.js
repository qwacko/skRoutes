import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { skRoutesPlugin } from 'skroutes/plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		skRoutesPlugin({
			unconfiguredParams: 'never',
			unconfiguredSearchParams: 'never'
		})
	],
	define: {
		// Optional: Define any global constants here
	},
	server: {
		allowedHosts: true
	}
});
