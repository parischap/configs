/**
 * Module that describes the type and optional default value of a parameter of a project
 * configuration file
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import {
  Data,
  objectFromDataAndProto,
  Proto,
  StringArray,
  StringRecord,
} from '../../shared-utils/types.js';

/**
 * Module tag
 *
 * @category Module markers
 */

const _moduleTag = '@parischap/configs/internal/bin-utils/JsonConfigFile/Parameter/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/** All allowed parameter types */
export type AllTypeNames = 'string' | 'stringOrUndefined' | 'boolean' | 'record' | 'array';

/** Utility type that converts a typeName to a type */
// Do not use tuples in the extends clause as T can be a union of type names
type _TypeFromTypeName<T extends AllTypeNames> =
  T extends 'string' ? string
  : T extends 'stringOrUndefined' ? string | undefined
  : T extends 'boolean' ? boolean
  : T extends 'record' ? StringRecord
  : T extends 'array' ? StringArray
  : never;

/**
 * Type of a JsonConfigFileParameter
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

export interface Any extends Type<AllTypeNames> {}
/**
 * Utility type that extracts the expectedType type of a Parameter
 *
 * @category Utility types
 */
export type ExpectedType<T> =
  [T] extends [Type<infer ExpectedType>] ? _TypeFromTypeName<ExpectedType> : never;

/** Prototype */
const _proto: Proto<Any> = {
  [_TypeId]: _TypeId,
};

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const E extends AllTypeNames>(data: Data<Type<E>>): Type<E> =>
  objectFromDataAndProto(_proto, data);
