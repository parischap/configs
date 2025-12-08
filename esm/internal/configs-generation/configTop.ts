/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { pnpmWorkspaceFilename } from '../shared-utils/constants.js';
import { type Config } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalWithoutSource from './configInternalWithoutSource.js';
import pnpmWorkspaceConfig from './pnpmWorkspaceConfig.js';
import vscodeWorkspaceConfig from './vscodeWorkspaceConfig.js';

export default ({
  topRepoName,
  description,
  allPackages,
}: {
  readonly topRepoName: string;
  readonly description: string;
  readonly allPackages: ReadonlyArray<readonly [packageName: string, packagePath: string]>;
}): Config => ({
  ...deepMerge(
    configInternalBase({
      packageName: topRepoName,
      description,
      scripts: {},
      isConfigsPackage: false,
    }),
    configInternalWithoutSource,
  ),
  // Used by all scripts to define scope of -r flag
  [pnpmWorkspaceFilename]: pnpmWorkspaceConfig(allPackages),
  // Used by vscode
  [`${topRepoName}.code-workspace`]: vscodeWorkspaceConfig({ topRepoName }),
});
