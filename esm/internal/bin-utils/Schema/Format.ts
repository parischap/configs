/**
 * Module that defines the format of a list of parameters, i.e. for each parameter the allowed name
 * and value type and an optional default value. The parameters must be provided as an array of
 * name/value pairs.
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import type { Data, ReadonlyRecord } from '../../shared-utils/utils.js';
import * as SchemaParameterDescriptor from './ParameterDescriptor.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Schema/Format/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a SchemaFormat
 *
 * @category Models
 */
export class Type<P extends ReadonlyRecord<string, unknown>> {
  /**
   * Object whose keys are the allowed property names and whose values describe the types and
   * optional default values of these properties
   */
  readonly descriptors: {
    readonly [k in keyof P]: SchemaParameterDescriptor.Type<P[k]>;
  };

  /** Class constructor */
  constructor(params: Data<Type<P>>) {
    this.descriptors = params.descriptors;
  }

  /** Static constructor */
  static make<const P extends ReadonlyRecord<string, unknown>>(params: Data<Type<P>>): Type<P> {
    return new Type(params);
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Utility type that extracts the expectedType type of a SchemaParameterDescriptor
 *
 * @category Utility types
 */
export type RealType<T> = [T] extends [Type<infer RealType>] ? RealType : never;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const P extends ReadonlyRecord<string, unknown>>(
  params: Data<Type<P>>,
): Type<P> => Type.make(params);

/**
 * Function that takes a list of parameters provided as name/value pairs and checks that they
 * fulfill te conditions of `self`. If an optional parameter is missing, its default value is
 * returned.
 *
 * @category Combinators
 */
export const injectDefaultsAndValidate = <P extends ReadonlyRecord<string, unknown>>(
  self: Type<P>,
  {
    errorPrefix = '',
    allowStringConversion = false,
  }: { readonly errorPrefix?: string; readonly allowStringConversion?: boolean } = {},
): ((parameters: ReadonlyArray<readonly [string, unknown]>) => P) => {
  const descriptors = Object.entries(self.descriptors);
  return (parameters) => {
    // Copy the parameterDescriptors
    const parameterDescriptorsCpy = Object.fromEntries(
      descriptors.map(([key, value]) => [
        key,
        { ...value } as SchemaParameterDescriptor.Type<unknown> & { value?: unknown },
      ]),
    );

    for (const [key, value] of parameters) {
      const descriptor = parameterDescriptorsCpy[key];
      if (descriptor === undefined) {
        throw new Error(`${errorPrefix}Unexpected parameter '${key}'`);
      }

      if ('value' in descriptor) {
        throw new Error(`${errorPrefix}Parameter '${key}' received twice`);
      }

      descriptor.value = SchemaParameterDescriptor.validate({
        allowStringConversion,
        errorPrefix,
        value,
      })(descriptor);
    }
    return Object.fromEntries(
      Object.entries(parameterDescriptorsCpy).map(([key, extendedDescriptor]) => {
        if ('value' in extendedDescriptor) {
          return [key, extendedDescriptor['value']] as const;
        }
        if ('defaultValue' in extendedDescriptor) {
          return [key, extendedDescriptor['defaultValue']] as const;
        }
        throw new Error(`${errorPrefix}Mandatory parameter '${key}' was not provided`);
      }),
    ) as never;
  };
};
