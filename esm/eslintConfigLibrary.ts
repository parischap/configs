// Whatever external package this file uses must be added as peerDependency
import { type Config } from 'eslint/config';
import globals from 'globals';
import { allProjectJsFiles } from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

const _default:ReadonlyArray<Config> = [
  ...eslintInternalConfigBase,
  {
    files: allProjectJsFiles,
    languageOptions: {
      globals: {
        ...globals['shared-node-browser'],
      },
    },
  },
];

export default _default;