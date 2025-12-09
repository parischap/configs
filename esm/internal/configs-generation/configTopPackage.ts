/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { pnpmWorkspaceFilename } from '../shared-utils/constants.js';
import { Package, type Config } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalNoSourcePackage from './configInternalNoSourcePackage.js';
import pnpmWorkspaceConfig from './pnpmWorkspaceConfig.js';
import vscodeWorkspaceConfig from './vscodeWorkspaceConfig.js';

export default ({
  topRepoName,
  topRepoPath,
  description,
  allPackages,
}: {
  readonly topRepoName: string;
  readonly topRepoPath: string;
  readonly description: string;
  readonly allPackages: ReadonlyArray<Package>;
}): Config => ({
  ...deepMerge(
    configInternalBase({
      packageName: topRepoName,
      description,
      scripts: {},
      isConfigsPackage: false,
    }),
    configInternalNoSourcePackage,
  ),
  // Used by all scripts to define scope of -r flag
  [pnpmWorkspaceFilename]: pnpmWorkspaceConfig(allPackages),
  // Used by vscode
  [`${topRepoName}.code-workspace`]: vscodeWorkspaceConfig({
    topRepoName,
    topRepoPath,
    allPackages,
  }),
});
