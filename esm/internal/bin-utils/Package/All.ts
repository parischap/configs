/** Module that represents a Package (see README.md). */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { rm } from 'fs/promises';
import { join } from 'path';
import {
  foldersWithoutConfigFiles,
  packagesFolderName,
  prodFolderName,
  tsBuildInfoFolderName,
} from '../../shared-utils/constants.js';
import { readFiles, readFilesRecursively } from '../../shared-utils/utils.js';
import * as PackageFiles from '../ConfigFiles.js';
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
 * Returns the `name` property of `self`
 *
 * @category Destructors
 */
export const name = (self: Type): string => self.name;

/**
 * Returns the `path` property of `self`
 *
 * @category Destructors
 */
export const path = (self: Type): string => self.path;

/**
 * Predicate that returns true if `self` is the active Package, i.e. the package at the root of
 * which the binary was called
 *
 * @category Predicates
 */
export const isActive = (self: Type): boolean => self.path === '';

/**
 * Predicate that returns true if `self` is a source Package
 *
 * @category Predicates
 */
export const isSourcePackage = (self: Type): boolean => self[PackageBase.isSourcePackageSymbol]();

/**
 * Returns an array of all configuration files present in `self`
 *
 * @category Destructors
 */
export const allConfigurationFiles = async (self: Type): Promise<Array<string>> => {
  const { path } = self;

  return [
    ...(
      await readFilesRecursively({
        path,
        foldersToExclude: foldersWithoutConfigFiles,
        dontFailOnInexistentPath: false,
      })
    )
      .map(({ relativePath }) => relativePath)
      .filter(
        (relativePath) => !self[PackageBase.externalConfigurationFilesSymbol].test(relativePath),
      ),
    ...(
      await readFiles({
        path: join(path, packagesFolderName),
        dontFailOnInexistentPath: true,
      })
    ).map((name) => `${packagesFolderName}/${name}`),
  ];
};

/** Cleans prod directories of `self` */
export const cleanProd = async (self: Type): Promise<void> => {
  const { path } = self;
  /* eslint-disable-next-line functional/no-expression-statements*/
  await rm(join(path, prodFolderName), { force: true, recursive: true });
  /* eslint-disable-next-line functional/no-expression-statements*/
  await rm(join(path, tsBuildInfoFolderName), { force: true, recursive: true });
};

/**
 * Generates the PackageFiles for `self`
 *
 * @categrory Destructors
 */
export const toPackageFiles = (
  self: Type,
  { exportsFilesOnly = false }: { readonly exportsFilesOnly?: boolean } = {},
): Promise<PackageFiles.Type> => self[PackageBase.toPackageFilesSymbol](exportsFilesOnly);
