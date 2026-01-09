/** Module that defines the type of a parameter */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */
import {
  type Data,
  isStringArray,
  isStringRecord,
  type ReadonlyStringRecord,
  type StringArray,
} from '../../shared-utils/utils.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Schema/SchemaParameterType/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type of a SchemaParameterType
 *
 * @category Models
 */

export class Type<RealType> {
  /** Type guard */
  readonly guard: (value: unknown) => value is RealType;

  /** Type name */
  readonly name: string;

  /** Class constructor */
  private constructor(params: Data<Type<RealType>>) {
    this.guard = params.guard;
    this.name = params.name;
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
 * Utility type that extracts the RealType of a SchemaParameterType
 *
 * @category Utility types
 */
export type RealType<T> = [T] extends [Type<infer RealType>] ? RealType : never;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = <const RealType>(params: Data<Type<RealType>>): Type<RealType> =>
  Type.make(params);

/**
 * Creates a new SchemaParameterType from the union of `a` and `b`
 *
 * @category Combinators
 */
export const union = <const Types extends ReadonlyArray<Type<unknown>>>(
  ...types: Types
): Type<{ readonly [k in keyof Types]: RealType<Types[k]> }[number]> =>
  make({
    guard: (value: unknown): value is { readonly [k in keyof Types]: RealType<Types[k]> }[number] =>
      types.map(({ guard }) => guard(value)).find((elem) => elem) !== undefined,
    name: types.map(({ name }) => name).join('Or'),
  });

/** Undefined SchemaParameterType instance */
const _undefined: Type<undefined> = make({
  guard: (value: unknown): value is undefined => value === undefined,
  name: 'Undefined',
});

/**
 * String SchemaParameterType instance
 *
 * @category Instances
 */
export const string: Type<string> = make({
  guard: (value: unknown): value is string => typeof value === 'string',
  name: 'String',
});

/**
 * StringOrUndefined SchemaParameterType instance
 *
 * @category Instances
 */
export const stringOrUndefined: Type<string | undefined> = union(string, _undefined);

/**
 * Boolean SchemaParameterType instance
 *
 * @category Instances
 */
export const boolean: Type<boolean> = make({
  guard: (value: unknown): value is boolean => typeof value === 'boolean',
  name: 'Boolean',
});

/**
 * Number SchemaParameterType instance
 *
 * @category Instances
 */
export const number: Type<number> = make({
  guard: (value: unknown): value is number => typeof value === 'number',
  name: 'Number',
});

/**
 * Literal SchemaParameterType instance
 *
 * @category Instances
 */
export const literal = <const T extends number | string>(target: T): Type<T> =>
  make({
    guard: (value: unknown): value is T => value === target,
    name: target.toString(),
  });

/**
 * ReadonlyStringRecord SchemaParameterType instance
 *
 * @category Instances
 */
export const readonlyStringRecord: Type<ReadonlyStringRecord> = make({
  guard: isStringRecord,
  name: 'ReadonlyStringRecord',
});

/**
 * StringArray SchemaParameterType instance
 *
 * @category Instances
 */
export const readonlyStringArray: Type<StringArray> = make({
  guard: isStringArray,
  name: 'StringArray',
});
