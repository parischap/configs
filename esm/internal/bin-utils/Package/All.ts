/**
 * Module that implements a Package (see README.md and Package.ts) that reads the project
 * configuration file upon construction. A PackageAll can be used to generate the configuration
 * files of a package, check if no unwanted configuration files are present in a package, ...
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageMonoRepo from './MonoRepo.js';
import * as PackageOnePackageRepo from './OnePackageRepo.js';
import * as PackageSubPackage from './SubPackage.js';
import * as PackageTop from './Top.js';

/**
 * Type of a Package
 *
 * @category Models
 */
export type Type =
  | PackageTop.Type
  | PackageMonoRepo.Type
  | PackageOnePackageRepo.Type
  | PackageSubPackage.Type;

/**
 * Generates the ConfigFiles for `self`
 *
 * @categrory Destructors
 */
export const generateConfigFiles = (
  self: Type,
  { exportsFilesOnly = false }: { readonly exportsFilesOnly?: boolean } = {},
): Promise<ConfigFiles.Type> => self[PackageAllBase.generateConfigFilesSymbol](exportsFilesOnly);
