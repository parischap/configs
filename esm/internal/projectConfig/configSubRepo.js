/**
 * This config is the one to be used in the sub-package of a monorepo.
 */
// Whatever external package this file uses must be added as peerDependency
import { basename, dirname, resolve } from 'node:path/posix';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';
import { deepMerge } from './utils.js';
/**
 * @import {Config, Environment, Visibility, ReadonlyStringRecord} from "./types.d.ts"
 */

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

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
 *   readonly bundled: boolean;
 *   readonly visibility: Visibility;
 *   readonly hasDocGen: boolean;
 *   readonly keywords: ReadonlyArray<string>;
 * }} params
 * @returns {Config}
 */

export default (params) => {
  const {
    description,
    dependencies,
    devDependencies,
    internalPeerDependencies,
    externalPeerDependencies,
    examples,
    scripts,
    environment,
    bundled,
    visibility,
    hasDocGen,
    keywords,
  } = params;
  return deepMerge(
    configInternalBase({
      packageName,
      environment,
    }),
    configInternalPackage({
      packageName,
      repoName,
      description,
      dependencies,
      devDependencies,
      internalPeerDependencies,
      externalPeerDependencies,
      examples,
      scripts,
      bundled,
      visibility,
      hasDocGen,
      keywords,
    }),
  );
};
