import { slashedScope } from '../../shared-utils/constants.js';

export default {
  $schema: './node_modules/oxfmt/configuration_schema.json',
  experimentalSortImports: {
    groups: [
      '^[./]',
      `^${slashedScope}`,
      '^effect',
      '^@effect/',
      '<BUILTIN_MODULES>',
      '<THIRD_PARTY_MODULES>',
    ],
  },
  printWidth: 100,
  singleQuote: true,
};
