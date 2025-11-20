/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { topPackageName } from '../constants.js';
import { type Config } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalTop from './configInternalTop.js';

export default ({ description }: { readonly description: string }): Config =>
  makeConfigWithLocalInternalDependencies({
    repoName: topPackageName,
    packageName: topPackageName,
    onlyAllowDevDependencies: true,
    allowWorkspaceSources: false,
    config: deepMerge(
      configInternalBase({
        packageName: topPackageName,
        description,
        environment: 'Node',
        scripts: {
          'update-all-config-files':
            'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
          'clean-all-node-modules': 'pnpm -r -include-workspace-root=true clean-node-modules',
          'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
          'build-all': 'pnpm -r build-all',
        },
      }),
      configInternalTop,
    ),
  });
