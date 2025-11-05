// Whatever external package this file uses must be added as peerDependency
import eslint from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig, globalIgnores, type Config } from 'eslint/config';
import globals from 'globals';

import tseslint from 'typescript-eslint';
import {
  allHtmlFiles,
  allJsFiles,
  allJsInMdFiles,
  allJson5Files,
  allJsoncFiles,
  allJsonFiles,
  allMdFiles,
  allYmlFiles,
  prodFolderName,
  projectFolderName,
  viteTimeStampFilenamePattern,
} from './constants.js';

interface ConfigArray extends ReadonlyArray<Config> {}

const typescriptConfigs:ConfigArray = defineConfig(eslint.configs.recommended, {
  // Add no rules here because they might get overridden by the typedTypescriptConfig
  name: 'typescriptConfig',
  // Add html plugin so we can lint template literals inside javascript code
  plugins: { functional:  functional as never, html:html as never},
  extends: [
    functional.configs.strict as never,
    functional.configs.stylistic as never,
  ],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { impliedStrict: true },
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
});

const untypedTypescriptConfigs:ConfigArray = defineConfig(
  // The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs. Add no rules here because they might get overridden by the typedTypescriptConfig
  tseslint.configs.strict,
  {
    name: 'untypedTypescriptConfigs',
    extends: [functional.configs.disableTypeChecked as never],
  },
);

const typedTypescriptConfigs:ConfigArray = defineConfig(
  // The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs
  tseslint.configs.strictTypeChecked,
  {
    name: 'typedTypescriptConfig',
    extends: [
      // These rules require typeChecking and are not cancelled by functional.configs.disableTypeChecked
      functional.configs.externalTypeScriptRecommended as never,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    /**
     * Rules that require type-information can only be modified in that config (type information is
     * unavailable in other configs)
     */
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      '@typescript-eslint/no-unnecessary-type-parameters': 'off', // Useful to avoid using any
      'functional/immutable-data': 'error',
      /**
       * I did not manage to make prefer-immutable-types work because Effect.Option and
       * Effect.Either are mutable. I did note manage to use global settings to force these types to
       * Immutable
       */
      'functional/prefer-immutable-types': 'off',
      'functional/type-declaration-immutability': 'off',
      'functional/no-expression-statements': [
        'error',
        {
          ignoreCodePattern: [
            'process\\.exit\\(',
            'super\\(',
            '.+\n+satisfies\n+.+',
            'Layer\\.launch\\(',
          ],
        },
      ],
      'functional/prefer-property-signatures': 'error',
      'functional/prefer-tacit': 'error',
      'functional/functional-parameters': [
        'error',
        { allowRestParameter: true, allowArgumentsKeyword: false, enforceParameterCount: false },
      ],
      'functional/no-return-void': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-mixed-types': 'off',
      'functional/readonly-type': ['error', 'keyword'],
    },
  },
);

const javascriptRulesMitigationConfigs:ConfigArray = defineConfig({
  name: 'untypedJavascriptRulesMitigationConfigs',
  // Here, we modify rules that don't require type information
  rules: {
    'no-redeclare': 'off', // We want to allow types and variables with same names
    '@typescript-eslint/no-namespace': 'off', // We want to be able to use namespaces
    //'@typescript-eslint/only-throw-error': 'off', // Effect has its own error management
    '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    //'codegen/codegen': 'error',
    //'sort-destructure-keys/sort-destructure-keys': 'error',
    'functional/no-this-expressions': 'off',
    'functional/no-classes': 'off',
    'functional/no-class-inheritance': 'off',
    // Add html rules so we can lint template literals inside javascript code
    ...html.configs.recommended.rules,
    //'import/no-extraneous-dependencies': 'off'
  },
});

const htmlConfigs:ConfigArray = defineConfig({
  name: 'htmlConfig',
  plugins: {
    html:html as never,
  },
  extends: ['html/recommended'],
  language: 'html/html',
  rules: {
    '@html-eslint/require-closing-tags': ['error', { selfClosing: 'always' }],
  },
});

