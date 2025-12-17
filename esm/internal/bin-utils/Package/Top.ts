/**
 * Module that represents a TopPackage which is a sub-type of a Package (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { pnpmLockFilename, readMeFilename } from '../../shared-utils/constants.js';
import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import { toMiniGlobRegExp } from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/Top/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a TopPackage
 *
 * @category Models
 */
export interface Type extends PackageNoSourceBase.Type {
  /** Array of the names of all the source packages of the Project whose TopPackage is `self` */
  readonly allSourcePackagesNames: ReadonlyArray<string>;
  /** Array of the paths to all the packages of the Project whose TopPackage is `self` */
  readonly allPackagesPaths: ReadonlyArray<string>;
  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

/** _prototype */
const _proto: Proto<Type> = objectFromDataAndProto(PackageNoSourceBase.proto, {
  [_TypeId]: _TypeId,
  [PackageBase.externalConfigurationFilesSymbol]: toMiniGlobRegExp([
    readMeFilename,
    pnpmLockFilename,
  ]),
  async [PackageBase.toPackageFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await PackageNoSourceBase.proto[PackageBase.toPackageFilesSymbol](exportsFilesOnly),
      exportsFilesOnly ? ConfigFiles.empty : ConfigFiles.topPackageWorkspace(this),
    );
  },
} as const);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);
