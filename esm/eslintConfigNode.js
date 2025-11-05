// Whatever external package this file uses must be added as peerDependency
import globals from 'globals';
import { allProjectJsFiles } from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

/**
 * @typedef {ConfigObject[]} ConfigArray
 * @import {ConfigObject} from "@eslint/core"
 */

/** @type ConfigArray */
export default [
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
