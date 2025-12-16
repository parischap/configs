/**
 * Module that describes the types and optional default values of the parameters of a configuration
 * file
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import { configFilename } from '../shared-utils/constants.js';
import {
  Data,
  isStringArray,
  isStringRecord,
  objectFromDataAndProto,
  Proto,
} from '../shared-utils/types.js';
import type * as ConfigFileDescriptorDecoder from './ConfigFileDescriptorDecoder.js';
import * as ParamDescriptor from './ParamDescriptor.js';
import * as ParamDescriptors from './ParamDescriptors.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/ConfigFileDescriptor/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a ConfigFileDescriptor
 *
 * @category Models
 */
export interface Type<P extends ParamDescriptors.Type> {
  /**
   * Object whose keys are the allowed parameter names and whose values are the corresponding
   * ParamDescriptor's
   */
  readonly paramDescriptors: P;
  /** @internal */
  readonly [_TypeId]: _TypeId;
}

type Any = Type<ParamDescriptors.Type>;

/** Prototype */
const _proto: Proto<Any> = {
  [_TypeId]: _TypeId,
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const P extends ParamDescriptors.Type>(data: Data<Type<P>>): Type<P> =>
  objectFromDataAndProto(_proto, data);

/**
 * Returns a decoder that takes as input a configurationFileObject (object representing the JSON
 * value of a configuration file), checks that no unexpected parameters are present, that all
 * required parameters are present, that the type of the value of the other parameters is correct
 * and feeds the default value of missing optional parameters
 *
 * @category Destructors
 */
export const toDecoder =
  <P extends ParamDescriptors.Type>(self: Type<P>): ConfigFileDescriptorDecoder.Type<P> =>
  ({ configurationFileObject, packageName }) => {
    const paramDescriptors = self.paramDescriptors;
    const extraKeys = Object.keys(configurationFileObject).filter(
      (key) => !(key in paramDescriptors),
    );
    for (const extraKey of extraKeys)
      console.log(
        `Package '${packageName}': parameter '${extraKey}' was unexpectedly found in '${configFilename}' (WARNING)`,
      );
    return Object.fromEntries(
      Object.entries(paramDescriptors).map(([key, descriptor]) => {
        const value: unknown = configurationFileObject[key];

        const { defaultValue, expectedType } = descriptor;
        if (defaultValue !== undefined && value === undefined) return [key, defaultValue];
        const valueType = typeof value;
        if (
          (expectedType === 'string' && valueType !== 'string')
          || (expectedType === 'stringOrUndefined'
            && valueType !== 'string'
            && valueType !== 'undefined')
          || (expectedType === 'boolean' && valueType !== 'boolean')
          || (expectedType === 'record' && !isStringRecord(value))
          || (expectedType === 'array' && !isStringArray(value))
        )
          throw new Error(
            `Parameter '${key}' of '${configFilename}' should be of type '${expectedType}'. Actual: ${typeof value}`,
          );
        return [key, value];
      }),
    ) as never;
  };

/** ConfigFileDescriptor instance for a no source package */
export const noSourcePackage = make({
  paramDescriptors: {
    description: ParamDescriptor.make({ expectedType: 'string' }),
  },
});

/** ConfigFileDescriptor instance for a source package */
export const sourcePackage = make({
  paramDescriptors: {
    description: ParamDescriptor.make({ expectedType: 'string' }),
    dependencies: ParamDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    devDependencies: ParamDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    peerDependencies: ParamDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    examples: ParamDescriptor.make({ expectedType: 'array', defaultValue: [] }),
    scripts: ParamDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    environment: ParamDescriptor.make({ expectedType: 'string' }),
    buildMethod: ParamDescriptor.make({ expectedType: 'string' }),
    isPublished: ParamDescriptor.make({ expectedType: 'boolean' }),
    hasDocGen: ParamDescriptor.make({ expectedType: 'boolean' }),
    keywords: ParamDescriptor.make({ expectedType: 'array', defaultValue: [] }),
    useEffectAsPeerDependency: ParamDescriptor.make({ expectedType: 'boolean' }),
    useEffectPlatform: ParamDescriptor.make({ expectedType: 'string', defaultValue: 'No' }),
    packagePrefix: ParamDescriptor.make({
      expectedType: 'stringOrUndefined',
      defaultValue: undefined,
    }),
  },
});
