/**
 * Module that defines the format of a list of parameters, i.e. for each parameter the allowed name
 * and value type and an optional default value. The parameters must be provided as an array of
 * name/value pairs.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import { type Data, type ReadonlyRecord } from '../../../utils.js';
import * as SchemaParameterDescriptor from './ParameterDescriptor.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Schema/Format/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

namespace ParameterDescriptors {
  export interface Type extends ReadonlyRecord<string, SchemaParameterDescriptor.Any> {}
}

/**
 * Type of a SchemaFormat
 *
 * @category Models
 */
export class Type<P extends ParameterDescriptors.Type> {
  /**
   * Object whose keys are the allowed property names and whose values describe the types and
   * optional default values of these properties
   */
  readonly descriptors: P;

  /** Class constructor */
  constructor(params: Data<Type<P>>) {
    this.descriptors = params.descriptors;
  }

  /** Static constructor */
  static make<P extends ParameterDescriptors.Type>(params: Data<Type<P>>): Type<P> {
    return new Type<P>(params);
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const P extends ParameterDescriptors.Type>(params: Data<Type<P>>): Type<P> =>
  Type.make(params);

/**
 * Returns the descriptors property of `self`
 *
 * @category Destructors
 */
export const descriptors = <const P extends ParameterDescriptors.Type>(self: Type<P>): P =>
  self.descriptors;

/**
 * SchemaFormat instance for a no source package
 *
 * @category Instances
 */
export const noSourcePackage = make({
  descriptors: {
    description: SchemaParameterDescriptor.make({ expectedType: 'string' }),
  },
});

/**
 * SchemaFormat instance for a source package
 *
 * @category Instances
 */
export const sourcePackage = make({
  descriptors: {
    description: SchemaParameterDescriptor.make({ expectedType: 'string' }),
    dependencies: SchemaParameterDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    devDependencies: SchemaParameterDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    peerDependencies: SchemaParameterDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    examples: SchemaParameterDescriptor.make({ expectedType: 'array', defaultValue: [] }),
    scripts: SchemaParameterDescriptor.make({ expectedType: 'record', defaultValue: {} }),
    environment: SchemaParameterDescriptor.make({ expectedType: 'string' }),
    buildMethod: SchemaParameterDescriptor.make({ expectedType: 'string' }),
    isPublished: SchemaParameterDescriptor.make({ expectedType: 'boolean' }),
    hasDocGen: SchemaParameterDescriptor.make({ expectedType: 'boolean' }),
    keywords: SchemaParameterDescriptor.make({ expectedType: 'array', defaultValue: [] }),
    useEffectAsPeerDependency: SchemaParameterDescriptor.make({ expectedType: 'boolean' }),
    useEffectPlatform: SchemaParameterDescriptor.make({
      expectedType: 'string',
      defaultValue: 'No',
    }),
    packagePrefix: SchemaParameterDescriptor.make({
      expectedType: 'stringOrUndefined',
      defaultValue: undefined,
    }),
  },
});

/**
 * SchemaFormat instance for the arguments of a binary that accepts a filtering flag
 *
 * @category Instances
 */
export const filteringArgs = make({
  descriptors: {
    '-activePackageOnly': SchemaParameterDescriptor.make({
      expectedType: 'boolean',
      defaultValue: false,
    }),
  },
});

/**
 * SchemaFormat instance for the `update-exports` command
 *
 * @category Instances
 */
export const updateExportsArgs = make({
  descriptors: {
    '-activePackageOnly': SchemaParameterDescriptor.make({
      expectedType: 'boolean',
      defaultValue: false,
    }),
    '-watch': SchemaParameterDescriptor.make({
      expectedType: 'boolean',
      defaultValue: false,
    }),
  },
});

/**
 * Function that takes a list of parameters provided as name/value pairs
 *
 * @category Combinators
 */
export const injectDefaultsAndValidate = <P extends ParameterDescriptors.Type>(
  self: Type<P>,
  {
    errorPrefix = '',
    allowStringConversion = false,
  }: { readonly errorPrefix?: string; readonly allowStringConversion?: boolean } = {},
): ((parameters: ReadonlyArray<[string, unknown]>) => {
  [k in keyof P]: SchemaParameterDescriptor.ExpectedType<P[k]>;
}) => {
  const descriptors = Object.entries(self.descriptors);
  return (parameters) => {
    // Copy the parameterDescriptors
    const parameterDescriptorsCpy = Object.fromEntries(
      descriptors.map(([key, value]) => [
        key,
        { ...value } as SchemaParameterDescriptor.Any & { value?: unknown },
      ]),
    );

    for (const [key, value] of parameters) {
      const descriptor = parameterDescriptorsCpy[key];
      if (descriptor === undefined) throw new Error(`${errorPrefix}Unexpected parameter '${key}'`);

      if ('value' in descriptor) throw new Error(`${errorPrefix}Parameter '${key}' received twice`);

      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data */
      descriptor.value = SchemaParameterDescriptor.validate({
        value,
        allowStringConversion,
        errorPrefix,
      })(descriptor);
    }
    return Object.fromEntries(
      Object.entries(parameterDescriptorsCpy).map(([key, extendedDescriptor]) => {
        if ('value' in extendedDescriptor) return [key, extendedDescriptor['value']] as const;
        if ('defaultValue' in extendedDescriptor)
          return [key, extendedDescriptor['defaultValue']] as const;
        throw new Error(`${errorPrefix}Mandatory parameter '${key}' was not provided`);
      }),
    ) as never;
  };
};
