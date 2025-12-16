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

/**
 * Utility type that removes all non-data from a type.
 *
 * @category Utility types
 */
export type Data<T extends ReadonlyRecord<string | symbol>> = {
  [k in keyof T as [k] extends [symbol] ? never : k]: T[k];
};

/**
 * Utility type that removes all data from a type
 *
 * @category Utility types
 */
export type Proto<T extends ReadonlyRecord<string | symbol>> = Omit<T, keyof Data<T>>;

/**
 * Constructs an object with prototype `proto` and data `data`
 *
 * @category Utils
 */
export const objectFromDataAndProto = <
  P extends ReadonlyRecord<string | symbol>,
  D extends ReadonlyRecord<string | symbol>,
>(
  proto: P,
  data: D,
): P & D => Object.assign(Object.create(proto) as P, data);
