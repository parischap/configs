/**
 * Module that implements a Package (see README.md and Package.ts) that reads the project
 * configuration file upon construction. A PackageAll can be used to generate the configuration
 * files of a package, check if no unwanted configuration files are present in a package, ...
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import type * as PackageMonoRepo from "./MonoRepo.js";
import type * as PackageOnePackageRepo from "./OnePackageRepo.js";
import type * as PackageSubRepo from "./SubRepo.js";
import type * as PackageTop from "./Top.js";

/**
 * Type of a Package
 *
 * @category Models
 */
export type Type =
  | PackageMonoRepo.Type
  | PackageOnePackageRepo.Type
  | PackageSubRepo.Type
  | PackageTop.Type;
