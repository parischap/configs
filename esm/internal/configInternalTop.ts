/**
 * This config implements what is necessary at the root of a repo. It should not be used directly.
 * It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts configs.
 */

import * as constants from './constants.js';
import { devDependencies } from './dependencies.js';
import githubWorkflowsPagesTemplate from './githubWorkflowsPagesTemplate.js';
import githubWorkflowsPublishTemplate from './githubWorkflowsPublishTemplate.js';

export default {
  [`${constants.githubFolderName}/${constants.workflowsFolderName}/publish.yml`]:
    githubWorkflowsPublishTemplate,
  [`${constants.githubFolderName}/${constants.workflowsFolderName}/pages.yml`]:
    githubWorkflowsPagesTemplate,
  [constants.packageJsonFileName]: {
    packageManager: `pnpm@10.18.2`,
    devDependencies,
    pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },
  },
};
