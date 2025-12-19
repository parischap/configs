/**
 * Module that implements a Package (see README.md and Package.ts) that does not read the project
 * configuration file upon construction. A PackageUnloaded can be used for all operations that don't
 * require reading the project configuration file, e.g. removing all prod, node_modules...
 * directories, all existing configuration files.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as PackageBase from './Base.js';

/**
 * Type of a PackageUnloaded
 *
 * @category Models
 */
export interface Type extends PackageBase.Type {
  /** Type of the package */
  readonly type: 'TopPackage' | 'MonoRepo' | 'OnePackageRepo' | 'SubPackage';
  /** Structure discriminant */
  readonly [PackageBase.tagSymbol]: 'Unloaded';
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type =>
  PackageBase.has(u) && PackageBase.tagSymbol in u && u[PackageBase.tagSymbol] === 'Unloaded';

/** _prototype */
const parentProto = PackageBase.proto;
const _proto: Proto<Type> = objectFromDataAndProto(parentProto, {
  [PackageBase.tagSymbol]: 'Unloaded' as const,
});

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);
