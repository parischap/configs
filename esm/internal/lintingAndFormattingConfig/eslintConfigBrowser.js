// Whatever external package this file uses must be added as peerDependency
import globals from 'globals';
import { allProjectJsFiles } from '../projectConfig/constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

/**
 * @import { ConfigObject} from "@eslint/core"
 * @typedef {Array<ConfigObject>} ConfigArray
 */

/**
 * @type ConfigArray
 */
export default [
  ...eslintInternalConfigBase,
  {
    files: allProjectJsFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
