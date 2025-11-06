/**
 * This config implements what is necessary at the root of a github repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 * 
 * Dependencies imported in the package.json at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies and bin executables should be added in that manner as each package must have the list of its real dependencies.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  configsPackageName,
  githubFolderName,
  gitIgnoreFilename,
  packageJsonFilename,
  packageManager,
  pnpmWorkspaceFilename,
  slashedScope,
  testUtilsPackageName,
  vitestConfigFilename,
  vscodeDependencies,
  workflowsFolderName
} from '../constants.js';
import type { Config } from "../types.js";
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
import repoGitIgnoreConfig from './repoGitIgnoreConfig.js';
import repoVitestConfig from './repoVitestConfig.js';

const _default= ({hasDocGen, isPublished, repoPnpmWorkspaceConfig}:{readonly hasDocGen:boolean, readonly isPublished:boolean, readonly repoPnpmWorkspaceConfig:string}):Config=> ({
  ...(isPublished? {[`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish}:{}),
  ...(hasDocGen ? {[`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages}:{}),
  [gitIgnoreFilename]: repoGitIgnoreConfig,
  [vitestConfigFilename]: repoVitestConfig,
  ...(repoPnpmWorkspaceConfig==='' ? {}:{[pnpmWorkspaceFilename]:repoPnpmWorkspaceConfig}),
  [packageJsonFilename]: {
    packageManager,
    /* Import here dependencies that must not appear more than once in a monorepo. Note that even those devDependecies that are imported at the top level need to be reimported here because they may be needed by github actions*/
    devDependencies:{
      ...vscodeDependencies,
      // Better have the same version across the whole repo
      shx: '^0.4.0',
      // Better have the same version across the whole repo
      madge: '^8.0.0',
      // At some point, rolldown will be default in vite. But not the case for the moment
      // Not necessary in all configurations but vite is installed by vitest in any case so better install it here
    vite: 'npm:rolldown-vite@^7.1.17',
      // Not necessary in all configurations but better have the same version across the whole repo
          'vite-node': '^3.2.4',
      // Not necessary in all configurations but best if shared when neeeded
    '@babel/core': '^7.28.4',
    'babel-plugin-annotate-pure-calls': '^0.5.0',
    '@babel/plugin-transform-export-namespace-from': '^7.27.1',
    '@babel/plugin-transform-modules-commonjs': '^7.27.1',
      /** 
       * Import configs in prod version to generate config files for all packages
       * */ 
      [`${slashedScope}${configsPackageName}`]: "workspace:*",
       /** 
       * Import test-utils in prod version to handle tests
       * */ 
      [`${slashedScope}${testUtilsPackageName}`]: 'workspace:*',
      ...(    hasDocGen ? {
      '@effect/docgen': '^0.5.2',
      // tsx must be installed because it is used by docgen (strangely, it is not requested as a dev-dependency
      tsx: '^4.20.6',
    }:{})
},

    /*pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },*/
  },
});

export default _default;