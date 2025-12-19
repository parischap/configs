/**
 * Module that represents a MonoRepo which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Type of a PackageMonoRepo
 *
 * @category Models
 */
export interface Type extends PackageNoSourceBase.Type {
  /** Structure discriminant */
  readonly [PackageBase.tagSymbol]: 'MonoRepo';
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
  PackageBase.has(u) && PackageBase.tagSymbol in u && u[PackageBase.tagSymbol] === 'MonoRepo';

/** Prototype */
const parentProto = PackageNoSourceBase.proto;
const _proto: Proto<Type> = objectFromDataAndProto(parentProto, {
  [PackageBase.tagSymbol]: 'MonoRepo' as const,
  async [PackageAllBase.generateConfigFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return generateConfigFiles(exportsFilesOnly)(this);
  },
  [PackageBase.isTopPackageSymbol](this: Type) {
    return false;
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
}): Promise<Type> => _make(await PackageNoSourceBase.fromPackageBase(data));

/**
 * Generates the configuration files of `self`. If `exportsFilesOnly` is true, only the
 * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
 * generated
 */
export const generateConfigFiles =
  (exportsFilesOnly: boolean) =>
  async (self: Type): Promise<ConfigFiles.Type> =>
    ConfigFiles.merge(
      await PackageNoSourceBase.generateConfigFiles(exportsFilesOnly)(self),
      exportsFilesOnly ?
        ConfigFiles.empty
      : ConfigFiles.repo({
          name: self.name,
          description: self.description,
          // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
          hasDocGen: true,
          // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
          isPublished: true,
        }),
    );
