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
			'@types/eslint__eslintrc': 'latest',
			'@types/eslint__js': 'latest',
			'@types/node': 'latest',
			'cross-env': 'latest',
			eslint: 'latest',
			'eslint-config-prettier': 'latest',
			'eslint-plugin-functional': 'latest',
			'eslint-plugin-yml': 'latest',
			prettier: 'latest',
			typescript: 'latest',
			'typescript-eslint': 'latest',
			// vite-node and vitest load vite with restriction ^5.0.0. So, if we don't add this restriction to vite we have two different versions of vite running, which causes compatibility issues. Upgrade when new version of vite-node and vitest comes out.
			vite: '^5.0.0',
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
