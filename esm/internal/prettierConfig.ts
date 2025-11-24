// This module must not import any external dependency. It must be runnable without a package.json
export default `import type { Config } from 'prettier';

export default {
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  plugins: ['prettier-plugin-jsdoc'],
} satisfies Config;`;
