/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { Config } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalRepo from './configInternalRepo.js';

export default ({
  packageName,
  description,
}: {
  readonly packageName: string;
  readonly description: string;
}): Config =>
  makeConfigWithLocalInternalDependencies(
    deepMerge(
      configInternalBase({
        packageName,
        description,
        environment: 'Node',
        scripts: {
          'update-all-config-files':
            'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
          'clean-all-node-modules': 'pnpm -t clean-node-modules',
          'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
          'build-all': 'pnpm -r build',
          'prepare-docs': 'pnpm -r --if-present --parallel docgen && compile-docs',
        },
      }),
      configInternalRepo({
        // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
        isPublished: true,
        // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
        hasDocGen: true,
      }),
    ),
  );
