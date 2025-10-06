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

const typescriptConfigs: ConfigArray = defineConfig(
	eslint.configs.recommended,
	// typescript-eslint-parser is included in all typescript-eslint configs
	tseslint.configs.recommendedTypeChecked,
	{
		name: 'typescriptConfig',
		// Add html plugin so we can lint template literals inside javascript code
		plugins: { functional: functional as never, html },
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { impliedStrict: true },
				projectService: true
			}
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error'
		},
		rules: {
			'@typescript-eslint/no-namespace': 'off', // We want to be able to use namespaces
			'@typescript-eslint/only-throw-error': 'off', // Effect has its own error management
			'@typescript-eslint/no-empty-object-type': 'off', // We want to define empty interfaces for opacity
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'no-redeclare': 'off', // We want to allow types and variables with same names
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
		}
	}
);

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
	files
}: {
	readonly configs: ConfigArray;
	readonly files: ReadonlyArray<string>;
}) =>
	configs.map((config) => ({
		...config,
		files: [...files]
	}));

const _default: ConfigArray = defineConfig([
	// This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
	globalIgnores(
		[constants.prodFolderName + '/', constants.viteTimeStampFileNamePattern],
		'ignoreConfig'
	),
	scopeConfig({ configs: typescriptConfigs, files: constants.allJsFiles }),
	{
		name: 'typescriptConfigForOtherFiles',
		files: constants.allJsFiles,
		ignores: [constants.projectFolderName + '/**'],
		languageOptions: {
			globals: {
				...globals.nodeBuiltin
			}
		}
		/*rules: {
			'import/no-extraneous-dependencies': 'off'
		}*/
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
