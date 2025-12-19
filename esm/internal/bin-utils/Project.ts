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
import * as PackageUnloaded from './Package/Unloaded.js';
import * as ProjectUnloaded from './ProjectUnloaded.js';

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

/** Prototype */
export const proto: Proto<Type> = {
  [_TypeId]: _TypeId,
};

const _make = (data: Data<Type>): Type => objectFromDataAndProto(proto, data);

/**
 * Constructor that returns all the PackageAll's in the active Project (see README.md for the
 * definition of a Project and of a Package), i.e. the project that contains the current working
 * directory.
 *
 * @category Constructors
 */
export const makeFiltered = async (
  predicate: (t: PackageUnloaded.Type) => boolean,
): Promise<Type> => {
  const unloadedProject = await ProjectUnloaded.make();
  const { packages, topPackagePath } = unloadedProject;

  const allSourcePackagesNames = packages
    .filter(PackageUnloaded.isSourcePackage)
    .map(PackageBase.name);
  const allPackagesPaths = packages.map((currentPackage) =>
    relative(topPackagePath, currentPackage.path),
  );

  return _make({
    topPackagePath,
    packages: await Promise.all(
      ProjectUnloaded.filterAndShowCount(predicate)(unloadedProject).packages.map(
        async (currentPackage) => {
          const type = currentPackage.type;
          switch (type) {
            case 'MonoRepo':
              return await PackageMonoRepo.fromPackageBase({ packageBase: currentPackage });
            case 'OnePackageRepo':
              return await PackageOnePackageRepo.fromPackageBase({ packageBase: currentPackage });
            case 'SubPackage':
              return await PackageSubPackage.fromPackageBase({ packageBase: currentPackage });
            case 'Top':
              return PackageTop.fromPackageBase({
                packageBase: currentPackage,
                allSourcePackagesNames,
                allPackagesPaths,
              });
          }
        },
      ),
    ),
  });
};
