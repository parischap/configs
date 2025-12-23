/**
 * Module that represents a PackageTop which is a sub-type of a PackageAll (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Type of a PackageTop
 *
 * @category Models
 */
export class Type extends PackageNoSourceBase.Type {
  /** Structure discriminant */
  readonly tag = 'Top';
  /** Array of the names of all the source packages of the Project whose Top is `self` */
  readonly allSourcePackagesNames: ReadonlyArray<string>;
  /** Array of the paths to all the packages of the Project whose Top is `self` */
  readonly allPackagesPaths: ReadonlyArray<string>;

  /** Returns true is this is the top Package of a Project */
  _isTop(): boolean {
    return true;
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
    return false;
  }

  /** Class constructor */
  private constructor(params: Data<Type>) {
    super(params);
    this.allSourcePackagesNames = params.allSourcePackagesNames;
    this.allPackagesPaths = params.allPackagesPaths;
  }

  /** Static constructor */
  static fromPackageBase({
    packageBase,
    allSourcePackagesNames,
    allPackagesPaths,
  }: {
    readonly packageBase: PackageBase.Type;
    readonly allSourcePackagesNames: ReadonlyArray<string>;
    readonly allPackagesPaths: ReadonlyArray<string>;
  }): Type {
    return new Type({
      ...(packageBase as Data<PackageBase.Type>),
      allSourcePackagesNames,
      allPackagesPaths,
      description: 'Top package of my projects',
    });
  }

  /** Generates the configuration files of `self` */
  override async _generateConfigFiles(this: Type): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await super._generateConfigFiles(),
      ConfigFiles.topPackageWorkspace(this),
    );
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const fromPackageBase = (params: {
  readonly packageBase: PackageBase.Type;
  readonly allSourcePackagesNames: ReadonlyArray<string>;
  readonly allPackagesPaths: ReadonlyArray<string>;
}): Type => Type.fromPackageBase(params);
