/**
 * This config is the one to be used in a standalone repo which is either a library or an executable
 */
// Whatever external package this file uses must be added as peerDependency
import { basename, resolve } from 'node:path/posix';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';
import configInternalTop from './configInternalTop.js';
import { deepMerge } from './utils.js';
/**
 * @import {Visibility, Config, Environment, ReadonlyStringRecord} from "./types.d.ts"
 */

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
    configInternalTop,
    // Add configInternalPackage after configInternalTop so the good version of `@parischap/configs` gets installed for `@parischap/configs`
    configInternalPackage({
      packageName,
      repoName: packageName,
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
