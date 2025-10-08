import { type ConfigObject } from '@eslint/core';
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
import * as constants from './constants.js';

interface ConfigArray extends ReadonlyArray<ConfigObject> {}

const typescriptConfigs = defineConfig(eslint.configs.recommended, {
	// Add no rules here because they might get overridden by the typedTypescriptConfig
	name: 'typescriptConfig',
	// Add html plugin so we can lint template literals inside javascript code
	plugins: { functional: functional as never, html },
	languageOptions: {
		parserOptions: {
			ecmaFeatures: { impliedStrict: true }
		}
	},
	linterOptions: {
		reportUnusedDisableDirectives: 'error'
	}
});

const untypedTypescriptConfigs: ConfigArray = defineConfig(
	// The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs. Add no rules here because they might get overridden by the typedTypescriptConfig
	tseslint.configs.strict
);

const typedTypescriptConfigs: ConfigArray = defineConfig(
	// The typescript-eslint-parser requested by the functional plugin is included in all typescript-eslint configs
	tseslint.configs.strictTypeChecked,
	{
		name: 'typedTypescriptConfig',
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
		/**
		 * Rules that activate type-information can only be modified in that config (type information is
		 * unavailable in other configs)
		 */
		rules: {
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowNumber: true, allowBoolean: true }
			]
		}
	}
);

const untypedJavascriptRulesMitigationConfigs = defineConfig({
	name: 'untypedJavascriptRulesMitigationConfigs',
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
				caughtErrorsIgnorePattern: '^_'
			}
		],
		//'codegen/codegen': 'error',
		//'sort-destructure-keys/sort-destructure-keys': 'error',
		'functional/immutable-data': 'error',
		'functional/no-let': 'off',
		'functional/prefer-immutable-types': [
			'off',
			{
				ignoreInferredTypes: true,
				enforcement: 'Immutable',
				returnTypes: { enforcement: 'None' }
			}
		],
		'functional/type-declaration-immutability': [
			'off',
			{
				rules: [
					{
						identifiers: ['^.+$'],
						immutability: 'ReadonlyDeep',
						comparator: 'AtLeast'
					}
				]
			}
		],
		'functional/prefer-readonly-type': ['error', { allowMutableReturnType: true }],
		'functional/no-expression-statements': [
			'error',
			{ ignoreCodePattern: ['process\\.exit', 'super\\('] }
		],
		'functional/no-loop-statements': 'off',
		'functional/prefer-property-signatures': 'error',
		'functional/prefer-tacit': 'error',
		// Add html rules so we can lint template literals inside javascript code
		...html.configs.recommended.rules
		//'import/no-extraneous-dependencies': 'off'
	}
});

const htmlConfigs: ConfigArray = defineConfig({
	name: 'htmlConfig',
	plugins: {
		html
	},
	extends: ['html/recommended'],
	language: 'html/html',
	rules: {}
});

const ymlConfigs: ConfigArray = defineConfig(eslintPluginYml.configs['flat/recommended'] as never, {
	name: 'ymlConfig',
	rules: {
		'yml/no-empty-mapping-value': 'off'
	}
});

const markdownConfigs: ConfigArray = defineConfig([
	{
		name: 'mdConfig',
		plugins: {
			markdown
		},
		extends: ['markdown/recommended', 'markdown/processor'],
		rules: {}
	}
]);

const jsonConfigs: ConfigArray = defineConfig({
	ignores: ['package-lock.json'],
	plugins: { json },
	language: 'json/json',
	extends: ['json/recommended']
});

const jsoncConfigs: ConfigArray = defineConfig({
	plugins: { json },
	language: 'json/jsonc',
	extends: ['json/recommended']
});

const json5Configs: ConfigArray = defineConfig({
	plugins: { json },
	language: 'json/json5',
	extends: ['json/recommended']
});

/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 */

const scopeConfig = ({
	configs,
	files,
	ignores = []
}: {
	readonly configs: ConfigArray;
	readonly files: ReadonlyArray<string>;
	readonly ignores?: ReadonlyArray<string>;
}) =>
	configs.map((config) => ({
		...config,
		files: [...files],
		ignores: [...ignores]
	}));

const _default: ConfigArray = defineConfig([
	// This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
	globalIgnores(
		[constants.prodFolderName + '/', constants.viteTimeStampFileNamePattern],
		'ignoreConfig'
	),
	scopeConfig({ configs: typescriptConfigs, files: constants.allJsFiles }),
	scopeConfig({ configs: untypedTypescriptConfigs, files: constants.allJsInMdFiles }),
	scopeConfig({
		configs: typedTypescriptConfigs,
		files: constants.allJsFiles,
		/**
		 * We don't perform typed checks in js files inside md files because types are usually
		 * unavailable (imports are not analyzed) and there are issues with virtual **.md/*.ts files
		 * created by typesscript-eslint which the tsconfig file does not cover. Such files could be
		 * ignored by using the `allowDefaultProject` property but that would slow down linting too
		 * much. See typescript-eslint FAQ
		 */
		ignores: constants.allJsInMdFiles
	}),
	scopeConfig({ configs: untypedJavascriptRulesMitigationConfigs, files: constants.allJsFiles }),
	{
		name: 'typescriptConfigForOtherFiles',
		files: constants.allJsFiles,
		ignores: [constants.projectFolderName + '/**'],
		languageOptions: {
			globals: {
				...globals.nodeBuiltin
			}
		}
	},
	scopeConfig({ configs: htmlConfigs, files: constants.allHtmlFiles }),
	scopeConfig({ configs: ymlConfigs, files: constants.allYmlFiles }),
	scopeConfig({ configs: markdownConfigs, files: constants.allMdFiles }),
	scopeConfig({ configs: jsonConfigs, files: constants.allJsonFiles }),
	scopeConfig({ configs: jsoncConfigs, files: constants.allJsoncFiles }),
	scopeConfig({ configs: json5Configs, files: constants.allJson5Files }),
	{
		...eslintConfigPrettier,
		files: constants.allJsFiles
	}
]);

export default _default;
