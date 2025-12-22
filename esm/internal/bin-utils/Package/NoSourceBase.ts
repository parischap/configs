/**
 * Module that serves as a base for all no source Package types (see README.md and Package.ts). This
 * module does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as JsonConfigFileDecoder from '../JsonConfigFile/Decoder.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageBase from './Base.js';

/**
 * Type of a PackageNoSourceBase
 *
 * @category Models
 */
export interface Type extends PackageAllBase.Type {}

/** Prototype */
const parentProto = PackageAllBase.proto;
export const proto: Omit<Proto<Type>, PackageBase.isTopPackageSymbol> = parentProto;

/**
 * Untyped constructor (abstract class equivalent)
 *
 * @category Constructors
 */
export const fromPackageBase = async ({
  packageBase,
}: {
  readonly packageBase: PackageBase.Type;
}): Promise<Data<Type>> => ({
  ...packageBase,
  ...JsonConfigFileDecoder.noSourcePackage({
    configurationFileObject: await PackageBase.readProjectConfigFile(packageBase),
    packageName: packageBase.name,
  }),
});

/**
 * Generates the configuration files of `self`. If `exportsFilesOnly` is true, only the
 * configuration files that handle module exports (i.e. `index.ts` and `package.json`) are
 * generated
 */
export const generateConfigFiles = async (self: Type): Promise<ConfigFiles.Type> =>
  ConfigFiles.merge(await PackageAllBase.generateConfigFiles(self), ConfigFiles.noSourcePackage);
