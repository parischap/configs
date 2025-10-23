import { type ConfigObject } from '@eslint/core';
import globals from 'globals';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';
import { allProjectJsFiles } from './projectConfig/constants.js';

const _default: Array<ConfigObject> = [
  ...eslintInternalConfigBase,
  {
    files: allProjectJsFiles,
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },
];

export default _default;
