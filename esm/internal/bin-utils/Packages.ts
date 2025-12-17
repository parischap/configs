/**
 * Module that represents an array of Package's, which can be a whole Project (see README.md) or
 * only part of it.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { join, relative, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../shared-utils/constants.js';
import { readFolders } from '../shared-utils/utils.js';
import * as PackageAll from './Package/All.js';
import * as PackageMonoRepo from './Package/MonoRepo.js';
import * as PackageOnePackageRepo from './Package/OnePackageRepo.js';
import * as PackageSubPackage from './Package/SubPackage.js';
import * as PackageTop from './Package/Top.js';

/** Type of a Packages */
export interface Type extends ReadonlyArray<PackageAll.Type> {}

/**
 * Constructor that returns all the packages in the active Project or only the active Package if
 * used with the `activePackageOnly` flag (see README.md for the definition of a Project and of a
 * Package). The active Project is the one that contains the path from which this binary is
 * executed. The active Package is the one in whose root this binary is executed.
 *
 * @category Constructors
 */
export const make = async (): Promise<Type> => {
  const currentPath = process.cwd();
  const splitPath = currentPath.split(sep);
  const firstPackagesIndex = splitPath.findIndex((split) => split === packagesFolderName);
  if (firstPackagesIndex <= 0) throw new Error('Could not find project root');
  const topPackagePath = relative(currentPath, join(...splitPath.slice(0, firstPackagesIndex)));
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
            await PackageMonoRepo.make({ name: repoName, path: repoPath })
          : await PackageOnePackageRepo.make({
              name: repoName,
              path: repoPath,
              isConfigsPackage: repoName === configsPackageName,
            }),
          ...(await Promise.all(
            subPackages.map((subPackageName) =>
              PackageSubPackage.make({
                name: subPackageName,
                path: join(repoPackagesPath, subPackageName),
                parentName: repoName,
              }),
            ),
          )),
        ];
      }),
    )
  ).flat();

  const allSourcePackages = allPackagesButTop.filter(PackageAll.isSourcePackage);

  const packages = [
    PackageTop.make({
      name: topPackageName,
      path: topPackagePath,
      allSourcePackagesNames: allSourcePackages.map(PackageAll.name),
      allPackagesPaths: ['.', ...allPackagesButTop.map(PackageAll.path)],
    }),
    ...allPackagesButTop,
  ].filter(
    (currentPackage) => !activePackageOnly || relative(currentPath, currentPackage.path) === '',
  );

  console.log(`Number of packages in scope: ${packages.length.toString()}`);
  return _make({ packages: packages });
};
