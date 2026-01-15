/**
 * Module that serves as a base for all no source Package types (see README.md and Package.ts). This
 * module does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import type { Data } from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as SchemaFormat from '../Schema/Format.js';
import * as SchemaParameterDescriptor from '../Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../Schema/ParameterType.js';
import * as PackageBase from './Base.js';
import * as PackageLoadedBase from './LoadedBase.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/LoadedNoSource/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * SchemaFormat instance for a PackageLoadedNoSource
 *
 * @category Instances
 */
const noSourcePackageFormat = SchemaFormat.make({
  descriptors: {
    description: SchemaParameterDescriptor.make({ expectedType: SchemaParameterType.string }),
  },
});

type LoadedParameters = SchemaFormat.RealType<typeof noSourcePackageFormat>;

/**
 * Type of a PackageLoadedNoSource
 *
 * @category Models
 */
export abstract class Type extends PackageLoadedBase.Type implements LoadedParameters {
  /** Class constructor */
  protected constructor(params: Data<Type>) {
    super(params);
  }

  /** Generates the configuration files of `self` */
  override async _generateConfigFiles(
    this: Type,
    mode: ConfigFiles.Mode,
  ): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await super._generateConfigFiles(mode),
      ConfigFiles.noSourcePackage({ mode, packageLoadedNoSource: this }),
    );
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
    ...SchemaFormat.injectDefaultsAndValidate(noSourcePackageFormat, {
      errorPrefix: `'${packageBase.name}': `,
    })(parameters),
  };
};
