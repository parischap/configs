/** This config is the one to be used in a standalone repo which is either a library or an executable */
// This module must not import any external dependency. It must be runnable without a package.json
import type { Config, ReadonlyStringArray, ReadonlyStringRecord } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalProject from './configInternalProject.js';
import configInternalRepo from './configInternalRepo.js';

export default ({
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
}: {
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
}): Config =>
  makeConfigWithLocalInternalDependencies({
    repoName: packageName,
    packageName,
    onlyAllowDevDependencies: false,
    allowWorkspaceSources: true,
    config: deepMerge(
      configInternalBase({
        packageName,
        description,
        environment,
        scripts: {
          'build-all': 'pnpm build',
          ...scripts,
        },
      }),
      configInternalRepo({
        packageName,
        isPublished,
        hasDocGen,
        description,
      }),
      configInternalProject({
        packageName,
        repoName: packageName,
        dependencies,
        devDependencies,
        peerDependencies,
        examples,
        buildMethod,
        isPublished,
        hasDocGen,
        keywords,
        useEffectAsPeerDependency,
        useEffectPlatform,
      }),
    ) as Config,
  });
