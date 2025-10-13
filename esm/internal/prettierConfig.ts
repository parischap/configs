import { type Config } from 'prettier';
import * as constants from './constants.js';

const _default: Config = {
  printWidth: 100,
  overrides: [
    {
      files: constants.allJsFiles,
      options: {
        singleQuote: true,
        experimentalTernaries: true,
        experimentalOperatorPosition: 'start',
        plugins: ['prettier-plugin-jsdoc'],
      },
    },
  ],
};

export default _default;
