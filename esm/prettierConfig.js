// Whatever external package this file uses must be added as peerDependency
import { allJsFiles } from './constants.js';
/** @import {Config} from "prettier" */

/** @type Config */
export default {
  printWidth: 100,
  overrides: [
    {
      files: allJsFiles,
      options: {
        singleQuote: true,
        experimentalTernaries: true,
        experimentalOperatorPosition: 'start',
        jsdocCapitalizeDescription: false,
        plugins: ['prettier-plugin-jsdoc'],
      },
    },
  ],
};
