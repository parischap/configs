import eslint from '@eslint/js';
// Awaiting improvement on ESLint side - Typescript not well supported
//import json from '@eslint/json';
//import markdown from '@eslint/markdown';
//import html from '@html-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import * as constants from './constants.js';
//import markdown from 'eslint-plugin-markdown';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';

/*const compat = new FlatCompat({
	baseDirectory: import.meta.dirname
});*/

const typescriptConfigs = defineConfig(
	eslint.configs.recommended,
	// typescript-eslint-parser is included in all typescript-eslint configs
	tseslint.configs.recommendedTypeChecked,
	{
		name: 'typescriptConfig',
		plugins: { functional: functional as never },
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
			'functional/prefer-tacit': 'error'
		}
	}
);

/*const htmlConfigs: FlatConfigArray = [
	{
		// recommended configuration included in the plugin
		...html.configs['flat/recommended'],
		rules: {
			...html.configs['flat/recommended'].rules, // Must be defined. If not, all recommended rules will be lost
			'@html-eslint/indent': 'error'
		}
	}
];*/

const ymlConfigs = defineConfig(eslintPluginYml.configs['flat/recommended'] as never, {
	name: 'ymlConfig',
	rules: {
		'yml/no-empty-mapping-value': 'off'
	}
});

/*const markdownConfigs: FlatConfigArray = markdown.configs && 'recommended' in markdown.configs ? [...markdown.configs['recommended']]:[];

const jsonConfigs: FlatConfigArray = [
	{
		ignores: ['package-lock.json'],
		language: 'json/json',
		...json.configs.recommended
	}
];*/

/**
 * See https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects Each
 * object applies to the files specified in its files property. If several objects apply to a file,
 * properties of all applicable objects are merged. If the same property appears in several objects,
 * the latest one prevails.
 */

const _default: ConfigArray = defineConfig([
	// This is a global ignore, files are ignored in all other config objects. node_modules files and .git are also ignored.
	globalIgnores(
		[constants.prodFolderName + '/', constants.viteTimeStampFileNamePattern],
		'ignoreConfig'
	),
	typescriptConfigs.map((config) => ({
		...config,
		files: constants.allJsFiles
	})),
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
	/*.map((config) => ({
		...config,
		files: constants.allHtmlFiles
	})),*/
	...ymlConfigs.map((config) => ({
		...config,
		files: constants.allYmlFiles
	})),
	/*...markdownConfigs.map((config) => ({
		...config,
		files: constants.allMdFiles
	})),
	...jsonConfigs.map((config) => ({
		...config,
		files: constants.allJsonFiles
	})),*/
	{
		...eslintConfigPrettier,
		files: constants.allJsFiles
	}
]);

export default _default;
