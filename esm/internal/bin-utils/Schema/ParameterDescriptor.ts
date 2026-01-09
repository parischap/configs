/** Module that describes the type and optional default value of a parameter */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import { type Data } from '../../shared-utils/utils.js';
import * as SchemaParameterType from './ParameterType.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Schema/ParameterDescriptor/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a SchemaParameterDescriptor
 *
 * @category Models
 */

export class Type<RealType> {
  /** Expected type of the parameter */
  readonly expectedType: SchemaParameterType.Type<RealType>;
  /** Default value of the parameter if any */
  readonly defaultValue?: RealType;

  /** Class constructor */
  private constructor(params: Data<Type<RealType>>) {
    this.expectedType = params.expectedType;
    if ('defaultValue' in params) {
      this.defaultValue = params.defaultValue;
    }
  }

  /** Static constructor */
  static make<RealType>(params: Data<Type<RealType>>): Type<RealType> {
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
export const make = <const RealType>(params: {
  readonly expectedType: SchemaParameterType.Type<RealType>;
  readonly defaultValue?: NoInfer<RealType>;
}): Type<RealType> => Type.make(params);

/**
 * Validates that `value` is of the expected type of `self` and returns it converted to that type.
 * If `allowStringConversion` is true and value is a string, the value is converted with JSON.parse
 * prior to checking its type
 *
 * @category Combinators
 */
export const validate =
  ({
    value,
    allowStringConversion = false,
    errorPrefix = '',
  }: {
    readonly value: unknown;
    readonly allowStringConversion?: boolean;
    readonly errorPrefix?: string;
  }) =>
  <RealType>(self: Type<RealType>): RealType => {
    const { expectedType } = self;
    if (expectedType.guard(value)) return value;

    if (!allowStringConversion || typeof value !== 'string')
      throw new Error(
        `${errorPrefix}Parameter should be of type '${expectedType.name}'. Actual: ${typeof value}`,
      );

    const convertedValue: unknown = JSON.parse(value);
    if (expectedType.guard(convertedValue)) return convertedValue;

    throw new Error(
      `${errorPrefix}Parameter should be of type '${expectedType.name}'. Actual: ${typeof convertedValue}`,
    );
  };
