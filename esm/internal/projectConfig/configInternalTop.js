/**
 * This config implements what is necessary at the root of a repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 */
// This file must not import anything external
import { githubFolderName, globalDependencies, packageJsonFileName, packageManager, workflowsFolderName } from './constants.js';
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
    packageManager,
    devDependencies: globalDependencies,
    pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },
  },
};
