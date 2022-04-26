import adapter from "@sveltejs/adapter-static";
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
  kit: {
    adapter: adapter({ fallback: "index.html" }),
    vite: {
      // default to development as a guard
      mode: process.env.MODE || "development",
    },
  }
};

export default config;
