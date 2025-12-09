// This module must not import any external dependency. It must be runnable without a package.json

export type Record<K extends string | symbol = string, V = unknown> = {
  [k in K]: V;
};

export type ReadonlyRecord<K extends string | symbol = string, V = unknown> = {
  readonly [k in K]: V;
};

export interface StringRecord extends Record<string, string> {}

export interface StringArray extends Array<string> {}

export const isArray: (v: unknown) => v is Array<unknown> = Array.isArray;

export const isRecord = (v: unknown): v is Record =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const isStringRecord = (v: unknown): v is StringRecord =>
  isRecord(v) && Object.entries(v).filter(([, value]) => typeof value !== 'string').length === 0;

export const isStringArray = (v: unknown): v is StringArray =>
  isArray(v) && v.filter((value) => typeof value !== 'string').length === 0;
