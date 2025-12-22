/**
 * Module that implements a no source Package (see README.md and Package.ts) that reads the project
 * configuration file upon construction.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import * as PackageMonoRepo from './MonoRepo.js';
import * as PackageTop from './Top.js';

/**
 * Type of a no source Package
 *
 * @category Models
 */
export type Type = PackageTop.Type | PackageMonoRepo.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => PackageTop.has(u) || PackageMonoRepo.has(u);
