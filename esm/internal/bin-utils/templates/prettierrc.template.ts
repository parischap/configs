import type { Config } from 'prettier';

export default {
  experimentalOperatorPosition: 'start',
  experimentalTernaries: true,
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-jsdoc'],
  printWidth: 100,
  singleQuote: true,
} satisfies Config;
