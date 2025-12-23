/** Module that describes the type and optional default value of a parameter */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import {
  Data,
  isStringArray,
  isStringRecord,
  StringArray,
  StringRecord,
} from '../../shared-utils/types.js';

/** All allowed parameter types */
export type AllTypeNames =
  | 'string'
  | 'stringOrUndefined'
  | 'boolean'
  | 'number'
  | 'record'
  | 'array';

/** Utility type that converts a typeName to a type */
// Do not use tuples in the extends clause as T can be a union of type names
type _TypeFromTypeName<T extends AllTypeNames> =
  T extends 'string' ? string
  : T extends 'stringOrUndefined' ? string | undefined
  : T extends 'boolean' ? boolean
  : T extends 'number' ? number
  : T extends 'record' ? StringRecord
  : T extends 'array' ? StringArray
  : never;

/**
 * Type of a SchemaParameterDescriptor
 *
 * @category Models
 */

export class Type<E extends AllTypeNames> {
  /** Expected type of the parameter */
  readonly expectedType: E;
  /** Default value of the parameter if any */
  readonly defaultValue?: _TypeFromTypeName<E>;

  /** Class constructor */
  private constructor(params: Data<Type<E>>) {
    this.expectedType = params.expectedType;
    if ('defaultValue' in params) {
      this.defaultValue = params.defaultValue;
    }
  }

  /** Static constructor */
  static make<E extends AllTypeNames>(params: Data<Type<E>>): Type<E> {
    return new Type<E>(params);
  }
}

export interface Any extends Type<AllTypeNames> {}
/**
 * Utility type that extracts the expectedType type of a SchemaParameterDescriptor
 *
 * @category Utility types
 */
export type ExpectedType<T> =
  [T] extends [Type<infer ExpectedType>] ? _TypeFromTypeName<ExpectedType> : never;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const E extends AllTypeNames>(params: Data<Type<E>>): Type<E> =>
  Type.make(params);

/**
 * Validates that `value` is of the expected type of `self` and returns it converted to that type
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
  <E extends AllTypeNames>(self: Type<E>): ExpectedType<Type<E>> => {
    const expectedType = self.expectedType;
    const convertedValue =
      allowStringConversion && typeof value === 'string' && expectedType === 'number' ?
        Number(value)
      : value;
    const valueType = typeof convertedValue;
    if (
      (expectedType === 'string' && valueType !== 'string')
      || (expectedType === 'stringOrUndefined'
        && valueType !== 'string'
        && valueType !== 'undefined')
      || (expectedType === 'boolean' && valueType !== 'boolean')
      || (expectedType === 'number' && valueType !== 'number')
      || (expectedType === 'record' && !isStringRecord(value))
      || (expectedType === 'array' && !isStringArray(value))
    )
      throw new Error(
        `${errorPrefix}Parameter should be of type '${expectedType}'. Actual: ${valueType}`,
      );
    return convertedValue as never;
  };
