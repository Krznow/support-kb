import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Build of the support kb: .svx pages (Markdown with components) in src/routes/kb,
// framed by src/lib/layouts/runbook.svelte, prerendered to static HTML.
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ strict: false }),
      extensions: ['.svelte', '.svx'],
      inlineStyleThreshold: 1_000_000,
      preprocess: [
        mdsvex({
          extensions: ['.svx'],
          layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
        }),
        vitePreprocess(),
      ],
    }),
  ],
});
