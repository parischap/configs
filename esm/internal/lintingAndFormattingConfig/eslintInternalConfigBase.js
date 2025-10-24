// Whatever external package this file uses must be added as peerDependency
import eslint from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig, globalIgnores } from 'eslint/config';
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
  viteTimeStampFileNamePattern,
} from '../projectConfig/constants.js';

/**
 * @import { ConfigObject} from "@eslint/core"
 * @typedef {Array<ConfigObject>} ConfigArray
 */

/**
 * @type ConfigArray
 */
const typescriptConfigs = defineConfig(eslint.configs.recommended, {
  // Add no rules here because they might get overridden by the typedTypescriptConfig
  name: 'typescriptConfig',
  // Add html plugin so we can lint template literals inside javascript code
  plugins: { functional: /** @type {never}**/(functional), html },
  extends: [/** @type {never}**/(functional.configs.strict), /** @type {never}**/(functional.configs.stylistic)],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { impliedStrict: true },
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
});

/**
 * @type ConfigArray
 */
const untypedTypescriptConfigs = defineConfig(
  // The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs. Add no rules here because they might get overridden by the typedTypescriptConfig
  tseslint.configs.strict,
  {
    name: 'untypedTypescriptConfigs',
    extends: [/** @type {never}**/(functional.configs.disableTypeChecked)],
  },
);

/**
 * @type ConfigArray
 */
const typedTypescriptConfigs = defineConfig(
  // The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs
  tseslint.configs.strictTypeChecked,
  {
    name: 'typedTypescriptConfig',
    extends: [
      // These rules require typeChecking and are not cancelled by functional.configs.disableTypeChecked
      /** @type {never}**/(functional.configs.externalTypeScriptRecommended),
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

/**
 * @type ConfigArray
 */
const javascriptRulesMitigationConfigs = defineConfig({
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

/**
 * @type ConfigArray
 */
const htmlConfigs = defineConfig({
  name: 'htmlConfig',
  plugins: {
    html,
  },
  extends: ['html/recommended'],
  language: 'html/html',
  rules: {
    '@html-eslint/require-closing-tags': ['error', { selfClosing: 'always' }],
  },
});

/**
 * @type ConfigArray
 */
const ymlConfigs = defineConfig(/** @type {never}**/(eslintPluginYml.configs['flat/recommended']), {
  name: 'ymlConfig',
  rules: {
    'yml/no-empty-mapping-value': 'off',
  },
});

/**
 * @type ConfigArray
 */
const markdownConfigs = defineConfig([
  {
    name: 'mdConfig',
    plugins: {
      markdown,
    },
    extends: ['markdown/recommended', 'markdown/processor'],
    rules: {},
  },
]);

/**
 * @type ConfigArray
 */
const jsonConfigs = defineConfig({
  ignores: ['package-lock.json'],
  plugins: { json },
  language: 'json/json',
  extends: ['json/recommended'],
});

/**
 * @type ConfigArray
 */
const jsoncConfigs = defineConfig({
  plugins: { json },
  language: 'json/jsonc',
  extends: ['json/recommended'],
});

/**
 * @type ConfigArray
 */
const json5Configs = defineConfig({
  plugins: { json },
  language: 'json/json5',
  extends: ['json/recommended'],
});

/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 * 
 * @param {{
 *  readonly configs: ReadonlyArray<ConfigObject>;
 *  readonly files: ReadonlyArray<string>;
 *  readonly ignores?: ReadonlyArray<string>;}} params
 *
 */

const scopeConfig = (params) =>{
  const {
  configs,
  files,
  ignores = [],
} = params
return configs.map((config) => ({
    ...config,
    files: [...files],
    ignores: [...ignores],
  }));
}
  
const untypedJsFiles = allJsInMdFiles;

/**
 * @type ConfigArray
 */
export default defineConfig([
  // This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
  globalIgnores([prodFolderName + '/', viteTimeStampFileNamePattern], 'ignoreConfig'),
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
