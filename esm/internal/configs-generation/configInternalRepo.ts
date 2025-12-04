/**
 * This config implements what is necessary at the root of a github repo. It should not be used
 * directly. It is included by configTop.ts, configMonoRepo.ts, configOnePackageRepo.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  docsConfigYmlFilename,
  docsFolderName,
  docsIndexMdFilename,
  githubFolderName,
  githubWorkflowsPagesFilename,
  githubWorkflowsPublishFilename,
  gitIgnoreFilename,
  packageJsonFilename,
  packageManager,
  workflowsFolderName,
} from '../shared-utils/constants.js';
import docsConfigYmlConfig from './docsConfigYmlConfig.js';
import githubWorkflowsPagesConfig from './githubWorkflowsPagesConfig.js';
import githubWorkflowsPublishConfig from './githubWorkflowsPublishConfig.js';
import gitIgnoreConfig from './gitIgnoreConfig.js';

export default ({
  docGenParameters,
  isPublished,
}: {
  readonly docGenParameters?: { readonly packageName: string; readonly description: string };
  readonly isPublished: boolean;
}) => ({
  ...(isPublished ?
    /* Github actions need to be at the root of the github repo. This action calls a script `build-and-publish` but changes the working directory to the published package directory before calling them. So this script must be in configInternalProject.ts.
     */
    {
      [`${githubFolderName}/${workflowsFolderName}/${githubWorkflowsPublishFilename}`]:
        githubWorkflowsPublishConfig,
    }
  : {}),
  ...(docGenParameters !== undefined ?
    {
      /* Github actions need to be at the root of the github repo. This action calls a script `prepare-docs'`  */
      [`${githubFolderName}/${workflowsFolderName}/${githubWorkflowsPagesFilename}`]:
        githubWorkflowsPagesConfig,
      // Used by the github pages.yml action
      [`${docsFolderName}/${docsIndexMdFilename}`]: docGenParameters.description,
      // Used by the github pages.yml action
      [`${docsFolderName}/${docsConfigYmlFilename}`]: docsConfigYmlConfig(
        docGenParameters.packageName,
      ),
    }
  : {}),
  [gitIgnoreFilename]: gitIgnoreConfig,
  [packageJsonFilename]: {
    packageManager,
    ...(docGenParameters !== undefined ?
      {
        scripts: {
          // --if-present is necessary because it is possible that no package in the workspace has a docgen script
          'prepare-docs':
            'pnpm -r --if-present -include-workspace-root=true --parallel --aggregate-output docgen && compile-docs',
        },
      }
    : {}),

    /*pnpm: {
      patchedDependencies: {},
      overrides: {
        //'tsconfig-paths': '^4.0.0'
      },
    },*/
  },
});
