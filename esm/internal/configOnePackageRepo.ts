/** This config is the one to be used in a standalone repo which is either a library or an executable */
// This module must not import any external dependency. It must be runnable without a package.json
import type { Config, Environment, PackageType, ReadonlyStringRecord } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';
import configInternalRepo from './configInternalRepo.js';
import onePackageRepoPnpmWorkspaceConfig from './onePackageRepoPnpmWorkspaceConfig.js';

export default ({
  packageName,
  description,
  dependencies = {},
  devDependencies = {},
  peerDependencies = {},
  examples = [],
  scripts = {},
  environment,
  packageType,
  isPublished,
  hasDocGen,
  keywords = [],
}: {
  readonly packageName: string;
  readonly description: string;
  readonly dependencies?: ReadonlyStringRecord;
  readonly devDependencies?: ReadonlyStringRecord;
  readonly peerDependencies?: ReadonlyStringRecord;
  readonly examples?: ReadonlyArray<string>;
  readonly scripts?: ReadonlyStringRecord;
  readonly environment: Environment;
  readonly packageType: PackageType;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords?: ReadonlyArray<string>;
}): Config =>
  makeConfigWithLocalInternalDependencies(
    deepMerge(
      configInternalBase({
        packageName,
        description,
        environment,
        scripts,
      }),
      configInternalRepo({
        isPublished,
        hasDocGen,
        repoPnpmWorkspaceConfig: onePackageRepoPnpmWorkspaceConfig,
      }),
      configInternalPackage({
        packageName,
        repoName: packageName,
        dependencies,
        devDependencies,
        peerDependencies,
        examples,
        packageType,
        isPublished,
        hasDocGen,
        keywords,
      }),
    ),
  );
