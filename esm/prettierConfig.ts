// Whatever external package this file uses must be added as peerDependency
import type { Config } from 'prettier';
const _default: Config = {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-jsdoc'],
};

export default _default;
