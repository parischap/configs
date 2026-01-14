/**
 * Module that represents an array of PackageUnloaded's, which can be a whole Project (see
 * README.md) or only part of it. The constructor `fromActiveProject` creates a PackageUnloaded for
 * each Package in the active Project, i.e. the one that contains the Current Working Directory.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { existsSync } from 'fs';
import { resolve } from 'node:path';
import { join, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../shared-utils/constants.js';
import { readFolders, type Data } from '../shared-utils/utils.js';
import * as PackageUnloaded from './Package/Unloaded.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/ProjectUnloaded/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a ProjectUnloaded
 *
 * @category Models
 */
export class Type {
  /** Path to the project root */
  readonly topPackagePath: string;
  /** List of contained PackageUnloaded's */
  readonly packages: ReadonlyArray<PackageUnloaded.Type>;

  /** Class constructor */
  private constructor(params: Data<Type>) {
    this.topPackagePath = params.topPackagePath;
    this.packages = params.packages;
  }

  /** Static constructor */
  static make(params: Data<Type>): Type {
    return new Type(params);
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor that returns all the PackageUnloaded's in the active Project (see README.md for the
 * definition of a Project and of a Package), i.e. the project that contains the current working
 * directory
 *
 * @category Constructors
 */
export const fromActiveProject = async (): Promise<Type> => {
  // With resolve, we are sure to get an absolute path
  const currentPath = resolve();
  const splitPath = currentPath.split(sep);
  const firstPackagesIndex = splitPath.findIndex((split) => split === packagesFolderName);
  const indexAfterTop =
    firstPackagesIndex > 0 ? firstPackagesIndex
    : existsSync(packagesFolderName) ? splitPath.length
    : -1;
  if (indexAfterTop <= 0) throw new Error('Could not find project root');
  const topPackageName = splitPath[indexAfterTop - 1] as string;
  const topPackagePath = join(...splitPath.slice(0, indexAfterTop));

  console.log(`Project '${topPackageName}' root identified at: '${topPackagePath}'`);

  const topPackagePackagesPath = join(topPackagePath, packagesFolderName);
  const repoNames = await readFolders({
    path: topPackagePackagesPath,
    dontFailOnInexistentPath: false,
  });

  return Type.make({
    topPackagePath,
    packages: [
      PackageUnloaded.make({
        type: 'Top',
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
            const subRepos = await readFolders({
              path: repoPackagesPath,
              dontFailOnInexistentPath: true,
            });

            const isMonoRepo = subRepos.length !== 0;

            return [
              PackageUnloaded.make({
                type: isMonoRepo ? 'MonoRepo' : 'OnePackageRepo',
                name: repoName,
                parentName: repoName,
                path: repoPath,
                isConfigsPackage: repoName === configsPackageName,
              }),
              ...subRepos.map((subRepoName) =>
                PackageUnloaded.make({
                  type: 'SubRepo',
                  name: subRepoName,
                  parentName: repoName,
                  path: join(repoPackagesPath, subRepoName),
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
 * Displays the number of PackageUnloaded's in `self`
 *
 * @category Destructors
 */
export const showCount = (self: Type): void => {
  console.log(`Number of packages in scope: ${self.packages.length.toString()}`);
};

/**
 * Returns a copy of `self` in which only the PackageUnloaded's that fulfill predicate `predicate`
 * remain.
 *
 * @category Combinators
 */
export const filter =
  (predicate: (t: PackageUnloaded.Type) => boolean) =>
  (self: Type): Type =>
    Type.make({
      topPackagePath: self.topPackagePath,
      packages: self.packages.filter(predicate),
    });

/**
 * Same as filter but displays the number of remaining PackageUnloaded's
 *
 * @category Combinators
 */
export const filterAndShowCount =
  (predicate: (t: PackageUnloaded.Type) => boolean) =>
  (self: Type): Type => {
    const result = filter(predicate)(self);
    /* eslint-disable-next-line functional/no-expression-statements */
    showCount(result);
    return result;
  };

/**
 * Combination of fromActiveProject and filter
 *
 * @category Constructors
 */
export const filteredFromActiveProject = async (
  predicate: (t: PackageUnloaded.Type) => boolean,
): Promise<Type> => filter(predicate)(await fromActiveProject());

/**
 * Combination of make and filterAndShowCount
 *
 * @category Constructors
 */
export const filteredFromActiveProjectAndShowCount = async (
  predicate: (t: PackageUnloaded.Type) => boolean,
): Promise<Type> => filterAndShowCount(predicate)(await fromActiveProject());
