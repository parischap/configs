import {
  allJavaScriptExtensions,
  prodFolderName,
  sourceFolderName,
} from '@parischap/configs/Constants';
import namedImportsVitePlugin from '@parischap/configs/NamedImportsVitePlugin';
import { readFilesRecursively } from '@parischap/configs/Utils';
import { defineConfig } from 'vite';

const entry = (
  await readFilesRecursively({
    path: sourceFolderName,
    foldersToExclude: [],
    dontFailOnInexistentPath: false,
  })
)
  .filter(({ extension }) => allJavaScriptExtensions.includes(extension))
  .map(({ path }) => path);

export const config = defineConfig({
  plugins: [namedImportsVitePlugin],
  build: {
    lib: {
      entry,
      fileName: (format, entryName) =>
        `${format === 'es' ? sourceFolderName : 'cjs'}/${entryName}.js`,
    },
    sourcemap: true,
    target: 'esnext',
    outDir: prodFolderName,
    rolldownOptions: {
      external: () => true,
      output: { chunkFileNames: `cjs/[name]-[hash].js` },
    },
    copyPublicDir: false,
  },
  clearScreen: false,
});
