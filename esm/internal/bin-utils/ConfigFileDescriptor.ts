/**
 * Module that represents the allowed parameters of a configuratyion file with their type and
 * optional default value
 */
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
const _moduleTag = '@parischap/configs/ConfigFileDescriptor/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/** All allowed parameter types */
type AllTypeNames = 'string' | 'boolean' | 'record' | 'array';

/** Namespace of a ParamDescriptor */
namespace ParamDescriptor {
  const _namespaceTag = _moduleTag + 'ParameterDescriptor/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  type _TypeFromTypeName<T extends AllTypeNames> =
    T extends 'string' ? string
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
    readonly optionalValue?: _TypeFromTypeName<E>;

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
    readonly optionalValue?: _TypeFromTypeName<E>;
  }): Type<E> => Object.assign(Object.create(_proto), data);
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
}): Type<ParamDescriptors> => Object.assign(Object.create(_proto), data);

/**
 * Returns a decoder that takes as input a configurationFileObject (object representing the JSON
 * value of a configuration file) and a tag. This decoder checks that no unexpected parameters are
 * present, returns the default value for missing optional parameters and checks the type of the
 * value of the other parameters
 *
 * @category Destructors
 */
export const toDecoder =
  <ParamDescriptors extends ReadonlyRecord<string, ParamDescriptor.Type<AllTypeNames>>>(
    self: Type<ParamDescriptors>,
  ): (({
    configurationFileObject,
    tag,
  }: {
    readonly configurationFileObject: Record;
    readonly tag: string;
  }) => {
    [k in keyof ParamDescriptors]: ParamDescriptor.ExpectedType<ParamDescriptors[k]>;
  }) =>
  ({ configurationFileObject, tag }) =>
    Object.fromEntries(
      Object.entries(configurationFileObject).map(([key, value]) => {
        const descriptor = self.paramDescriptors[key];
        if (descriptor === undefined)
          throw new Error(`${tag}unexpected parameter '${key}' in '${configFilename}'`);

        const { optionalValue, expectedType } = descriptor;

        if (optionalValue !== undefined && value === undefined) return [key, optionalValue];
        if (
          (expectedType === 'string' && typeof value !== 'string')
          || (expectedType === 'boolean' && typeof value !== 'boolean')
          || (expectedType === 'record' && !isStringRecord(value))
          || (expectedType === 'array' && !isStringArray(value))
        )
          throw new Error(
            `${tag}parameter '${key}' of '${configFilename}' should be of type '${expectedType}'. Actual: ${typeof value}`,
          );
        return [key, value];
      }),
    ) as never;

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
    dependencies: ParamDescriptor.make({ expectedType: 'record', optionalValue: {} }),
    devDependencies: ParamDescriptor.make({ expectedType: 'record', optionalValue: {} }),
    peerDependencies: ParamDescriptor.make({ expectedType: 'record', optionalValue: {} }),
    examples: ParamDescriptor.make({ expectedType: 'array', optionalValue: [] }),
    scripts: ParamDescriptor.make({ expectedType: 'record', optionalValue: {} }),
    environment: ParamDescriptor.make({ expectedType: 'string' }),
    buildMethod: ParamDescriptor.make({ expectedType: 'string' }),
    isPublished: ParamDescriptor.make({ expectedType: 'boolean' }),
    hasDocGen: ParamDescriptor.make({ expectedType: 'boolean' }),
    keywords: ParamDescriptor.make({ expectedType: 'array', optionalValue: [] }),
    useEffectAsPeerDependency: ParamDescriptor.make({ expectedType: 'boolean' }),
    useEffectPlatform: ParamDescriptor.make({ expectedType: 'string', optionalValue: 'No' }),
    packagePrefix: ParamDescriptor.make({ expectedType: 'string' }),
  },
});
