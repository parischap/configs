/**
 * Module that represents a MonoRepo which is a sub-type of a Package (see README.md and
 * Package.ts).
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as JsonConfigFileDecoder from '../JsonConfigFile/Decoder.js';
import * as PackageBase from './Base.js';
import * as PackageNoSourceBase from './NoSourceBase.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/Package/MonoRepo/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a MonoRepo
 *
 * @category Models
 */
export interface Type extends PackageNoSourceBase.Type {
  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

/** _prototype */
const _proto: Proto<Type> = {
  [_TypeId]: _TypeId,
  [PackageBase.externalConfigurationFilesSymbol]: PackageBase.externalConfigurationFilesDefault,
  [PackageBase.toPackageFilesSymbol](
    this: Type,
    exportsFilesOnly: boolean,
  ): Promise<ConfigFiles.Type> {
    return Promise.resolve(
      exportsFilesOnly ?
        ConfigFiles.empty
      : ConfigFiles.merge(
          ConfigFiles.anyPackage(this),
          ConfigFiles.repo(this),
          ConfigFiles.noSourcePackage,
          // Disabled for the moment, I am not sure I need it
          /*{
            // Used by all scripts to define scope of -r flag.
            [pnpmWorkspaceFilename]: PNPM_WORKSPACE_CONFIG,
          },*/
        ),
    );
  },
};

const _make = (data: Data<Type>): Type => objectFromDataAndProto(_proto, data);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = async (
  data: Omit<Data<Type>, Exclude<keyof PackageNoSourceBase.Type, keyof PackageBase.Type>>,
): Promise<Type> =>
  _make({
    ...data,
    ...JsonConfigFileDecoder.noSourcePackage({
      configurationFileObject: await PackageBase.readConfigFile(data),
      packageName: data.name,
    }),
  });
