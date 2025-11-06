// This module must not import any external dependency. It must be runnable without a package.json
import type { PackageType, Record } from "../types.js";
import { deepMerge, prettyStringify } from '../utils.js';

const _default = (packageType:PackageType):string=>{
	
	const baseConfig:Record = {
			build: {
				outDir: '${prodFolderName}',
				minify: 'esbuild',
			}
		};
	const ssrConfig:Record = packageType !== 'AppClient'?{
			build:{
				ssr: './esm.index.ts'
			},
			ssr: {
				noExternal: true,
			}
		}:{}
	const config = deepMerge(
		 baseConfig,ssrConfig
		)
	

	return `/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig(${prettyStringify(config)});`;
}

export default _default