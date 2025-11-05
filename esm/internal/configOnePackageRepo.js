/** This config is the one to be used in a standalone repo which is either a library or an executable */
// This module must not import any external dependency. It must be runnable without a package.json
import { basename, resolve } from 'node:path/posix';
import { deepMerge } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';
import configInternalTop from './configInternalTop.js';
/** @import {Visibility, Config, Environment, ReadonlyStringRecord, PackageType} from "../types.js" */

const packageName = basename(resolve());

/**
 * @param {{
 *   readonly description: string;
 *   readonly dependencies: ReadonlyStringRecord;
 *   readonly devDependencies: ReadonlyStringRecord;
 *   readonly internalPeerDependencies: ReadonlyStringRecord;
 *   readonly externalPeerDependencies: ReadonlyStringRecord;
 *   readonly examples: ReadonlyArray<string>;
 *   readonly scripts: ReadonlyStringRecord;
 *   readonly environment: Environment;
 *   readonly packageType: PackageType;
 *   readonly visibility: Visibility;
 *   readonly hasDocGen: boolean;
 *   readonly keywords: ReadonlyArray<string>;
 * }} params
 * @returns {Config}
 */
export default ({
    description,
    dependencies,
    devDependencies,
    internalPeerDependencies,
    externalPeerDependencies,
    examples,
    scripts,
    environment,
    packageType,
    visibility,
    hasDocGen,
    keywords,
  }) => {

  return deepMerge(
    configInternalBase({
      packageName,
      description,
      environment,
    }),
    configInternalTop,
    configInternalPackage({
      packageName,
      repoName: packageName,
      dependencies,
      devDependencies,
      internalPeerDependencies,
      externalPeerDependencies,
      examples,
      scripts,
      packageType,
      visibility,
      hasDocGen,
      keywords,
    }),
  );
};
