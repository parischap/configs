// This module must not import any external dependency. It must be runnable without a package.json
import { packageJsonFilename } from './constants.js';

export type Record<K extends string | symbol = string, V = unknown> = {
  [k in K]: V;
};

export type ReadonlyRecord<K extends string | symbol = string, V = unknown> = {
  readonly [k in K]: V;
};

export interface StringRecord extends Record<string, string> {}

export interface ReadonlyStringRecord extends ReadonlyRecord<string, string> {}

export interface ReadonlyStringArray extends ReadonlyArray<string> {}

export interface Config {
  readonly [key: string]: string | ReadonlyRecord;
  readonly [packageJsonFilename]: {
    readonly [key: string]: unknown;
    readonly name: string;
    readonly dependencies?: ReadonlyStringRecord;
    readonly devDependencies?: ReadonlyStringRecord;
    readonly peerDependencies?: ReadonlyStringRecord;
  };
}

export const isArray: (v: unknown) => v is Array<unknown> = Array.isArray;

export const isRecord = (v: unknown): v is Record =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export const isReadonlyStringRecord = (v: unknown): v is ReadonlyStringRecord =>
  isRecord(v) && Object.entries(v).filter(([, value]) => typeof value !== 'string').length === 0;

export const isReadonlyStringArray = (v: unknown): v is ReadonlyStringArray =>
  isArray(v) && v.filter((value) => typeof value !== 'string').length === 0;
