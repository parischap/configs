/**
 * Module that serves as a base for all no source Package types (see README.md and Package.ts). This
 * module does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data } from '../../../types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as SchemaFormat from '../Schema/Format.js';
import * as PackageAllBase from './AllBase.js';
import * as PackageBase from './Base.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/NoSourceBase/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a PackageNoSourceBase
 *
 * @category Models
 */
export abstract class Type extends PackageAllBase.Type {
  /** Class constructor */
  protected constructor(params: Data<Type>) {
    super(params);
  }

  /** Generates the configuration files of `self` */
  override async _generateConfigFiles(this: Type): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(await super._generateConfigFiles(), ConfigFiles.noSourcePackage);
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Untyped constructor
 *
 * @category Constructors
 */
export const fromPackageBase = async ({
  packageBase,
}: {
  readonly packageBase: PackageBase.Type;
}): Promise<Data<Type>> => {
  const configRecord = await PackageBase.readProjectConfigFile(packageBase);
  const parameters = Object.entries(configRecord);
  return {
    ...(packageBase as Data<PackageBase.Type>),
    ...SchemaFormat.injectDefaultsAndValidate(SchemaFormat.noSourcePackage, {
      errorPrefix: `'${packageBase.name}': `,
    })(parameters),
  };
};
