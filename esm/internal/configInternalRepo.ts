/**
 * This config implements what is necessary at the root of a github repo. It should not be used
 * directly. It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts
 * configs.
 *
 * Dependencies imported in the package.json at the top of a monorepo and bin executables defined
 * there are available in all sub packages. Only devDependencies and bin executables should be added
 * in that manner as each package must have the list of its real dependencies.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  docGenDependencies,
  githubFolderName,
  gitIgnoreFilename,
  packageJsonFilename,
  packageManager,
  pnpmWorkspaceFilename,
  repoOnlyDependencies,
  slashedDevScope,
  slashedScope,
  testUtilsPackageName,
  topDependencies,
  workflowsFolderName,
} from '../constants.js';
import type { Config } from '../types.js';
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
import repoGitIgnoreConfig from './repoGitIgnoreConfig.js';

const _default = ({
  hasDocGen,
  isPublished,
  repoPnpmWorkspaceConfig,
}: {
  readonly hasDocGen: boolean;
  readonly isPublished: boolean;
  readonly repoPnpmWorkspaceConfig: string;
}): Config => ({
  ...(isPublished ?
    { [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish }
  : {}),
  ...(hasDocGen ?
    { [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages }
  : {}),
  [gitIgnoreFilename]: repoGitIgnoreConfig,
  ...(repoPnpmWorkspaceConfig === '' ? {} : { [pnpmWorkspaceFilename]: repoPnpmWorkspaceConfig }),
  [packageJsonFilename]: {
    packageManager,
    /* Import here dependencies that must not appear more than once in a monorepo. Note that even those devDependecies that are imported at the top level need to be reimported here because they may be needed by github actions*/
    devDependencies: {
      ...topDependencies,
      ...repoOnlyDependencies,
      /** Import test-utils in dev version to handle tests */
      [`${slashedScope}${testUtilsPackageName}`]: `workspace:${slashedDevScope}${testUtilsPackageName}@*`,
      ...(hasDocGen ? docGenDependencies : {}),
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
