/* eslint-disable */
// @ts-nocheck
// This file must not import anything external

import * as path from 'node:path';
import { slashedDevScope } from './constants.js';

/** @import {Record, ReadonlyRecord} from "./types.d.ts" */

/** @type (v: unknown) => v is Array<unknown> */
const isArray = Array.isArray;

/** @type (v: unknown) => v is Record */
const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/** @type (filename:string) => string */
export const getExtension = (filename) => {
  const extPos = filename.lastIndexOf('.');
  if (extPos === -1) return '';
  return filename.substring(extPos);
};

/** @type (p:string) => string */
export const fromOsPathToPosixPath = (p) =>
  path.sep === path.posix.sep ? p : p.replaceAll(path.sep, path.posix.sep);

/** @type (target:string) =>(p:string) => boolean */
export const isSubPathOf = (target) => (p) => {
  const relPath = path.posix.relative(target, p);
  return !relPath.startsWith('..') && !path.posix.isAbsolute(relPath);
};

/** @type (packageName:string) => string */
export const devWorkspaceLink = (packageName) => `workspace:${slashedDevScope}${packageName}@*`;

/**
 * @type <K extends string | symbol, V>( first: ReadonlyRecord<K, V>, second: ReadonlyRecord<K, V>,
 *   ) => Record<K, V>;
 */

export const deepMerge2 = (first, second) => {
  const result = { ...first };

  for (const secondKey of Reflect.ownKeys(second)) {
    const secondValue = second[secondKey];
    if (!(secondKey in first)) {
      result[secondKey] = secondValue;
      break;
    }

    const firstValue = first[secondKey];
    result[secondKey] =
      isRecord(secondValue) && isRecord(firstValue) ? deepMerge2(secondValue, firstValue)
      : isArray(secondValue) && isArray(firstValue) ? [...firstValue, ...secondValue]
      : secondValue;
  }

  return result;
};

/** @type <K extends string | symbol, V>( ...Rs: ReadonlyArray<ReadonlyRecord<K, V>>)=> Record<K, V> */
export const deepMerge = (...Rs) => Rs.reduce(deepMerge2, {});
