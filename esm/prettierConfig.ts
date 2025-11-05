// Whatever external package this file uses must be added as peerDependency
import type { Config } from "prettier";
import { allJsFiles } from './constants.js';
const _default:Config = {
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

export default _default