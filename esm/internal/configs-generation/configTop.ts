/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Config } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalWithoutSource from './configInternalWithoutSource.js';

export default ({ topRepoName, description }: { readonly topRepoName: string, readonly description: string }): Config =>
  deepMerge(
    configInternalBase({
      packageName: topRepoName,
      description,
      scripts: {},
      isConfigsPackage: false,
    }),
    configInternalWithoutSource({ isTopPackage: true }),
  );
