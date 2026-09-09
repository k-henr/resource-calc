// import adapter from '@sveltejs/adapter-auto';
// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	compilerOptions: {
// 		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
// 		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
// 	},
// 	kit: {
// 		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
// 		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
// 		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
// 		adapter: adapter()
// 	}
// };
// export default config;
// The above was replaced by the below to host on GHP, undo when no longer using GHP
import adapter from '@sveltejs/adapter-static';

import { mdsvex } from 'mdsvex';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: { adapter: adapter(), paths: { base: '' } },
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx']
};
