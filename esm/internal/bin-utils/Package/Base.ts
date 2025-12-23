/**
 * Module that serves as a base for all Package types (see README.md and Package.ts). This module
 * does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { rm } from 'fs/promises';
import { join, relative } from 'path';
import {
  foldersWithoutConfigFiles,
  npmFolderName,
  packagesFolderName,
  pnpmLockFilename,
  prodFolderName,
  projectConfigFilename,
  readMeFilename,
  tsBuildInfoFolderName,
  viteTimeStampFilenamePattern,
} from '../../../constants.js';
import { Data, Record } from '../../shared-utils/types.js';
import {
  readFiles,
  readFilesRecursively,
  readJsonFile,
  toMiniGlobRegExp,
} from '../../shared-utils/utils.js';

const EXTERNAL_CONFIGURATION_FILES_FOR_TOP_PACKAGE = toMiniGlobRegExp([
  readMeFilename,
  pnpmLockFilename,
]);

const EXTERNAL_CONFIGURATION_FILES_FOR_OTHER_PACKAGES = toMiniGlobRegExp([
  readMeFilename,
  projectConfigFilename,
  viteTimeStampFilenamePattern,
]);

/**
 * Type of a PackageBase
 *
 * @category Models
 */
export abstract class Type {
  /** Package name */
  readonly name: string;
  /** Name of the parent MonoRepo of `self` if self is a SubRepo. Equal to `name` otherwise */
  readonly parentName: string;
  /** Path to the package root */
  readonly path: string;
  /** Flag that indicates if `self` is the configs package */
  readonly isConfigsPackage: boolean;
  /** Returns true is this is the top Package of a Project */
  abstract _isTop(): boolean;
  /** Returns true is this is a MonoRepo */
  abstract _isMonoRepo(): boolean;
  /** Returns true is this is a OnePackageRepo */
  abstract _isOnePackageRepo(): boolean;
  /** Returns true is this is a SubRepo */
  abstract _isSubRepo(): boolean;
  /** Class constructor */
  protected constructor(params: Data<Type>) {
    this.name = params.name;
    this.parentName = params.parentName;
    this.path = params.path;
    this.isConfigsPackage = params.isConfigsPackage;
  }
}

/**
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name = (self: Type): string => self.name;

/**
 * Returns the `path` property of `self`
 *
 * @category Destructors
 */
export const path = (self: Type): string => self.path;

/**
 * Returns the `isConfigsPackage` property of `self`
 *
 * @category Destructors
 */
export const isConfigsPackage = (self: Type): boolean => self.isConfigsPackage;

/**
 * Returns true if `self` is the top package
 *
 * @category Predicates
 */
export const isTop = (self: Type): boolean => self._isTop();

/**
 * Returns true if `self` is a MonoRepo
 *
 * @category Predicates
 */
export const isMonoRepo = (self: Type): boolean => self._isMonoRepo();

/**
 * Returns true if `self` is a OnePackageRepo
 *
 * @category Predicates
 */
export const isOnePackageRepo = (self: Type): boolean => self._isOnePackageRepo();

/**
 * Returns true if `self` is a SubRepo
 *
 * @category Predicates
 */
export const isSubRepo = (self: Type): boolean => self._isSubRepo();

/**
 * Returns true if `self` is a source Package
 *
 * @category Predicates
 */
export const isSource = (self: Type): boolean => self._isOnePackageRepo() || self._isSubRepo();

/**
 * Returns true if `self` is a no source Package
 *
 * @category Predicates
 */
export const isNoSource = (self: Type): boolean => self._isTop() || self._isMonoRepo();

/**
 * Returns true if `self` is the active Package, i.e. the package whose root is in the current
 * working directory
 *
 * @category Predicates
 */
export const isActive = (self: Type): boolean => relative(process.cwd(), self.path) === '';

/**
 * Reads the configuration file of `self`
 *
 * @category Destructors
 */
export const readProjectConfigFile = async (self: Type): Promise<Record> =>
  readJsonFile(join(self.path, projectConfigFilename));

/**
 * Returns an array of the paths of the configuration files present in `self`. The paths are
 * expressed relative to the root path of `self`
 *
 * @category Destructors
 */
export const getPathsOfExistingConfigFiles = async (self: Type): Promise<Array<string>> => {
  const { path } = self;

  return [
    ...(
      await readFilesRecursively({
        path,
        foldersToExclude: foldersWithoutConfigFiles,
        dontFailOnInexistentPath: false,
      })
    )
      .map(({ relativePath }) => relativePath)
      .filter(
        (relativePath) =>
          !(
            isTop(self) ?
              EXTERNAL_CONFIGURATION_FILES_FOR_TOP_PACKAGE
            : EXTERNAL_CONFIGURATION_FILES_FOR_OTHER_PACKAGES).test(relativePath),
      ),
    ...(
      await readFiles({
        path: join(path, packagesFolderName),
        dontFailOnInexistentPath: true,
      })
    ).map((name) => `${packagesFolderName}/${name}`),
  ];
};

/**
 * Deletes in `self` the file or folder at `relativePath` expressed relatively to the root of
 * `self`. Logs the good completion of the task only if a file or folder was effectively deleted
 *
 * @category Destructors
 */
export const rmAndLogIfSuccessful =
  (relativePath: string) =>
  async (self: Type): Promise<void> => {
    try {
      const { path: packagePath, name: packageName } = self;
      /* eslint-disable-next-line functional/no-expression-statements */
      await rm(join(packagePath, relativePath), { recursive: true });
      console.log(`'${packageName}': deleted '${relativePath}'`);
    } catch (e: unknown) {
      if (!(e instanceof Error) || !('code' in e) || e.code !== 'ENOENT') throw e;
    }
  };

/**
 * Cleans prod directories of `self`
 *
 * @category Destructors
 */
export const cleanProdFolders = async (self: Type): Promise<void> => {
  /* eslint-disable-next-line functional/no-expression-statements*/
  await rmAndLogIfSuccessful(prodFolderName)(self);
  /* eslint-disable-next-line functional/no-expression-statements*/
  await rmAndLogIfSuccessful(tsBuildInfoFolderName)(self);
};

/**
 * Cleans prod directories of `self`
 *
 * @category Destructors
 */
export const cleanNodeModulesFolder = async (self: Type): Promise<void> => {
  /* eslint-disable-next-line functional/no-expression-statements*/
  await rmAndLogIfSuccessful(npmFolderName)(self);
};
