// This module must not import any external dependency. It must be runnable without a package.json
import { deepMerge } from '../utils.js';
/** @import {PackageType} from "../types.js" */
/** @import {UserConfig} from "vite" */


/**
 * @param {PackageType} packageType
 * @returns {string}
 */
export default (packageType)=>{
	/** @type {UserConfig} */
	const ssrConfig = packageType !== 'AppClient'?{
			build:{
				ssr: './esm.index.ts'
			},
			ssr: {
				noExternal: true,
			}
		}:{}
	const config = deepMerge(
		{
			build: {
				outDir: '${prodFolderName}',
				minify: 'esbuild',
			},
			test: {
				include: ['./${testsFolderName}/*.test.ts'],
				isolate: false,
				fileParallelism: false,
				pool: 'threads'
			}
		},ssrConfig
		)
	

	return `/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig(${JSON.stringify(config,null,2)});`;
}
