// This module must not import any external dependency. It must be runnable without a package.json
import type { ReadonlyRecord } from '../types.js';
import { deepMerge, prettyStringify } from '../utils.js';

export default (buildMethod: string): string => {
  const baseConfig: ReadonlyRecord = {
    build: {
      outDir: '${prodFolderName}',
      minify: 'esbuild',
    },
  };
  const ssrConfig: ReadonlyRecord =
    buildMethod !== 'AppClient' ?
      {
        build: {
          ssr: './esm.index.ts',
        },
        ssr: {
          noExternal: true,
        },
      }
    : {};
  const config = deepMerge(baseConfig, ssrConfig);

  return `/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig(${prettyStringify(config)});`;
};
