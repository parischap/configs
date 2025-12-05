/** This config is the one to be used in the sub-package of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import type { Config, ReadonlyStringArray, ReadonlyStringRecord } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalWithSource from './configInternalWithSource.js';

export default ({
  repoName,
  packageName,
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
  packagePrefix,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly description: string;
  readonly dependencies?: ReadonlyStringRecord;
  readonly devDependencies?: ReadonlyStringRecord;
  readonly peerDependencies?: ReadonlyStringRecord;
  readonly examples?: ReadonlyStringArray;
  readonly scripts?: ReadonlyStringRecord;
  readonly environment: string;
  readonly buildMethod: string;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords?: ReadonlyStringArray;
  readonly useEffectAsPeerDependency: boolean;
  readonly useEffectPlatform?: string;
  readonly packagePrefix: string;
}): Config =>
  deepMerge(
    configInternalBase({
      packageName,
      description,
      scripts,
      isConfigsPackage: false,
    }),
    configInternalWithSource({
      packageName,
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
      isConfigsPackage: false,
    }),
  ) as Config;
