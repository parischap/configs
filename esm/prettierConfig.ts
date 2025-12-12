/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag because this is how Prettier loads it configuration file when it is in Typescript format */
import type { Config } from 'prettier';

export const config = {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-jsdoc'],
} satisfies Config;
