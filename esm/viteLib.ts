import { readFilesRecursively } from '@parischap/configs/Utils';
import { type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import namedImportsVitePlugin from './internal/exported-utils/NamedImportsVitePlugin.js';
import {
  internalFolderName,
  javaScriptExtensions,
  prodFolderName,
  sourceFolderName,
} from './internal/shared-utils/constants.js';

export const config =
  ({ buildMethod, isPublished }: { readonly buildMethod: string; readonly isPublished: boolean }) =>
  async (): Promise<UserConfig> => {
    const bundleInternalFiles = buildMethod === 'LightBundling' || buildMethod === 'DeepBundling';
    const entry = (
      await readFilesRecursively({
        path: sourceFolderName,
        foldersToExclude: bundleInternalFiles ? [internalFolderName] : [],
        dontFailOnInexistentPath: false,
      })
    )
      .filter(({ extension }) => javaScriptExtensions.includes(extension))
      .map(({ path }) => path);

    return {
      plugins: [namedImportsVitePlugin, dts()],
      build: {
        lib: {
          entry,
          formats: isPublished ? ['es', 'cjs'] : ['es'],
          fileName: (format, entryName) =>
            `${format === 'es' ? sourceFolderName : 'cjs'}/${entryName}.js`,
        },
        sourcemap: true,
        target: 'esnext',
        outDir: prodFolderName,
        rolldownOptions: {
          external: (id) => !bundleInternalFiles || !id.startsWith(`./${internalFolderName}`),
          output: { chunkFileNames: `cjs/[name]-[hash].js` },
        },
        copyPublicDir: false,
      },
      clearScreen: false,
    };
  };
