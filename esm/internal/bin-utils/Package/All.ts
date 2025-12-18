/** Module that represents a Package (see README.md). */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';
import type * as PackageMonoRepo from './MonoRepo.js';
import type * as PackageOnePackageRepo from './OnePackageRepo.js';
import type * as PackageSubPackage from './SubPackage.js';
import type * as PackageTop from './Top.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/All/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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
export const toConfigFiles = (
  self: Type,
  { exportsFilesOnly = false }: { readonly exportsFilesOnly?: boolean } = {},
): Promise<ConfigFiles.Type> => self[PackageBase.toPackageFilesSymbol](exportsFilesOnly);
