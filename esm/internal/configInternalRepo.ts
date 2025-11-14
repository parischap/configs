/**
 * This config implements what is necessary at the root of a github repo. It should not be used
 * directly. It is included by config.monorepo.ts, config.starter.ts and config.onepackagerepo.ts
 * configs.
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
  topDependencies,
  workflowsFolderName,
} from '../constants.js';
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
import repoGitIgnoreConfig from './repoGitIgnoreConfig.js';

export default ({
  hasDocGen,
  isPublished,
  monoRepoPnpmWorkspaceConfig,
}: {
  readonly hasDocGen: boolean;
  readonly isPublished: boolean;
  readonly monoRepoPnpmWorkspaceConfig: string;
}) => ({
  ...(isPublished ?
    { [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish }
  : {}),
  ...(hasDocGen ?
    { [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages }
  : {}),
  [gitIgnoreFilename]: repoGitIgnoreConfig,
  ...(monoRepoPnpmWorkspaceConfig === '' ?
    {}
  : { [pnpmWorkspaceFilename]: monoRepoPnpmWorkspaceConfig }),
  [packageJsonFilename]: {
    packageManager,
    /* Import here devDependencies that must not appear more than once in a monorepo. Note that even those devDependecies that are imported at the top level need to be reimported here because they may be needed by github actions */
    devDependencies: {
      ...topDependencies,
      ...repoOnlyDependencies,
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
