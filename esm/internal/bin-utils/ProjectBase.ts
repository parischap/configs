/**
 * Module that represents an array of BasePackage's, which can be a whole Project (see README.md) or
 * only part of it.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { join, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../../constants.js';
import { Data, objectFromDataAndProto, Proto } from '../shared-utils/types.js';
import { readFolders } from '../shared-utils/utils.js';
import * as PackageBase from './Package/Base.js';

const _moduleTag = '@parischap/configs/internal/bin-utils/ProjectBase/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
export type _TypeId = typeof _TypeId;

/** Type of a Project */
export interface Type {
  /** Path to the project root */
  readonly topPackagePath: string;
  /** List of contained PackageBase's */
  readonly packages: ReadonlyArray<PackageBase.Type>;

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
 * from which this binary is executed.
 *
 * @category Constructors
 */
export const make = async (): Promise<Type> => {
  const currentPath = process.cwd();
  const splitPath = currentPath.split(sep);
  const firstPackagesIndex = splitPath.findIndex((split) => split === packagesFolderName);
  if (firstPackagesIndex <= 0) throw new Error('Could not find project root');
  const topPackagePath = join(...splitPath.slice(0, firstPackagesIndex));
  const topPackageName = splitPath[firstPackagesIndex - 1] as string;

  console.log(`Project '${topPackageName}' root identified at: '${topPackagePath}'`);

  const topPackagePackagesPath = join(topPackagePath, packagesFolderName);
  const repoNames = await readFolders({
    path: topPackagePackagesPath,
    dontFailOnInexistentPath: false,
  });

  return _make({
    topPackagePath,
    packages: [
      PackageBase.make({
        tag: 'TopPackage',
        name: topPackageName,
        parentName: topPackageName,
        path: topPackagePath,
        isConfigsPackage: false,
      }),
      ...(
        await Promise.all([
          ...repoNames.map(async (repoName) => {
            const repoPath = join(topPackagePackagesPath, repoName);
            const repoPackagesPath = join(repoPath, packagesFolderName);
            const subPackages = await readFolders({
              path: repoPackagesPath,
              dontFailOnInexistentPath: true,
            });

            const isMonoRepo = subPackages.length !== 0;

            return [
              PackageBase.make({
                tag: isMonoRepo ? 'MonoRepo' : 'OnePackageRepo',
                name: repoName,
                parentName: repoName,
                path: repoPath,
                isConfigsPackage: repoName === configsPackageName,
              }),
              ...subPackages.map((subPackageName) =>
                PackageBase.make({
                  tag: 'SubPackage',
                  name: subPackageName,
                  parentName: repoName,
                  path: join(repoPackagesPath, subPackageName),
                  isConfigsPackage: false,
                }),
              ),
            ];
          }),
        ])
      ).flat(),
    ],
  });
};

/**
 * Displays the number of BasePackage's in `self`
 *
 * @category Destructors
 */
export const showCount = (self: Type): void =>
  console.log(`Number of packages in scope: ${self.packages.length.toString()}`);

/**
 * Returns a copy of `self` in which only the PackageBase's that fulfill the predicate `predicate`
 * remain.
 *
 * @category Combinators
 */
export const filter =
  (predicate: (t: PackageBase.Type) => boolean) =>
  (self: Type): Type =>
    _make({
      topPackagePath: self.topPackagePath,
      packages: self.packages.filter(predicate),
    });

/**
 * Same as filter but displays the number of remaining PackageBase's
 *
 * @category Combinators
 */
export const filterAndShowCount =
  (predicate: (t: PackageBase.Type) => boolean) =>
  (self: Type): Type => {
    const result = filter(predicate)(self);
    showCount(result);
    return result;
  };
