import eslint from '@eslint/js';
// Awaiting improvement on ESLint side - Typescript not well supported
//import json from '@eslint/json';
//import markdown from '@eslint/markdown';
//import html from '@html-eslint/eslint-plugin';
import { type Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import * as constants from './constants.js';
//import markdown from 'eslint-plugin-markdown';
import eslintPluginYml from 'eslint-plugin-yml';
import globals from 'globals';
import { config as tseslintConfig, configs as tseslintConfigs } from 'typescript-eslint';

/*const compat = new FlatCompat({
	baseDirectory: import.meta.dirname
});*/

type FlatConfigArray = ReadonlyArray<Linter.Config>;

const typescriptConfigs = tseslintConfig(
	eslint.configs.recommended,
	// typescript-eslint-parser is included in all typescript-eslint configs
	...tseslintConfigs.recommendedTypeChecked,
	{
		plugins: { functional },
		languageOptions: {
			//ecmaVersion: "latest", useless, this is the default
			parserOptions: {
				ecmaFeatures: { impliedStrict: true }
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

const ymlConfigs = [
	...eslintPluginYml.configs['flat/recommended'],
	{
		rules: {
			'yml/no-empty-mapping-value': 'off'
		}
	}
];

/*const markdownConfigs: FlatConfigArray = markdown.configs && 'recommended' in markdown.configs ? [...markdown.configs['recommended']]:[];

const jsonConfigs: FlatConfigArray = [
	{
		ignores: ['package-lock.json'],
		language: 'json/json',
		...json.configs.recommended
	}
];*/

const _default = [
	{
		ignores: [...constants.allProdFiles, constants.viteTimeStampFileNamePattern]
	},
	...typescriptConfigs.map((config) => ({
		...config,
		files: constants.allJsFiles
	})),
	{
		files: constants.allCjsFiles,
		// No need to set module for other js files, this is the default
		languageOptions: { sourceType: 'commonjs' }
	},
	{
		files: constants.allJsFiles,
		ignores: constants.allProjectFiles,
		languageOptions: {
			globals: {
				...globals.nodeBuiltin
			},
			parserOptions: {
				// here . represents the directory containing the nearest eslint.config.js
				project: `./tsconfig.${constants.nonProjectMark}.json`
			}
		}
		/*rules: {
			'import/no-extraneous-dependencies': 'off'
		}*/
	},
	{
		files: constants.allProjectFiles,
		languageOptions: {
			parserOptions: {
				// here . represents the directory containing the nearest eslint.config.js
				project: `./tsconfig.${constants.projectMark}.json`
			}
		}
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
] as FlatConfigArray;

export default _default;
