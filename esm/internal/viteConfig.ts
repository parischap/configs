// This module must not import any external dependency. It must be runnable without a package.json
import type { PackageType, ReadonlyRecord } from '../types.js';
import { deepMerge, prettyStringify } from '../utils.js';

const _default = (packageType: PackageType): string => {
  const baseConfig: ReadonlyRecord = {
    build: {
      outDir: '${prodFolderName}',
      minify: 'esbuild',
    },
  };
  const ssrConfig: ReadonlyRecord =
    packageType !== 'AppClient' ?
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

export default _default;
