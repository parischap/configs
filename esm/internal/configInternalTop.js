/**
 * This config implements what is necessary at the root of a package or monorepo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 * 
 * Dependencies imported in the package.json at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies and bin executables should be added in that manner as each package must have the list of its real dependencies.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  githubFolderName,
  lintingAndFormattingDependencies,
  packageJsonFileName,
  packageManager,
  workflowsFolderName
} from '../constants.js';
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
/** @import {Config} from "../types.js" */

/** @type Config */
export default {
  [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish,
  [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages,
  [packageJsonFileName]: {
    packageManager,
    // Import here dependencies that must not appear more than once in a monorepo
    devDependencies:{
      // Used by vscode, see `typescript.tsdk` key of settings.json
      typescript: '^5.9.3',
      // Used by vscode plugins
      ...lintingAndFormattingDependencies,
},
    /*pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },*/
  },
};
