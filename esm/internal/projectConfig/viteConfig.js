// This file must not import anything external
import { prodFolderName } from './constants.js';

export default `/// <reference types="vitest" />
import { defineConfig } from 'vite';

// Exports a config that is used to bundle ts files meant to be executed in a node context. esnext is a good target in that situation
export default defineConfig({
	build: {
		outDir: '${prodFolderName}',
		sourcemap: true,
		target: 'esnext',
		minify: 'esbuild',
		emptyOutDir: false,
		copyPublicDir: false,
	},
	clearScreen: false,
	ssr: {
		noExternal: true,
	},
	test: {
		include: ['./tests/*.test.ts'],
		isolate: false,
		fileParallelism: false,
		pool: 'threads'
	}
});`;
