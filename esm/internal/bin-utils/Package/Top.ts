/**
 * Module that represents a PackageTop which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Type of a PackageTop
 *
 * @category Models
 */
export interface Type extends PackageNoSourceBase.Type {
  /** Structure discriminant */
  readonly [PackageBase.tagSymbol]: 'Top';
  /** Array of the names of all the source packages of the Project whose Top is `self` */
  readonly allSourcePackagesNames: ReadonlyArray<string>;
  /** Array of the paths to all the packages of the Project whose Top is `self` */
  readonly allPackagesPaths: ReadonlyArray<string>;
  /**
   * Generates the configuration files of `this`. If `exportsFilesOnly` is true, only the
   * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
   * generated
   */
  readonly [PackageAllBase.generateConfigFilesSymbol]: () => Promise<ConfigFiles.Type>;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type =>
  PackageBase.has(u) && PackageBase.tagSymbol in u && u[PackageBase.tagSymbol] === 'Top';

/** Prototype */
const parentProto = PackageNoSourceBase.proto;
const _proto: Proto<Type> = objectFromDataAndProto(parentProto, {
  [PackageBase.tagSymbol]: 'Top' as const,
  async [PackageAllBase.generateConfigFilesSymbol](this: Type): Promise<ConfigFiles.Type> {
    return generateConfigFiles(this);
  },
  [PackageBase.isTopPackageSymbol](this: Type) {
    return true;
  },
});

const _make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);

/**
 * Constructor
 *
 * @category Constructors
 */
export const fromPackageBase = ({
  packageBase,
  allSourcePackagesNames,
  allPackagesPaths,
}: {
  readonly packageBase: PackageBase.Type;
  readonly allSourcePackagesNames: ReadonlyArray<string>;
  readonly allPackagesPaths: ReadonlyArray<string>;
}): Type =>
  _make({
    ...packageBase,
    allSourcePackagesNames,
    allPackagesPaths,
    description: 'Top package of my projects',
  });

/**
 * Generates the configuration files of `self`. If `exportsFilesOnly` is true, only the
 * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
 * generated
 */
export const generateConfigFiles = async (self: Type): Promise<ConfigFiles.Type> =>
  ConfigFiles.merge(
    await PackageNoSourceBase.generateConfigFiles(self),
    ConfigFiles.topPackageWorkspace(self),
  );