const ymlConfigs:ConfigArray = defineConfig(
  eslintPluginYml.configs['flat/recommended'] as never,
  {
    name: 'ymlConfig',
    rules: {
      'yml/no-empty-mapping-value': 'off',
    },
  },
);

const markdownConfigs:ConfigArray = defineConfig([
  {
    name: 'mdConfig',
    plugins: {
      markdown,
    },
    extends: ['markdown/recommended', 'markdown/processor'],
    rules: {},
  },
]);

const jsonConfigs:ConfigArray = defineConfig({
  ignores: ['package-lock.json'],
  plugins: { json: json as never },
  language: 'json/json',
  extends: ['json/recommended'],
});

const jsoncConfigs:ConfigArray = defineConfig({
  plugins: { json:json as never },
  language: 'json/jsonc',
  extends: ['json/recommended'],
});

const json5Configs:ConfigArray = defineConfig({
  plugins: { json:json as never },
  language: 'json/json5',
  extends: ['json/recommended'],
});

/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 *
 */

const scopeConfig = ({ configs, files, ignores = [] }:{
 readonly configs: ConfigArray;
 readonly files: ReadonlyArray<string>;
 readonly ignores?: ReadonlyArray<string>;
 }) => configs.map((config) => ({
    ...config,
    files: [...files],
    ignores: [...ignores],
  }));

const untypedJsFiles = allJsInMdFiles;

const _default:ConfigArray =  defineConfig([
  // This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
  globalIgnores([prodFolderName + '/', viteTimeStampFilenamePattern], 'ignoreConfig'),
  scopeConfig({ configs: typescriptConfigs, files: allJsFiles }),
  scopeConfig({ configs: untypedTypescriptConfigs, files: untypedJsFiles }),
  scopeConfig({
    configs: typedTypescriptConfigs,
    files: allJsFiles,
    /**
     * We don't perform typed checks in js files inside md files because types are usually
     * unavailable (imports are not analyzed) and there are issues with virtual **.md/*.ts files
     * created by typesscript-eslint which the tsconfig file does not cover. Such files could be
     * ignored by using the `allowDefaultProject` property but that would slow down linting too
     * much. See typescript-eslint FAQ
     */
    ignores: untypedJsFiles,
  }),
  scopeConfig({ configs: javascriptRulesMitigationConfigs, files: allJsFiles }),
  {
    name: 'typescriptConfigForOtherFiles',
    files: allJsFiles,
    ignores: [projectFolderName + '/**'],
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
    // Here, we can mitigate rules that don't require type information in other files
    rules: {},
  },
  {
    name: 'typedTypescriptConfigForOtherFiles',
    files: allJsFiles,
    ignores: [projectFolderName + '/**', ...untypedJsFiles],
    // Here, we can mitigate rules that require type information in other files
    rules: {
      // Let's allow console.log in setting files and assertions in test files
      'functional/no-expression-statements': [
        'error',
        {
          ignoreCodePattern: [
            'process\\.exit',
            'super\\(',
            'expect\\(',
            'describe\\(',
            'it\\(',
            'TEUtils\\.',
            'console\\.log\\(',
            '.+\n+satisfies\n+.+',
            'Layer\\.launch\\(',
          ],
        },
      ],
    },
  },
  scopeConfig({ configs: htmlConfigs, files: allHtmlFiles }),
  scopeConfig({ configs: ymlConfigs, files: allYmlFiles }),
  scopeConfig({ configs: markdownConfigs, files: allMdFiles }),
  scopeConfig({ configs: jsonConfigs, files: allJsonFiles }),
  scopeConfig({ configs: jsoncConfigs, files: allJsoncFiles }),
  scopeConfig({ configs: json5Configs, files: allJson5Files }),
  // Do not specify a files directive. We want to cancel eslint rules for all types of files: *.js, *.ts, *.html...
  eslintConfigPrettier,
]);

export default _default;