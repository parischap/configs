/**
 * Module that represents an array of PackageAll's, which can be a whole Project (see README.md) or
 * only part of it.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { relative } from 'path';
import { Data, objectFromDataAndProto, Proto } from '../shared-utils/types.js';
import * as PackageAll from './Package/All.js';
import * as PackageBase from './Package/Base.js';
import * as PackageMonoRepo from './Package/MonoRepo.js';
import * as PackageOnePackageRepo from './Package/OnePackageRepo.js';
import * as PackageSubPackage from './Package/SubPackage.js';
import * as PackageTop from './Package/Top.js';
import * as ProjectBase from './ProjectBase.js';

const _moduleTag = '@parischap/configs/internal/bin-utils/Project/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
export type _TypeId = typeof _TypeId;

/** Type of a Project */
export interface Type {
  /** Path to the project root */
  readonly topPackagePath: string;
  /** List of contained PackageAll's */
  readonly packages: ReadonlyArray<PackageAll.Type>;

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
export const proto: Proto<Type> = {
  [_TypeId]: _TypeId,
};

const _make = (data: Data<Type>): Type => objectFromDataAndProto(proto, data);

/**
 * Constructor that returns all the PackageBase's in the active Project (see README.md for the
 * definition of a Project and of a Package). The active Project is the one that contains the path
 * from which this binary is executed. The active Package is the one in whose root this binary is
 * executed.
 *
 * @category Constructors
 */
export const makeFiltered = async (predicate: (t: PackageBase.Type) => boolean): Promise<Type> => {
  const packageBases = await ProjectBase.make();
  const { packages: bases, topPackagePath } = packageBases;

  const allSourcePackagesNames = bases.filter(PackageBase.isSourcePackage).map(PackageBase.name);
  const allPackagesPaths = bases.map((basePackage) => relative(topPackagePath, basePackage.path));

  return _make({
    topPackagePath,
    packages: await Promise.all(
      ProjectBase.filterAndShowCount(predicate)(packageBases).packages.map(async (packageBase) => {
        const tag = packageBase.tag;
        switch (tag) {
          case 'MonoRepo':
            return await PackageMonoRepo.fromPackageBase({ packageBase });
          case 'OnePackageRepo':
            return await PackageOnePackageRepo.fromPackageBase({ packageBase });
          case 'SubPackage':
            return await PackageSubPackage.fromPackageBase({ packageBase });
          case 'TopPackage':
            return PackageTop.fromPackageBase({
              packageBase,
              allSourcePackagesNames,
              allPackagesPaths,
            });
        }
      }),
    ),
  });
};
