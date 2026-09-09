import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		paths: { base: dev ? '' : '/YOUR_REPO_NAME' }
	},
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx']
};
