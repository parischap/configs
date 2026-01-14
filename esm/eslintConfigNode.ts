import { eslintStyleIncludeForSourceFiles } from './internal/shared-utils/constants.js';

//import { importX } from 'eslint-plugin-import-x';
import { defineConfig, type Config } from 'eslint/config';
import globals from 'globals';
import EslintConfigPlain from './eslintConfigPlain.js';

export default (params: { readonly tsconfigRootDir: string }): Array<Config> =>
  defineConfig([
    ...EslintConfigPlain(params),
    {
      files: eslintStyleIncludeForSourceFiles,
      name: 'javascriptConfigSourceFiles',
      languageOptions: {
        globals: globals.nodeBuiltin,
      },
    },
  ]);
