// This module must not import any external dependency. It must be runnable without a package.json
import { defineConfig, mergeConfig } from "vite";
import type { PackageType } from "../types.js";
import { prettyStringify } from '../utils.js';

const _default = (packageType:PackageType):string=>{
	
	const baseConfig = defineConfig({
			build: {
				outDir: '${prodFolderName}',
				minify: 'esbuild',
			}
		});
	const ssrConfig = defineConfig(packageType !== 'AppClient'?{
			build:{
				ssr: './esm.index.ts'
			},
			ssr: {
				noExternal: true,
			}
		}:{})
	const config = mergeConfig(
		 baseConfig,ssrConfig, false
		)
	

	return `/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig(${prettyStringify(config)});`;
}

export default _default