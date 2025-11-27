/**
 * This config implements what is necessary at the root of a github repo. It should not be used
 * directly. It is included by configMonoRepo.ts and configOnePackageRepo.ts.
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
  repoDevDependencies,
  workflowsFolderName,
} from '../constants.js';
import docsConfigYmlConfig from './docsConfigYmlConfig.js';
import githubWorkflowsPagesConfig from './githubWorkflowsPagesConfig.js';
import githubWorkflowsPublishConfig from './githubWorkflowsPublishConfig.js';
import gitIgnoreConfig from './gitIgnoreConfig.js';

export default ({
  packageName,
  hasDocGen,
  isPublished,
  description,
}: {
  readonly packageName: string;
  readonly hasDocGen: boolean;
  readonly isPublished: boolean;
  readonly description: string;
}) => ({
  ...(isPublished ?
    /* Github actions need to be at the root of the github repo. This action calls a script `build-and-publish` but changes the working directory to the published package directory before calling them. So this script must be in configInternalProject.ts.
     */
    {
      [`${githubFolderName}/${workflowsFolderName}/${githubWorkflowsPublishFilename}`]:
        githubWorkflowsPublishConfig,
    }
  : {}),
  ...(hasDocGen ?
    {
      /* Github actions need to be at the root of the github repo. This action calls a script `prepare-docs'`  */
      [`${githubFolderName}/${workflowsFolderName}/${githubWorkflowsPagesFilename}`]:
        githubWorkflowsPagesConfig,
      // Used by the github pages.yml action
      [`${docsFolderName}/${docsIndexMdFilename}`]: description,
      // Used by the github pages.yml action
      [`${docsFolderName}/${docsConfigYmlFilename}`]: docsConfigYmlConfig(packageName),
    }
  : {}),
  [gitIgnoreFilename]: gitIgnoreConfig,
  [packageJsonFilename]: {
    packageManager,
    devDependencies: repoDevDependencies,
    ...(hasDocGen ?
      {
        scripts: {
          'prepare-docs':
            'pnpm -r --if-present -include-workspace-root=true --parallel docgen && compile-docs',
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
