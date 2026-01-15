import { allJavaScriptFilesInSource } from './internal/shared-utils/constants.js';

//Import { importX } from 'eslint-plugin-import-x';
import { type Config, defineConfig } from 'eslint/config';
import globals from 'globals';
import EslintConfigPlain from './eslintConfigPlain.js';

export default (params: { readonly tsconfigRootDir: string }): Array<Config> =>
  defineConfig([
    ...EslintConfigPlain(params),
    {
      files: allJavaScriptFilesInSource,
      languageOptions: {
        globals: globals.nodeBuiltin,
      },
      name: 'javascriptConfigSourceFiles',
    },
  ]);
