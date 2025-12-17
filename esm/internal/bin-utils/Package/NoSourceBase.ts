/** Module that serves as a base for all no source Package types (see README.md and Package.ts) */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/NoSourceBase/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a NoSourceBase
 *
 * @category Models
 */
export interface Type extends PackageBase.Type {
  /** Description of the package */
  readonly description: string;

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
export const proto: Proto<Type> = objectFromDataAndProto(PackageBase.proto, {
  [_TypeId]: _TypeId,
  async [PackageBase.toPackageFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return Promise.resolve(
      ConfigFiles.merge(
        await PackageBase.proto[PackageBase.toPackageFilesSymbol](exportsFilesOnly),
        exportsFilesOnly ? ConfigFiles.empty : ConfigFiles.noSourcePackage(this),
      ),
    );
  },
} as const);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (data: Data<Type>): Type => objectFromDataAndProto(proto, data);
