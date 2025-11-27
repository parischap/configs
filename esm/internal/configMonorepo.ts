/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Config } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalNoProject from './configInternalNoProject.js';
import configInternalRepo from './configInternalRepo.js';

export default ({
  packageName,
  description,
}: {
  readonly packageName: string;
  readonly description: string;
}): Config =>
  makeConfigWithLocalInternalDependencies({
    packageName,
    onlyAllowDevDependencies: true,
    config: deepMerge(
      configInternalBase({
        packageName,
        description,
        scripts: {},
      }),
      configInternalRepo({
        // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
        docGenParameters: { packageName, description },
        // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
        isPublished: true,
      }),
      configInternalNoProject,
    ),
  });
