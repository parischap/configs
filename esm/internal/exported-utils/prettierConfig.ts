/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import type { Config } from 'prettier';

export default {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-jsdoc'],
} satisfies Config;
