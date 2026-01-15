import {
  allJavaScriptFiles,
  filesGeneratedByThirdParties,
  foldersGeneratedByThirdParties,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  $schema: './node_modules/oxlint/configuration_schema.json',
  ignorePatterns: [
    ...foldersGeneratedByThirdParties.map((folderName) => `${folderName}/**`),
    ...filesGeneratedByThirdParties,
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    pedantic: 'error',
    perf: 'error',
    style: 'error',
    restriction: 'error',
    nursery: 'error',
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        category: 'category',
      },
    },
  },
  overrides: [
    {
      files: allJavaScriptFiles,
      plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'jsdoc', 'promise'],
      rules: {
        'class-methods-use-this': 'off',
        curly: 'off',
        // Enforce function names for better stack traces except for generators
        'func-names': ['error', 'as-needed', { generators: 'never' }],
        'func-style': 'off',
        'id-length': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-params': 'off',
        'max-statements': 'off',
        'new-cap': 'off',
        'no-await-expression-member': 'off',
        'no-console': 'off',
        'no-inline-comments': 'off',
        'no-magic-numbers': 'off',
        'no-negated-condition': 'off',
        'no-nested-ternary': 'off',
        'no-rest-spread-propertiess': 'off',
        'no-ternary': 'off',
        // We want to allow types and variables with same names
        'no-redeclare': 'off',
        'no-undefined': 'off',
        'prefer-template': 'off',
        'sort-keys': 'off',

        'import/consistent-type-specifier-style': 'off',
        'import/max-dependencies': 'off',
        'import/no-anonymous-default-export': 'off',
        'import/no-default-export': 'off',
        'import/no-namespace': 'off',

        'jsdoc/require-param': 'off',
        'jsdoc/require-returns': 'off',

        'oxc/no-async-await': 'off',
        'oxc/no-map-spread': 'off',
        'oxc/no-rest-spread-properties': 'off',

        'unicorn/catch-error-name': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/no-anonymous-default-export': 'off',
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-nested-ternary': 'off',

        '@typescript-eslint/array-type': ['error', { default: 'generic' }],
        '@typescript-eslint/consistent-indexed-object-style': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          { ignoreArrowShorthand: true },
        ],
        '@typescript-eslint/no-empty-interface': 'off',
        // We want to be able to use an empty object type in interfaces that specialize a generic type
        '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
        // We want to be able to use namespaces
        '@typescript-eslint/no-namespace': 'off',
        // Useful to avoid using the `any` type
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/promise-function-async': 'off',
      },
    },
  ],
} satisfies ReadonlyRecord;
