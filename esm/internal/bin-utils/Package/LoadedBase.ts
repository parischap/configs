/**
 * Module that serves as a base for all PackageAll types (see README.md and Package.ts). This module
 * does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { join } from 'node:path';
import {
  foldersWithoutConfigFiles,
  packagesFolderName,
  projectConfigFilename,
  readMeFilename,
  viteTimeStampFilenamePattern,
} from '../../shared-utils/constants.js';
import {
  type Data,
  readFiles,
  readFilesRecursively,
  toMiniGlobRegExp,
} from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/LoadedBase/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

export const EXTERNAL_CONFIGURATION_FILES_FOR_ALL_PACKAGES_BUT_TOP = toMiniGlobRegExp([
  readMeFilename,
  projectConfigFilename,
  viteTimeStampFilenamePattern,
]);

/**
 * Type of a PackageLoadedBase
 *
 * @category Models
 */
export abstract class Type extends PackageBase.Type {
  /** Package description */
  readonly description: string;

  /** Class constructor */
  protected constructor(params: Data<Type>) {
    super(params);
    this.description = params.description;
  }

  /** Generates the configuration files of `self` */
  _generateConfigFiles(this: Type, mode: ConfigFiles.Mode): Promise<ConfigFiles.Type> {
    return Promise.resolve(ConfigFiles.anyPackage({ mode, packageLoadedBase: this }));
  }

  /**
   * Returns an array of the paths of the configuration files present in `self`. The paths are
   * expressed relative to the root path of `self`
   */
  async _getPathsOfExistingConfigFiles(this: Type): Promise<Array<string>> {
    const { path } = this;

    return [
      ...(
        await readFilesRecursively({
          dontFailOnInexistentPath: false,
          foldersToExclude: foldersWithoutConfigFiles,
          path,
        })
      ).map(({ relativePath }) => relativePath),
      ...(
        await readFiles({
          dontFailOnInexistentPath: true,
          path: join(path, packagesFolderName),
        })
      ).map((name) => `${packagesFolderName}/${name}`),
    ];
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Returns an array of the paths of the configuration files present in `self`. The paths are
 * expressed relative to the root path of `self`
 *
 * @category Destructors
 */
export const getPathsOfExistingConfigFiles = (self: Type): Promise<Array<string>> =>
  self._getPathsOfExistingConfigFiles();

/**
 * Cleans the configuration files present in `self`
 *
 * @category Destructors
 */
export const cleanConfigFiles = async (self: Type): Promise<void> => {
  const configFiles = await getPathsOfExistingConfigFiles(self);

  await Promise.all(
    configFiles.map((relativePath) => PackageBase.rmAndLogIfSuccessful(relativePath)(self)),
  );
};

/**
 * Cleans `self` (removes configuration files, node_modules and prod folder)
 *
 * @category Destructors
 */
export const clean = async (self: Type): Promise<void> => {
  const configFiles = await getPathsOfExistingConfigFiles(self);

  await Promise.all(
    configFiles.map((relativePath) => PackageBase.rmAndLogIfSuccessful(relativePath)(self)),
  );

  await PackageBase.cleanNodeModules(self);

  await PackageBase.cleanProd(self);
};

/**
 * Generates the ConfigFiles for `self`
 *
 * @categrory Destructors
 */
export const generateConfigFiles = (
  self: Type,
  mode: ConfigFiles.Mode,
): Promise<ConfigFiles.Type> => self._generateConfigFiles(mode);

/**
 * Generates and saves the configuration files for `self` in mode `mode`
 *
 * @categrory Destructors
 */
export const generateAndSaveConfigFiles = async (
  self: Type,
  mode: ConfigFiles.Mode,
): Promise<ConfigFiles.Type> => {
  const configFiles = await self._generateConfigFiles(mode);

  await ConfigFiles.save({ packageName: self.name, packagePath: self.path })(configFiles);
  return configFiles;
};

/**
 * - Generates the configuration files for `self` in Dev mode,
 * - saves them,
 * - checks that no unexpected configuration files are present in `self`
 *
 * @categrory Destructors
 */
export const generateSaveAndCheckDevConfigFiles = async (self: Type): Promise<void> => {
  const generatedConfigFiles = await generateAndSaveConfigFiles(self, ConfigFiles.Mode.Dev);

  const existingConfigFiles = await getPathsOfExistingConfigFiles(self);

  const filesToCreate = Object.keys(generatedConfigFiles.configurationFiles);
  const unexpectedConfigFiles = existingConfigFiles.filter(
    (relativePath) => !filesToCreate.includes(relativePath),
  );
  if (unexpectedConfigFiles.length > 0) {
    throw new Error(
      `Package '${self.name}': following unexpected files were found: '${unexpectedConfigFiles.join("', '")}'`,
    );
  }
};
