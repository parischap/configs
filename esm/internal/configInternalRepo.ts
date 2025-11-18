/**
 * This config implements what is necessary at the root of a github repo. It should not be used
 * directly. It is included by configMonoRepo.ts and configOnePackageRepo.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  docsFolderName,
  githubFolderName,
  gitIgnoreFilename,
  owner,
  packageJsonFilename,
  packageManager,
  pnpmWorkspaceFilename,
  repoDevDependencies,
  vitestConfigFilename,
  workflowsFolderName,
} from '../constants.js';
import githubWorkflowsPages from './githubWorkflowsPages.js';
import githubWorkflowsPublish from './githubWorkflowsPublish.js';
import repoGitIgnoreConfig from './repoGitIgnoreConfig.js';
import repoPnpmWorkspaceConfig from './repoPnpmWorkspaceConfig.js';
import repoVitestConfig from './repoVitestConfig.js';

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
    /* Github actions need to be at the root of the github repo. This action calls a script `build-and-publish` but changes the working directory to the published package directory before calling them. So this script must be in configInternalPackage.ts.
     */
    { [`${githubFolderName}/${workflowsFolderName}/publish.yml`]: githubWorkflowsPublish }
  : {}),
  ...(hasDocGen ?
    {
      /* Github actions need to be at the root of the github repo. This action calls a script `prepare-docs'`  */
      [`${githubFolderName}/${workflowsFolderName}/pages.yml`]: githubWorkflowsPages,
      // Used by the github pages.yml action
      [`${docsFolderName}/index.md`]: description,
      // Used by the github pages.yml action
      [`${docsFolderName}/_config.yml`]: `remote_theme: mikearnaldi/just-the-docs
search_enabled: true
aux_links:
  "GitHub":
    - "//github.com/${owner}/${packageName}"`,
    }
  : {}),
  [gitIgnoreFilename]: repoGitIgnoreConfig,
  [pnpmWorkspaceFilename]: repoPnpmWorkspaceConfig,
   [vitestConfigFilename]: repoVitestConfig(packageName),
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
