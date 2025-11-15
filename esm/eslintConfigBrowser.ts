import { type Config } from 'eslint/config';
import globals from 'globals';
import { allProjectJsFiles } from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

export default (tsconfigRootDir: string): ReadonlyArray<Config> => [
  ...eslintInternalConfigBase(tsconfigRootDir),
  {
    files: allProjectJsFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
