/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  gitIgnoreFilename,
  packageJsonFilename,
  packageManager,
  pnpmWorkspaceFilename,
  topDependencies,
  topPackageName,
  vitestConfigFilename,
} from '../constants.js';
import { Config } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import topGitIgnoreConfig from './topGitIgnoreConfig.js';
import topPnpmWorkspaceConfig from './topPnpmWorkspaceConfig.js';
import topVitestConfig from './topVitestConfig.js';

export default ({ description }: { readonly description: string }): Config =>
  makeConfigWithLocalInternalDependencies(
    deepMerge(
      configInternalBase({
        packageName: topPackageName,
        description,
        environment: 'Node',
        scripts: {
          'update-all-config-files':
            'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
          'clean-all-node-modules': 'pnpm -t clean-node-modules',
          'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
          'build-all': 'pnpm -r build',
        },
      }),
      {
        [gitIgnoreFilename]: topGitIgnoreConfig,
        [vitestConfigFilename]: topVitestConfig,
        [pnpmWorkspaceFilename]: topPnpmWorkspaceConfig,
        [packageJsonFilename]: {
          packageManager,
          devDependencies: {
            ...topDependencies,
          },

          /*pnpm: {
        patchedDependencies: {},
        overrides: {
          //'tsconfig-paths': '^4.0.0'
        },
      },*/
        },
      },
    ),
  );
