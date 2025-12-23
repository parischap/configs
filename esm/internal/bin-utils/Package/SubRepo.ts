/**
 * Module that represents a SubRepo which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data } from '../../../types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';
import * as PackageSourceBase from './SourceBase.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/SubRepo/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a PackageSubRepo
 *
 * @category Models
 */
export class Type extends PackageSourceBase.Type {
  /** Returns true is this is the top Package of a Project */
  _isTop(): boolean {
    return false;
  }
  /** Returns true is this is a MonoRepo */
  _isMonoRepo(): boolean {
    return false;
  }
  /** Returns true is this is a OnePackageRepo */
  _isOnePackageRepo(): boolean {
    return false;
  }
  /** Returns true is this is a SubRepo */
  _isSubRepo(): boolean {
    return true;
  }

  /** Class constructor */
  private constructor(params: Data<Type>) {
    super(params);
  }

  /** Static constructor */
  static async fromPackageBase(params: { readonly packageBase: PackageBase.Type }): Promise<Type> {
    return new Type(await PackageSourceBase.fromPackageBase(params));
  }

  /** Generates the configuration files of `self` */
  override _generateConfigFiles(this: Type): Promise<ConfigFiles.Type> {
    return super._generateConfigFiles();
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
export const fromPackageBase = (params: {
  readonly packageBase: PackageBase.Type;
}): Promise<Type> => Type.fromPackageBase(params);
