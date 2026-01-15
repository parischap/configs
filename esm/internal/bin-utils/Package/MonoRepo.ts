/**
 * Module that represents a MonoRepo which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import type { Data } from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';
import type * as PackageBase from './Base.js';
import * as PackageLoadedBase from './LoadedBase.js';
import * as PackageLoadedNoSource from './LoadedNoSource.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/MonoRepo/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a PackageMonoRepo
 *
 * @category Models
 */
export class Type extends PackageLoadedNoSource.Type {
  // In a monorepo, we need to have the docGen stuff in case one of the subrepos needs to be documented
  get hasDocGen() {
    return true;
  }
  // In a monorepo, we need to have the publish script in case one of the subrepos needs to be published
  get isPublished() {
    return true;
  }

  /** Returns true is this is the top Package of a Project */
  _isTop(): boolean {
    return false;
  }
  /** Returns true is this is a MonoRepo */
  _isMonoRepo(): boolean {
    return true;
  }
  /** Returns true is this is a OnePackageRepo */
  _isOnePackageRepo(): boolean {
    return false;
  }
  /** Returns true is this is a SubRepo */
  _isSubRepo(): boolean {
    return false;
  }

  /** Class constructor */
  private constructor(params: Omit<Data<Type>, 'hasDocGen' | 'isPublished'>) {
    super(params);
  }

  /** Static constructor */
  static async fromPackageBase(params: { readonly packageBase: PackageBase.Type }): Promise<Type> {
    return new Type(await PackageLoadedNoSource.fromPackageBase(params));
  }

  /** Generates the configuration files of `self` */
  override async _generateConfigFiles(
    this: Type,
    mode: ConfigFiles.Mode,
  ): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await super._generateConfigFiles(mode),
      ConfigFiles.repo({
        mode,
        packageRepo: this,
      }),
    );
  }

  /**
   * Returns an array of the paths of the configuration files present in `self`. The paths are
   * expressed relative to the root path of `self`
   */
  override async _getPathsOfExistingConfigFiles(this: Type): Promise<Array<string>> {
    return (await super._getPathsOfExistingConfigFiles()).filter(
      (relativePath) =>
        !PackageLoadedBase.EXTERNAL_CONFIGURATION_FILES_FOR_ALL_PACKAGES_BUT_TOP.test(relativePath),
    );
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const fromPackageBase =  async (params: {
  readonly packageBase: PackageBase.Type;
}): Promise<Type> => Type.fromPackageBase(params);
