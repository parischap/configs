/**
 * Module that implements a source Package (see README.md and Package.ts) that reads the project
 * configuration file upon construction.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import * as PackageOnePackageRepo from './OnePackageRepo.js';
import * as PackageSubPackage from './SubPackage.js';

/**
 * Type of a source Package
 *
 * @category Models
 */
export type Type = PackageOnePackageRepo.Type | PackageSubPackage.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type =>
  PackageOnePackageRepo.has(u) || PackageSubPackage.has(u);
