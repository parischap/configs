import eslint from '@eslint/js';
// Awaiting improvement on ESLint side - Typescript not well supported
//import json from '@eslint/json';
//import markdown from '@eslint/markdown';
import html from '@html-eslint/eslint-plugin';
import { type Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import * as constants from './constants.js';
import * as utils from './utils.js';
//import markdown from 'eslint-plugin-markdown';
import eslintPluginYml from 'eslint-plugin-yml';
import globals from 'globals';
import { config as tseslintConfig, configs as tseslintConfigs } from 'typescript-eslint';

/*const compat = new FlatCompat({
	baseDirectory: import.meta.dirname
});*/

type FlatConfigArray = ReadonlyArray<Linter.FlatConfig>;

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

const htmlConfigs: FlatConfigArray = [
	{
		// recommended configuration included in the plugin
		...html.configs['flat/recommended'],
		rules: {
			...html.configs['flat/recommended'].rules, // Must be defined. If not, all recommended rules will be lost
			'@html-eslint/indent': 'error'
		}
	}
];

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
		ignores: [
			...constants.allProdFiles.map(utils.fromOsPathToPosixPath),
			constants.viteTimeStampFileNamePattern
		]
	},
	...typescriptConfigs.map((config) => ({
		...config,
		files: constants.allJsFiles.map(utils.fromOsPathToPosixPath)
	})),
	{
		files: constants.allCjsFiles.map(utils.fromOsPathToPosixPath),
		// No need to set module for other js files, this is the default
		languageOptions: { sourceType: 'commonjs' }
	},
	{
		files: constants.allJsFiles.map(utils.fromOsPathToPosixPath),
		ignores: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
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
		files: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
		languageOptions: {
			parserOptions: {
				// here . represents the directory containing the nearest eslint.config.js
				project: `./tsconfig.${constants.projectMark}.json`
			}
		}
	},
	...htmlConfigs.map((config) => ({
		...config,
		files: constants.allHtmlFiles.map(utils.fromOsPathToPosixPath)
	})),
	...ymlConfigs.map((config) => ({
		...config,
		files: constants.allYmlFiles.map(utils.fromOsPathToPosixPath)
	})),
	/*...markdownConfigs.map((config) => ({
		...config,
		files: constants.allMdFiles.map(utils.fromOsPathToPosixPath)
	})),
	...jsonConfigs.map((config) => ({
		...config,
		files: constants.allJsonFiles.map(utils.fromOsPathToPosixPath)
	})),*/
	{
		...eslintConfigPrettier,
		files: constants.allJsFiles.map(utils.fromOsPathToPosixPath)
	}
] as FlatConfigArray;

export default _default;
