/**
 * Module that represents a Project (see ReadMe.md). Pacakages are stored linearly in an Array, not
 * in a tree.
 */
// This module must not import any external dependency. It must be runnable without a package.json

import { join, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../shared-utils/constants.js';
import { readFolders } from '../shared-utils/utils.js';
import * as Package from './Package.js';

/** Type of a Project */
export type Type = ReadonlyArray<Package.Type>;

/**
 * Constructor that returns all the packages of the Project that contains the current path
 *
 * @category Constructors
 */
export const make = async (): Promise<Type> => {
  const splitPath = process.cwd().split(sep);
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

  const allPackagesButTop = (
    await Promise.all(
      repoNames.map(async (repoName) => {
        const repoPath = join(topPackagePackagesPath, repoName);
        const repoPackagesPath = join(repoPath, packagesFolderName);
        const subPackages = await readFolders({
          path: repoPackagesPath,
          dontFailOnInexistentPath: true,
        });

        const isMonoRepo = subPackages.length !== 0;

        return [
          isMonoRepo ?
            Package.MonoRepo.make({ name: repoName, path: repoPath })
          : Package.OnePackageRepo.make({
              name: repoName,
              path: repoPath,
              isConfigsPackage: repoName === configsPackageName,
            }),
          ...subPackages.map((subPackageName) =>
            Package.SubPackage.make({
              name: subPackageName,
              path: join(repoPackagesPath, subPackageName),
              parentName: repoName,
            }),
          ),
        ];
      }),
    )
  ).flat();

  const allSourcePackages = allPackagesButTop.filter(Package.isSourcePackage).map(Package.name);
  const allPackagesPaths = ['.', ...allPackagesButTop.map(Package.path)];

  const allPackages: Type = [
    Package.TopPackage.make({
      name: topPackageName,
      path: topPackagePath,
      allSourcePackages,
      allPackagesPaths,
    }),
    ...allPackagesButTop,
  ];

  console.log(`Number of packages in scope: ${allPackages.length}`);
  return allPackages;
};
