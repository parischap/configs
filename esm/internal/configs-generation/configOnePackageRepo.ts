/** This config is the one to be used in a standalone repo which is either a library or an executable */
// This module must not import any external dependency. It must be runnable without a package.json
import type { Config, PackageWithSourceConfigParameters } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalRepo from './configInternalRepo.js';
import configInternalWithSource from './configInternalWithSource.js';

export default ({
  repoName,
  isConfigsPackage,
  description,
  dependencies = {},
  devDependencies = {},
  peerDependencies = {},
  examples = [],
  scripts = {},
  environment,
  buildMethod,
  isPublished,
  hasDocGen,
  keywords = [],
  useEffectAsPeerDependency,
  useEffectPlatform = 'No',
  packagePrefix
}: PackageWithSourceConfigParameters & { readonly repoName: string; readonly isConfigsPackage:boolean}): Config => {

  return deepMerge(
    configInternalBase({
      packageName: repoName,
      description,
      scripts,
      isConfigsPackage,
    }),
    configInternalRepo({
      ...(hasDocGen ? { docGenParameters: { packageName: repoName, description } } : {}),
      isPublished,
    }),
    configInternalWithSource({
      packageName: repoName,
      repoName,
      dependencies,
      devDependencies,
      peerDependencies,
      examples,
      buildMethod,
      environment,
      isPublished,
      hasDocGen,
      keywords,
      useEffectAsPeerDependency,
      useEffectPlatform,
      packagePrefix,
      isConfigsPackage,
    }),
  ) as Config;
};
