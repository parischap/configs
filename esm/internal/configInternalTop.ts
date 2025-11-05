/**
 * This config implements what is necessary at the root of a package or monorepo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 * 
 * Dependencies imported in the package.json at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies and bin executables should be added in that manner as each package must have the list of its real dependencies.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  configsPackageName,
  githubFolderName,
  lintingAndFormattingDependencies,
  packageJsonFilename,
  packageManager,
  pnpmWorkspaceFilename,
  prodFolderName,
  slashedScope,
  vitestConfigFilename,
  vitestWorkspaceConfigFilename,
  workflowsFolderName
} from '../constants.js';
import type { Config } from "../types.js";
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
import vitestConfig from './vitestConfig.js';

const _default=({pnpmWorkspaceConfig=undefined,vitestWorkspaceConfig=undefined}:{readonly pnpmWorkspaceConfig?:string, readonly vitestWorkspaceConfig?:string}={}):Config=> ({
  [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish,
  [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages,
  [`${vitestConfigFilename}`]: vitestConfig,
  ...(pnpmWorkspaceConfig === undefined ? {} : {[pnpmWorkspaceFilename]:pnpmWorkspaceConfig}),
  ...(vitestWorkspaceConfig === undefined ? {} : {[vitestWorkspaceConfigFilename]:vitestWorkspaceConfig}),
  [packageJsonFilename]: {
    packageManager,
    ...(packageManager===undefined?{}:{packageManager}),
    // Import here dependencies that must not appear more than once in a monorepo
    devDependencies:{
      // Used by vscode, see `typescript.tsdk` key of settings.json
      typescript: '^5.9.3',
      // Used by vscode plugins
      ...lintingAndFormattingDependencies,
      // Better have the same version across the whole repo
      '@tsconfig/strictest': '^2.0.6',
      // Better have the same version across the whole repo
      '@types/node': '^24.7.0',
      // Better have the same version across the whole repo
      shx: '^0.4.0',
      // Better have the same version across the whole repo
      madge: '^8.0.0',
      // Needed by the vscode vite plugin
      vitest: '^3.2.4',
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
       * Import configs to generate config files for all packages
       * 
       * Use `link:` not `file:` so changes are taken into account immediately
       * */ 
      [`${slashedScope}${configsPackageName}`]: `link:../${configsPackageName}/${prodFolderName}/.`,
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