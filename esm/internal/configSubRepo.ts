/** This config is the one to be used in the sub-package of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { basename, dirname, resolve } from 'node:path/posix';
import type { Config, Environment, PackageType, ReadonlyStringRecord } from "../types.js";
import { deepMerge } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

const _default= ({
    description,
    dependencies,
    devDependencies,
    internalPeerDependencies,
    externalPeerDependencies,
    examples,
    scripts,
    environment,
    packageType,
    isPublished,
    hasDocGen,
    keywords,
  }:{
readonly description: string;
readonly dependencies: ReadonlyStringRecord;
readonly devDependencies: ReadonlyStringRecord;
readonly internalPeerDependencies: ReadonlyStringRecord;
readonly externalPeerDependencies: ReadonlyStringRecord;
readonly examples: ReadonlyArray<string>;
readonly scripts: ReadonlyStringRecord;
readonly environment: Environment;
readonly packageType: PackageType;
readonly isPublished: boolean;
readonly hasDocGen: boolean;
readonly keywords: ReadonlyArray<string>;}):Config => {
  return deepMerge(
    configInternalBase({
      packageName,
      description,
      environment,
      scripts
    }),
    configInternalPackage({
      packageName,
      repoName,
      dependencies,
      devDependencies,
      internalPeerDependencies,
      externalPeerDependencies,
      examples,
      packageType,
      isPublished,
      hasDocGen,
      keywords,
    }),
  );
};
export default _default
