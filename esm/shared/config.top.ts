/**
 * This config implements what is necessary at the root of a repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 */

import * as constants from './constants.js';
import githubWorkflowsPagesTemplate from './github.workflows.pages.template.js';
import githubWorkflowsPublishTemplate from './github.workflows.publish.template.js';

export default {
	[`${constants.githubFolderName}/${constants.workflowsFolderName}/publish.yml`]:
		githubWorkflowsPublishTemplate,
	[`${constants.githubFolderName}/${constants.workflowsFolderName}/pages.yml`]:
		githubWorkflowsPagesTemplate,
	[constants.packageJsonFileName]: {
		packageManager: `pnpm@${constants.pnpmVersion}`,
		devDependencies: {
			'ts-deepmerge': 'latest',
			'@tsconfig/node20': 'latest',
			'@tsconfig/strictest': 'latest',
			shx: 'latest',
			'@eslint/eslintrc': 'latest',
			'@eslint/js': 'latest',
			//'@eslint/json': 'latest',
			//'@eslint/markdown': 'latest',
			'@html-eslint/eslint-plugin': 'latest',
			'@html-eslint/parser': 'latest',
			'@types/eslint': 'latest',
			'@types/eslint-config-prettier': 'latest',
			'@types/node': 'latest',
			'cross-env': 'latest',
			eslint: 'latest',
			'eslint-config-prettier': 'latest',
			'eslint-plugin-functional': 'latest',
			'eslint-plugin-yml': 'latest',
			prettier: 'latest',
			typescript: 'latest',
			'typescript-eslint': 'latest',
			// Make sure vite-node and vitest use latest vite version. Otherwise, we have severalt versions of vite running, which causes compatibility issues. If this happens, restrict vite to specific version like vite: '^5.0.0',
			vite: 'latest',
			'vite-node': 'latest',
			vitest: 'latest',
			madge: 'latest',
			terser: 'latest',
			'@babel/core': 'latest',
			'@babel/plugin-transform-export-namespace-from': 'latest',
			'@babel/plugin-transform-modules-commonjs': 'latest',
			'babel-plugin-annotate-pure-calls': 'latest',
			'@babel/cli': 'latest',
			//'@effect/docgen': 'https://github.com/parischap/docgenbuilt',
			'@effect/docgen': 'latest',
			'prettier-plugin-jsdoc': 'latest',
			tsx: 'latest'
			//'eslint-plugin-import': 'latest',
			//'@typescript-eslint/parser': 'latest',
			//'eslint-import-resolver-typescript': 'latest'
		},
		pnpm: {
			patchedDependencies: {},
			overrides: {
				//'tsconfig-paths': '^4.0.0'
			}
		}
	}
};
