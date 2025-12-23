/**
 * Module that represents an array of PackageUnloaded's, which can be a whole Project (see
 * README.md) or only part of it.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { join, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../../constants.js';
import { Data } from '../shared-utils/types.js';
import { readFolders } from '../shared-utils/utils.js';
import * as PackageUnloaded from './Package/Unloaded.js';

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
}

/**
 * Constructor that returns all the PackageUnloaded's in the active Project (see README.md for the
 * definition of a Project and of a Package), i.e. the project that contains the current working
 * directory
 *
 * @category Constructors
 */
export const fromActiveProject = async (): Promise<Type> => {
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
 * Combination of make and filter
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

/**
 * Displays the number of PackageUnloaded's in `self`
 *
 * @category Destructors
 */
export const showCount = (self: Type): void =>
  console.log(`Number of packages in scope: ${self.packages.length.toString()}`);

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
    showCount(result);
    return result;
  };
