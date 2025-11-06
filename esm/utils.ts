import * as path from 'node:path';
import type { ReadonlyRecord, Record } from "./types.js";

export const isArray:(v: unknown) => v is Array<unknown> = Array.isArray;

export const isRecord = (v:unknown):v is Record => typeof v === 'object' && v !== null && !Array.isArray(v);

export const getExtension = (filename:string):string => {
  const extPos = filename.lastIndexOf('.');
  if (extPos === -1) return '';
  return filename.substring(extPos);
};

export const fromOsPathToPosixPath = (p:string):string =>
  path.sep === path.posix.sep ? p : p.replaceAll(path.sep, path.posix.sep);

export const isSubPathOf = (target:string) => (p:string):boolean => {
  const relPath = path.posix.relative(target, p);
  return !relPath.startsWith('..') && !path.posix.isAbsolute(relPath);
};

//export const devWorkspaceLink = (packageName:string):string => `workspace:${slashedDevScope}${packageName}@*`;
export const prettyStringify= (v:unknown):string => JSON.stringify(v,null,2);

export const deepMerge2 = <R extends ReadonlyRecord>( first: R, second: R) : R => {
  const result = { ...first } ;

  const secondKeys = Reflect.ownKeys(second) as ReadonlyArray<keyof R>
  
  for (const secondKey of secondKeys) {
    const secondValue = second[secondKey];
    if (!(secondKey in first)) {
      result[secondKey] = secondValue;
      continue;
    }

    const firstValue = first[secondKey];
    result[secondKey] =
      isRecord(secondValue) && isRecord(firstValue) ? deepMerge2(firstValue, secondValue) as never
      : isArray(secondValue) && isArray(firstValue) ? [...firstValue, ...secondValue] as never
      : secondValue;
  }

  return result;
};

export const deepMerge = <K extends string | symbol, V>( ...Rs: ReadonlyArray<ReadonlyRecord<K, V>>): Record<K, V> => Rs.reduce(deepMerge2, {} as Record<K, V> );
