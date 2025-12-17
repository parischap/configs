/**
 * Module that describes the types and optional default values of the parameters of a project
 * configuration file
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import { Data, objectFromDataAndProto, Proto } from '../../shared-utils/types.js';
import * as JsonConfigFileParameter from './Parameter.js';
import * as JsonConfigFileParameters from './Parameters.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/JsonConfigFile/Format/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a JsonConfigFileFormat
 *
 * @category Models
 */
export interface Type<P extends JsonConfigFileParameters.Type> {
  /**
   * Object whose keys are the allowed parameter names and whose values are the corresponding
   * Parameter's
   */
  readonly paramDescriptors: P;
  /** @internal */
  readonly [_TypeId]: _TypeId;
}

interface Any extends Type<JsonConfigFileParameters.Type> {}

/** Prototype */
const _proto: Proto<Any> = {
  [_TypeId]: _TypeId,
};

/**
 * Constructor from a list of parameters
 *
 * @category Constructors
 */
export const make = <const P extends JsonConfigFileParameters.Type>(data: Data<Type<P>>): Type<P> =>
  objectFromDataAndProto(_proto, data);

/**
 * Returns the paramDescriptors property of `self`
 *
 * @category Destructors
 */
export const paramDescriptors = <const P extends JsonConfigFileParameters.Type>(self: Type<P>): P =>
  self.paramDescriptors;

/**
 * JsonConfigFileFormat instance for a no source package
 *
 * @category Instances
 */
export const noSourcePackage = make({
  paramDescriptors: {
    description: JsonConfigFileParameter.make({ expectedType: 'string' }),
  },
});

/**
 * JsonConfigFileFormat instance for a source package
 *
 * @category Instances
 */
export const sourcePackage = make({
  paramDescriptors: {
    description: JsonConfigFileParameter.make({ expectedType: 'string' }),
    dependencies: JsonConfigFileParameter.make({ expectedType: 'record', defaultValue: {} }),
    devDependencies: JsonConfigFileParameter.make({ expectedType: 'record', defaultValue: {} }),
    peerDependencies: JsonConfigFileParameter.make({ expectedType: 'record', defaultValue: {} }),
    examples: JsonConfigFileParameter.make({ expectedType: 'array', defaultValue: [] }),
    scripts: JsonConfigFileParameter.make({ expectedType: 'record', defaultValue: {} }),
    environment: JsonConfigFileParameter.make({ expectedType: 'string' }),
    buildMethod: JsonConfigFileParameter.make({ expectedType: 'string' }),
    isPublished: JsonConfigFileParameter.make({ expectedType: 'boolean' }),
    hasDocGen: JsonConfigFileParameter.make({ expectedType: 'boolean' }),
    keywords: JsonConfigFileParameter.make({ expectedType: 'array', defaultValue: [] }),
    useEffectAsPeerDependency: JsonConfigFileParameter.make({ expectedType: 'boolean' }),
    useEffectPlatform: JsonConfigFileParameter.make({
      expectedType: 'string',
      defaultValue: 'No',
    }),
    packagePrefix: JsonConfigFileParameter.make({
      expectedType: 'stringOrUndefined',
      defaultValue: undefined,
    }),
  },
});
