/** This module defines a few useful types */
// This module must not import any external dependency. It must be runnable without a package.json

/**
 * Redefines the Record type: keys are restricted to strings or symbols. In TypeScript, functions
 * and non-null objects, including arrays, are assignable to this Record definition.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type Record<K extends string | symbol = string, V = any> = {
  [k in K]: V;
};

/** Readonly version of the Record type */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ReadonlyRecord<K extends string | symbol = string, V = any> = {
  readonly [k in K]: V;
};

/** Alias to Record with string keys and values */
export interface StringRecord extends Record<string, string> {}

/** Alias to Array with string values */
export interface StringArray extends Array<string> {}

export const isArray: (v: unknown) => v is Array<unknown> = Array.isArray;

export const isRecord = (v: unknown): v is Record<string | symbol> =>
  typeof v === 'function' || (typeof v === 'object' && v !== null);

export const isStringRecord = (v: unknown): v is StringRecord =>
  isRecord(v)
  && Object.entries(v).filter(
    ([key, value]) => typeof key !== 'string' || typeof value !== 'string',
  ).length === 0;

export const isStringArray = (v: unknown): v is StringArray =>
  isArray(v) && v.filter((value) => typeof value !== 'string').length === 0;

export interface AnyFunction {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (...args: ReadonlyArray<any>): any;
}

/**
 * Utility type that removes all non-data from a type. Is considered as non-data any property that
 * starts with an underscore or whose name is a symbol. Don't make this function too complex, e.g.
 * use the fact that the value is a function, because it creates issues when infering types in the
 * constructors of generic types
 *
 * @category Utility types
 */
export type Data<T extends ReadonlyRecord<string | symbol>> = {
  [k in keyof T as [k] extends [symbol | `_${string}`] ? never : k]: T[k];
};
