/** This config is the one to be used in the sub-package of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import type { BuildMethod, Config, Environment, ReadonlyStringRecord } from '../types.js';
import { deepMerge, makeConfigWithLocalInternalDependencies } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';

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
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly description: string;
  readonly dependencies?: ReadonlyStringRecord;
  readonly devDependencies?: ReadonlyStringRecord;
  readonly peerDependencies?: ReadonlyStringRecord;
  readonly examples?: ReadonlyArray<string>;
  readonly scripts?: ReadonlyStringRecord;
  readonly environment: Environment;
  readonly buildMethod: BuildMethod;
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
      configInternalPackage({
        packageName,
        repoName,
        dependencies,
        devDependencies,
        peerDependencies,
        examples,
        buildMethod,
        isPublished,
        hasDocGen,
        keywords,
      }),
    ) as Config,
  );
