/**
 * Module that represents the allowed parameters of a configuratyion file with their type and
 * optional default value
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import { configFilename } from '../shared-utils/constants.js';
import {
  isStringArray,
  isStringRecord,
  ReadonlyRecord,
  Record,
  StringArray,
  StringRecord,
} from '../shared-utils/types.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/internal/bin-utils/ConfigFileDescriptor/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/** All allowed parameter types */
type AllTypeNames = 'string' | 'stringOrUndefined' | 'boolean' | 'record' | 'array';

/** Namespace of a ParamDescriptor */
namespace ParamDescriptor {
  const _namespaceTag = _moduleTag + 'ParameterDescriptor/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  type _TypeFromTypeName<T extends AllTypeNames> =
    T extends 'string' ? string
    : T extends 'stringOrUndefined' ? string | undefined
    : T extends 'boolean' ? boolean
    : T extends 'record' ? StringRecord
    : T extends 'array' ? StringArray
    : never;

  /**
   * ParamDescriptor type
   *
   * @category Models
   */
  export interface Type<E extends AllTypeNames> {
    /** Expected type of the parameter */
    readonly expectedType: E;
    /** Default value of the parameter if any */
    readonly defaultValue?: _TypeFromTypeName<E>;

    /** @internal */
    readonly [_TypeId]: _TypeId;
  }

  /**
   * Utility type that extracts the expectedType type of a Parameter
   *
   * @category Utility types
   */
  export type ExpectedType<T> =
    [T] extends [Type<infer ExpectedType>] ? _TypeFromTypeName<ExpectedType> : never;

  /** Prototype */
  const _proto = {
    [_TypeId]: _TypeId,
  };

  /**
   * Constructor
   *
   * @category Constructors
   */
  export const make = <const E extends AllTypeNames>(data: {
    readonly expectedType: E;
    readonly defaultValue?: _TypeFromTypeName<E>;
  }): Type<E> => Object.assign(Object.create(_proto), data) as never;
}

/** Type of a ConfigFileDescriptor */
export interface Type<
  ParamDescriptors extends ReadonlyRecord<string, ParamDescriptor.Type<AllTypeNames>>,
> {
  /**
   * Object whose keys are the allowed parameter names and whose values are the corresponding
   * ParamDescriptor's
   */
  readonly paramDescriptors: ParamDescriptors;
  /** @internal */
  readonly [_TypeId]: _TypeId;
}

/** Prototype */
const _proto = {
  [_TypeId]: _TypeId,
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <
  const ParamDescriptors extends ReadonlyRecord<string, ParamDescriptor.Type<AllTypeNames>>,
>(data: {
  readonly paramDescriptors: ParamDescriptors;
}): Type<ParamDescriptors> => Object.assign(Object.create(_proto), data) as never;

/**
 * Returns a decoder that takes as input a configurationFileObject (object representing the JSON
 * value of a configuration file), checks that no unexpected parameters are present, that all
 * required parameters are present, that the type of the value of the other parameters is correct
 * and feeds the default value of missing optional parameters
 *
 * @category Destructors
 */
export const toDecoder =
  <ParamDescriptors extends ReadonlyRecord<string, ParamDescriptor.Type<AllTypeNames>>>(
    self: Type<ParamDescriptors>,
  ): ((configurationFileObject: Record) => {
    [k in keyof ParamDescriptors]: ParamDescriptor.ExpectedType<ParamDescriptors[k]>;
  } & { warnings: Array<string> }) =>
  (configurationFileObject) => {
    const paramDescriptors = self.paramDescriptors;
    const extraKeys = Object.keys(configurationFileObject).filter(
      (key) => !(key in paramDescriptors),
    );

    return {
      ...Object.fromEntries(
        Object.entries(paramDescriptors).map(([key, descriptor]) => {
          const value = configurationFileObject[key];

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
      ),
      warnings: extraKeys.map(
        (extraKey) =>
          `parameters '${extraKey}' was unexpectedly found in '${configFilename}' (WARNING)`,
      ),
    } as never;
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
