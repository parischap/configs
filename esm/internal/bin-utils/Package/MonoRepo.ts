/**
 * Module that represents a MonoRepo which is a sub-type of a Package (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/MonoRepo/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a MonoRepo
 *
 * @category Models
 */
export interface Type extends PackageNoSourceBase.Type {
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
const parentProto = PackageNoSourceBase.proto;
const _proto: Proto<Type> = objectFromDataAndProto(parentProto, {
  [_TypeId]: _TypeId,
  async [PackageBase.toPackageFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await parentProto[PackageBase.toPackageFilesSymbol].call(this, exportsFilesOnly),
      exportsFilesOnly ?
        ConfigFiles.empty
      : ConfigFiles.repo({
          ...this,
          // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
          hasDocGen: true,
          // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
          isPublished: true,
        }),
    );
  },
} as const);

const _make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);

/**
 * Constructor
 *
 * @category Constructors
 */
export const fromPackageBase = async (data: {
  readonly packageBase: PackageBase.Type;
}): Promise<Type> => _make(await PackageNoSourceBase.fromPackageBase(data));
