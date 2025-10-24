/**
 * This config implements what is necessary at the root of a repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 */
// Whatever external package this file uses must be added as peerDependency
import {
  githubFolderName,
  globalDependencies,
  packageJsonFileName,
  packageManager,
  workflowsFolderName,
} from "./constants.js";
import githubWorkflowsPages from "./githubWorkflowsPages.js";
import githubWorkflowsPublish from "./githubWorkflowsPublish.js";
/**
 * @import {Config} from "./types.d.ts"
 */

/**
 * @type Config
 */
export default {
  [`${githubFolderName}/${workflowsFolderName}/publish.yml`]:
    githubWorkflowsPublish,
  [`${githubFolderName}/${workflowsFolderName}/pages.yml`]:
    githubWorkflowsPages,
  [packageJsonFileName]: {
    packageManager,
    ...(Object.keys(globalDependencies).length === 0
      ? {}
      : { devDependencies: globalDependencies }),
    /*pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },*/
  },
};
