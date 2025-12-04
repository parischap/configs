/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Config } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalRepo from './configInternalRepo.js';
import configInternalWithoutSource from './configInternalWithoutSource.js';

export default ({
  packageName,
  description,
}: {
  readonly packageName: string;
  readonly description: string;
}): Config =>
  deepMerge(
    configInternalBase({
      packageName,
      description,
      scripts: {},
      isConfigsPackage: false,
    }),
    configInternalRepo({
      // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
      docGenParameters: { packageName, description },
      // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
      isPublished: true,
    }),
    configInternalWithoutSource({ isTopPackage: false }),
  );
