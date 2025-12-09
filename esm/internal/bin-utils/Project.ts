import { join, sep } from 'path';
import { configsPackageName, packagesFolderName } from '../shared-utils/constants.js';
import { readFolders } from '../shared-utils/utils.js';
import * as Package from './Package.js';

export type Type = ReadonlyArray<Package.Type>;

/** Returns all the packages of the Project that contains the current path */
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

  const allPackages: Type = [
    Package.TopPackage.make({ name: topPackageName, absolutePath: topPackagePath }),
    ...(
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
              Package.MonoRepo.make({ name: repoName, absolutePath: repoPath })
            : Package.OnePackageRepo.make({
                name: repoName,
                absolutePath: repoPath,
                isConfigsPackage: repoName === configsPackageName,
              }),
            ...subPackages.map((subPackageName) =>
              Package.SubPackage.make({
                name: subPackageName,
                absolutePath: join(repoPackagesPath, subPackageName),
                parentName: repoName,
              }),
            ),
          ];
        }),
      )
    ).flat(),
  ];

  console.log(`Scope: all ${allPackages.length} package(s)`);
  return allPackages;
};
