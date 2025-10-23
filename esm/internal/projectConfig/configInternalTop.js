/**
 * This config implements what is necessary at the root of a repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 */
// This file must not import anything external
import { githubFolderName, packageJsonFileName, workflowsFolderName } from './constants.js';
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
/**
 * @import {Config} from "./types.d.ts"
 */

/**
 * @type Config
 */
export default {
  [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish,
  [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages,
  [packageJsonFileName]: {
    packageManager: `pnpm@10.18.3`,
    devDependencies: {
      globals: '^16.4.0',
      '@tsconfig/strictest': '^2.0.6',
      shx: '^0.4.0',
      // Use `file:` not `link:` so binaries get installed
      '@parischap/configs': 'file:../configs/dist/.',
      '@parischap/test-utils': '^0.14.0',
      '@types/node': '^24.7.0',
      eslint: '^9.37.0',
      '@eslint/eslintrc': '^3.3.1',
      '@eslint/js': '^9.37.0',
      'eslint-config-prettier': '^10.1.8',
      'eslint-plugin-functional': '^9.0.2',
      'eslint-plugin-yml': '^1.19.0',
      '@eslint/markdown': '^7.3.0',
      '@html-eslint/eslint-plugin': '^0.47.0',
      '@html-eslint/parser': '^0.47.0',
      '@eslint/json': '^0.13.2',
      prettier: '^3.6.2',
      typescript: '^5.9.3',
      // tsx must be installed because it is used by docgen and not requested as a dev-dependency
      tsx: '^4.20.6',
      'typescript-eslint': '^8.45.0',
      vitest: '^3.2.4',
      // At some point, rolldown will be default in vite. But not the case for the moment
      vite: 'npm:rolldown-vite@^7.1.17',
      'vite-node': '^3.2.4',
      madge: '^8.0.0',
      '@babel/core': '^7.28.4',
      '@babel/plugin-transform-export-namespace-from': '^7.27.1',
      '@babel/plugin-transform-modules-commonjs': '^7.27.1',
      'babel-plugin-annotate-pure-calls': '^0.5.0',
      '@babel/cli': '^7.28.3',
      '@effect/docgen': '^0.5.2',
      'prettier-plugin-jsdoc': '^1.3.3',
      //'eslint-plugin-import': 'latest',
      //'@typescript-eslint/parser': 'latest',
      //'eslint-import-resolver-typescript': 'latest',
    },
    pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },
  },
};
