/* eslint-disable */
// @ts-nocheck


import * as path from 'node:path';

/** @import {Record, ReadonlyRecord} from "./types.js" */

/** @type (v: unknown) => v is Array<unknown> */
export const isArray = Array.isArray;

/** 
 * @param {unknown} v
 * @returns {v is Record } */
export const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * @param {string} filename
 * @returns {string}
 */
export const getExtension = (filename) => {
  const extPos = filename.lastIndexOf('.');
  if (extPos === -1) return '';
  return filename.substring(extPos);
};

/**
 * @param {string} p
 * @returns {string}
 */
export const fromOsPathToPosixPath = (p) =>
  path.sep === path.posix.sep ? p : p.replaceAll(path.sep, path.posix.sep);

/** @type (target:string) =>(p:string) => boolean */
export const isSubPathOf = (target) => (p) => {
  const relPath = path.posix.relative(target, p);
  return !relPath.startsWith('..') && !path.posix.isAbsolute(relPath);
};

/**
 * @param {string} packageName
 * @returns {string}
 */
//export const devWorkspaceLink = (packageName) => `workspace:${slashedDevScope}${packageName}@*`;

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
      continue;
    }

    const firstValue = first[secondKey];
    result[secondKey] =
      isRecord(secondValue) && isRecord(firstValue) ? deepMerge2(firstValue, secondValue)
      : isArray(secondValue) && isArray(firstValue) ? [...firstValue, ...secondValue]
      : secondValue;
  }

  return result;
};

/** @type <K extends string | symbol, V>( ...Rs: ReadonlyArray<ReadonlyRecord<K, V>>)=> Record<K, V> */
export const deepMerge = (...Rs) => Rs.reduce(deepMerge2, {});
