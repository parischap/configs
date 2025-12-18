/**
 * Module that serves as a base for all Package types (see README.md and Package.ts). A BasePackage
 * does not read the project configuration file upon construction. It can be used for all operations
 * that don't require reading the project configuration file, e.g. removing all prod,
 * node_modules... directories, all existing configuration files.
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
import { Data, objectFromDataAndProto, Proto, Record } from '../../shared-utils/types.js';
import {
  readFiles,
  readFilesRecursively,
  readJsonFile,
  toMiniGlobRegExp,
} from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/Base/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
export type _TypeId = typeof _TypeId;

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
 * Symbol used for the `toConfigFiles` property
 *
 * @category Models
 */
export const toPackageFilesSymbol: unique symbol = Symbol.for(_moduleTag + 'toConfigFiles/');

/**
 * Type of a Base
 *
 * @category Models
 */
export interface Type {
  /** Tag of the package */
  readonly tag: 'TopPackage' | 'MonoRepo' | 'OnePackageRepo' | 'SubPackage';
  /** Name of the package */
  readonly name: string;
  /** Name of the parent MonoRepo of `self` if self is a SubPackage. Equal to `name` otherwise */
  readonly parentName: string;
  /** Path to the package root */
  readonly path: string;
  /** Flag that indicates if `self` is the configs package */
  readonly isConfigsPackage: boolean;
  /** Generates the ConfigFiles for `this` */
  readonly [toPackageFilesSymbol]: (exportsFilesOnly: boolean) => Promise<ConfigFiles.Type>;

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
  [toPackageFilesSymbol](this: Type, exportsFilesOnly: boolean): Promise<ConfigFiles.Type> {
    return Promise.resolve(exportsFilesOnly ? ConfigFiles.empty : ConfigFiles.anyPackage(this));
  },
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (data: Data<Type>): Type => objectFromDataAndProto(proto, data);

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
 * Predicate that returns true if `self` is the active Package, i.e. the package whose root is in
 * the current working directory
 *
 * @category Predicates
 */
export const isActive = (self: Type): boolean => relative(process.cwd(), self.path) === '';

/**
 * Predicate that returns true if `self` is a source Package
 *
 * @category Predicates
 */
export const isSourcePackage = (self: Type): boolean =>
  self.tag === 'OnePackageRepo' || self.tag === 'SubPackage';

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
            self.tag === 'TopPackage' ?
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
