/**
 * Module that serves as a base for all PackageAll types (see README.md and Package.ts). This module
 * does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/AllBase/';

/**
 * Symbol used for the `generateConfigFiles` property
 *
 * @category Models
 */
export const generateConfigFilesSymbol: unique symbol = Symbol.for(
  _moduleTag + 'generateConfigFiles/',
);

/**
 * Type of a PackageAllBase
 *
 * @category Models
 */
export interface Type extends PackageBase.Type {
  /** Package description */
  readonly description: string;
}

/** _prototype */
const parentProto = PackageBase.proto;
export const proto: Proto<Type> = parentProto;

/**
 * Generates the configuration files of `self`. If `exportsFilesOnly` is true, only the
 * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
 * generated
 */
export const generateConfigFiles =
  (exportsFilesOnly: boolean) =>
  (self: Type): Promise<ConfigFiles.Type> =>
    Promise.resolve(exportsFilesOnly ? ConfigFiles.empty : ConfigFiles.anyPackage(self));
