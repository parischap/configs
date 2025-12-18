/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag because this is how Prettier loads it configuration file when it is in Typescript format. In case we need to import constants, use `import { XX } from '@parischap/configs/Constants';` */

import type { Config } from 'prettier';

export const config: Config = {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  /* The Prettier Plugin type allows passing a Plugin object instead of a Plugin name which would be cleaner. But when passing such an object, Prettier considers it is working in a DOM environment. So it does not work */
  plugins: ['prettier-plugin-jsdoc'],
};
