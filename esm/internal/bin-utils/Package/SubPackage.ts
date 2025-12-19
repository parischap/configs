/**
 * Module that represents a SubPackage which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageBase from './Base.js';
import * as PackageSourceBase from './SourceBase.js';

/**
 * Type of a PackageSubPackage
 *
 * @category Models
 */
export interface Type extends PackageSourceBase.Type {
  /** Structure discriminant */
  readonly [PackageBase.tagSymbol]: 'SubPackage';
  /**
   * Generates the configuration files of `this`. If `exportsFilesOnly` is true, only the
   * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
   * generated
   */
  readonly [PackageAllBase.generateConfigFilesSymbol]: (
    exportsFilesOnly: boolean,
  ) => Promise<ConfigFiles.Type>;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type =>
  PackageBase.has(u) && PackageBase.tagSymbol in u && u[PackageBase.tagSymbol] === 'SubPackage';

/** _prototype */
const parentProto = PackageSourceBase.proto;
const _proto: Proto<Type> = objectFromDataAndProto(parentProto, {
  [PackageBase.tagSymbol]: 'SubPackage' as const,
  async [PackageAllBase.generateConfigFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return generateConfigFiles(exportsFilesOnly)(this);
  },
});

const _make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);

/**
 * Constructor
 *
 * @category Constructors
 */
export const fromPackageBase = async (data: {
  readonly packageBase: PackageBase.Type;
}): Promise<Type> => _make(await PackageSourceBase.fromPackageBase(data));

/**
 * Generates the configuration files of `self`. If `exportsFilesOnly` is true, only the
 * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
 * generated
 */
export const generateConfigFiles =
  (exportsFilesOnly: boolean) =>
  (self: Type): Promise<ConfigFiles.Type> =>
    PackageSourceBase.generateConfigFiles(exportsFilesOnly)(self);
