/**
 * Module that implements a Package (see README.md and Package.ts) that does not read the project
 * configuration file upon construction. A PackageUnloaded can be used for all operations that don't
 * require reading the project configuration file, e.g. removing all prod, node_modules...
 * directories, all existing configuration files.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data } from '../../shared-utils/types.js';
import * as PackageBase from './Base.js';

/**
 * Type of a PackageUnloaded
 *
 * @category Models
 */
export class Type extends PackageBase.Type {
  /** Type of the package */
  readonly type: 'Top' | 'MonoRepo' | 'OnePackageRepo' | 'SubRepo';
  /** Structure discriminant */
  readonly tag = 'Unloaded';

  /** Returns true is this is the top Package of a Project */
  _isTop(): boolean {
    return this.type === 'Top';
  }
  /** Returns true is this is a MonoRepo */
  _isMonoRepo(): boolean {
    return this.type === 'MonoRepo';
  }
  /** Returns true is this is a OnePackageRepo */
  _isOnePackageRepo(): boolean {
    return this.type === 'OnePackageRepo';
  }
  /** Returns true is this is a SubRepo */
  _isSubRepo(): boolean {
    return this.type === 'SubRepo';
  }

  /** Class constructor */
  private constructor(params: Data<Type>) {
    super(params);
    this.type = params.type;
  }

  /** Static constructor */
  static make(params: Data<Type>): Type {
    return new Type(params);
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: Data<Type>): Type => Type.make(params);
