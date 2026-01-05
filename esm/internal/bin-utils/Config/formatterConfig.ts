import { type Config } from 'prettier';

export const config: Config = {
  //$schema: './node_modules/oxfmt/configuration_schema.json',
  printWidth: 100,
  singleQuote: true,
  experimentalTernaries: true,
  experimentalOperatorPosition: 'start',
  jsdocCapitalizeDescription: false,
  //embeddedLanguageFormatting: 'auto',
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-jsdoc'],
};
