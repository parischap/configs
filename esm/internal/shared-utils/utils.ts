// This module must not import any external dependency. It must be runnable without a package.json
import { Dirent } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { sep as OSSep, extname, isAbsolute, join, relative } from 'node:path';
import { sep as posixSep } from 'node:path/posix';

/**
 * Redefines the Record type: keys are restricted to strings or symbols. In TypeScript, functions
 * and non-null objects, including arrays, are assignable to this Record definition.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/prefer-readonly-type */
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

/** Alias to ReadonlyRecord with string keys and values */
export interface ReadonlyStringRecord extends ReadonlyRecord<string, string> {}

/** Alias to ReadonlyArray with string values */
export interface ReadonlyStringArray extends ReadonlyArray<string> {}

export const { isArray }: { readonly isArray: (v: unknown) => v is Array<unknown> } = Array;

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
  readonly [k in keyof T as [k] extends [symbol | `_${string}`] ? never : k]: T[k];
};

/**
 * Returns a copy of `s` with the first character capitalized
 *
 * @category Utils
 */
export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Escapes regular expression special characters
 *
 * @category Utils
 */
export const regExpEscape = (s: string): string =>
  // @ts-expect-error Awaiting bug correction in typescript
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  RegExp.escape(s);

/**
 * Converts an OS path to a posix path
 *
 * @category Utils
 */
export const fromOSPathToPosixPath =
  OSSep === posixSep ? (path: string) => path : (path: string) => path.replaceAll(OSSep, posixSep);

/**
 * Converts a posix path to an OS path
 *
 * @category Utils
 */
export const fromPosixPathToOSPath =
  OSSep === posixSep ? (path: string) => path : (path: string) => path.replaceAll(posixSep, OSSep);

/**
 * Returns true if `p` is a subpath of `target`
 *
 * @category Utils
 */
export const isSubPathOf =
  (target: string) =>
  (p: string): boolean => {
    const relPath = relative(target, p);
    return !relPath.startsWith('..') && !isAbsolute(relPath);
  };

/**
 * Stringifies with indentation
 *
 * @category Utils
 */
export const prettyStringify = (v: unknown): string => JSON.stringify(v, null, 2);

/**
 * Type-level result of merging two record types R1 and R2 used by `deepMerge2` and `deepMerge`.
 *
 * Rules:
 *
 * - Keys exclusive to R1 or R2 are preserved.
 * - Keys present in both:
 *
 *   - If both values are Records, the type is recursively merged (MergedRecord).
 *   - Otherwise the value type comes from R2 (R2 overrides).
 *
 * @category Type-utility
 */
type MergedRecord<R1, R2> =
  R1 extends Record ?
    R2 extends Record ?
      /* eslint-disable-next-line functional/prefer-readonly-type */
      {
        [key in keyof R1 as [key] extends [keyof R2] ? never : key]: R1[key];
        /* eslint-disable-next-line functional/prefer-readonly-type */
      } & { [key in keyof R2 as [key] extends [keyof R1] ? never : key]: R2[key] } & {
        [key in keyof R1 as [key] extends [keyof R2] ? key : never]: [key] extends [keyof R2] ?
          MergedRecord<R1[key], R2[key]>
        : never;
      }
    : R2
  : R2;

/**
 * Deeply merges two objects.
 *
 * Behavior:
 *
 * - If both values are plain objects (Records), they are merged recursively.
 * - If both values are arrays, they are concatenated in order: [...first, ...second].
 * - Keys only present in one objrct are preserved.
 *
 * @category Utils
 */
export const deepMerge2 = <R1 extends ReadonlyRecord, R2 extends ReadonlyRecord>(
  first: R1,
  second: R2,
): MergedRecord<R1, R2> => {
  const result = { ...first } as Record;

  for (const secondKey of Reflect.ownKeys(second)) {
    const secondValue = second[secondKey as keyof R2];
    if (secondKey in first) {
      /* @ts-expect-error Typescript should narrow first but does not */
      const firstValue: unknown = first[secondKey];
      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data */
      result[secondKey as string] =
        isArray(secondValue) && isArray(firstValue) ? ([...firstValue, ...secondValue] as never)
        : isRecord(secondValue) && isRecord(firstValue) ?
          (deepMerge2(firstValue, secondValue) as never)
        : secondValue;
    } else
      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data */
      result[secondKey as string] = secondValue;
  }

  return result as never;
};

/**
 * Deep merge of multiple records.
 *
 * Wrapper over deepMerge2 which reduces an array of records into a single merged record. Supports
 * merging 2..6 arguments with proper result typing
 */
/*export const deepMerge: {
  <R1 extends ReadonlyRecord, R2 extends ReadonlyRecord>(r1: R1, r2: R2): MergedRecord<R1, R2>;
  <R1 extends ReadonlyRecord, R2 extends ReadonlyRecord, R3 extends ReadonlyRecord>(
    r1: R1,
    r2: R2,
    r3: R3,
  ): MergedRecord<MergedRecord<R1, R2>, R3>;
  <
    R1 extends ReadonlyRecord,
    R2 extends ReadonlyRecord,
    R3 extends ReadonlyRecord,
    R4 extends ReadonlyRecord,
  >(
    r1: R1,
    r2: R2,
    r3: R3,
    r4: R4,
  ): MergedRecord<MergedRecord<MergedRecord<R1, R2>, R3>, R4>;
  <
    R1 extends ReadonlyRecord,
    R2 extends ReadonlyRecord,
    R3 extends ReadonlyRecord,
    R4 extends ReadonlyRecord,
    R5 extends ReadonlyRecord,
  >(
    r1: R1,
    r2: R2,
    r3: R3,
    r4: R4,
    r5: R5,
  ): MergedRecord<MergedRecord<MergedRecord<MergedRecord<R1, R2>, R3>, R4>, R5>;
  <
    R1 extends ReadonlyRecord,
    R2 extends ReadonlyRecord,
    R3 extends ReadonlyRecord,
    R4 extends ReadonlyRecord,
    R5 extends ReadonlyRecord,
    R6 extends ReadonlyRecord,
  >(
    r1: R1,
    r2: R2,
    r3: R3,
    r4: R4,
    r5: R5,
    r6: R6,
  ): MergedRecord<MergedRecord<MergedRecord<MergedRecord<MergedRecord<R1, R2>, R3>, R4>, R5>, R6>;
} = (...Rs: ReadonlyArray<ReadonlyRecord>) => Rs.reduce(deepMerge2, {} as never) as never;*/

/**
 * Turns an array of path patterns into a regular expression. In the patterns, `*` can be used to
 * represent any number of characters except `/`
 *
 * @category Utils
 */
export const toMiniGlobRegExp = (patterns: ReadonlyArray<string>): RegExp =>
  new RegExp(
    '^'
      + patterns.map((pattern) => regExpEscape(pattern).replace(/\*/g, '[^\\/]*')).join('|')
      + '$',
  );

/**
 * Same as node readdir but always returns Dirents. If `dontFailOnInexistentPath` is true, will not
 * fail if `path` does not exist
 *
 * @category Utils
 */
export const readDir = async ({
  path,
  recursive,
  dontFailOnInexistentPath,
}: {
  readonly path: string;
  readonly recursive: boolean;
  readonly dontFailOnInexistentPath: boolean;
}): Promise<ReadonlyArray<Dirent>> => {
  try {
    return await readdir(path, {
      recursive,
      withFileTypes: true,
    });
  } catch (e: unknown) {
    if (dontFailOnInexistentPath && e instanceof Error && 'code' in e && e.code === 'ENOENT')
      return [];
    throw e;
  }
};

/**
 * Returns the names of the folders of `path`
 *
 * @category Utils
 */
export const readFolders = async ({
  path,
  dontFailOnInexistentPath,
}: {
  readonly path: string;
  readonly dontFailOnInexistentPath: boolean;
}): Promise<Array<string>> => {
  const contents = await readDir({ path, recursive: false, dontFailOnInexistentPath });
  return contents.filter((dirent) => dirent.isDirectory()).map(({ name }) => name);
};

/**
 * Returns the names of the files of `path`
 *
 * @category Utils
 */
export const readFiles = async ({
  path,
  dontFailOnInexistentPath,
}: {
  readonly path: string;
  readonly dontFailOnInexistentPath: boolean;
}): Promise<Array<string>> => {
  const contents = await readDir({ path, recursive: false, dontFailOnInexistentPath });
  return contents.filter((dirent) => dirent.isFile()).map(({ name }) => name);
};

/**
 * Reads the contents of the `path` folder, recursively, but excludes the top folders whose list is
 * given by `foldersToExclude`. If `dontFailOnInexistentPath` is true, will not fail if `path` does
 * not exist. For each found file returns:
 *
 * - name: the name of the file with extension
 * - bareName: the name of the file without extension
 * - extension: the extension of the file (ex: .js)
 * - parentPath: the path to the folder containing the file expressed relatively to CWD
 * - path: the path to the file expressed relatively to CWD
 * - relativeParentPath : the path to the folder containing the file expressed relatively to
 *   `relativePathSource` which is by default taken equal to `path`
 * - relativePath : the path to the the file expressed relatively to `relativePathSource` which is by
 *   default taken equal to `path`
 *
 * @category Utils
 */
export const readFilesRecursively = async ({
  path,
  foldersToExclude,
  dontFailOnInexistentPath,
  relativePathSource = path,
}: {
  readonly path: string;
  readonly foldersToExclude: ReadonlyArray<string>;
  readonly dontFailOnInexistentPath: boolean;
  readonly relativePathSource?: string;
}): Promise<
  Array<{
    name: string;
    bareName: string;
    extension: string;
    path: string;
    parentPath: string;
    relativeParentPath: string;
    relativePath: string;
  }>
> => {
  const topContents = await readDir({ path, recursive: false, dontFailOnInexistentPath });
  const topFolders = topContents
    .filter((dirent) => dirent.isDirectory())
    .filter(({ name }) => !foldersToExclude.includes(name))
    .map(({ name }) => name);

  const otherContents = await Promise.all(
    topFolders.map((topFolderName) =>
      readDir({
        path: join(path, topFolderName),
        recursive: true,
        dontFailOnInexistentPath: false,
      }),
    ),
  );
  return [...topContents, ...otherContents.flat()]
    .filter((dirent) => dirent.isFile())
    .map(({ name, parentPath }) => {
      const extension = extname(name);
      const bareName = name.substring(0, name.length - extension.length);
      const relativeParentPath = relative(relativePathSource, parentPath);
      return {
        name,
        bareName,
        extension,
        parentPath,
        path: join(parentPath, name),
        relativeParentPath,
        relativePath: join(relativeParentPath, name),
      };
    });
};

/**
 * Reads a JSON file that must contain the JSON representation of an object
 *
 * @category Utils
 */
export const readJsonFile = async (path: string): Promise<Record> => {
  const contents = await readFile(path, 'utf8');

  const configFile: unknown = JSON.parse(contents);

  if (!isRecord(configFile))
    throw new Error(`'${path}' must contain the json representation of a non-null object`);
  return configFile;
};

/**
 * Parses command-line arguments into a key-value pair format.
 *
 * Processes arguments passed via `process.argv` starting from index 2, converting them into an
 * array of tuples. Arguments with an equals sign are split into name and value, while arguments
 * without are treated as boolean flags with a value of `true`.
 *
 * @category Utils
 * @example
 *   // Given command: `node app.js --verbose --output=result.txt`
 *   // Returns: [["--verbose", true], ["--output", "result.txt"]]
 *
 * @returns An array of tuples where each tuple contains a flag name and its value. For flags
 *   without values (e.g., `--verbose`), the value is `true`. For flags with values (e.g.,
 *   `--output=file.txt`), the value is the string after the equals sign.
 */
export const getExeFlags = (): Array<[name: string, value: string | boolean]> =>
  process.argv.slice(2).map((arg) => {
    const eqIndex = arg.indexOf('=');
    if (eqIndex === -1) return [arg, true];
    return [arg.substring(0, eqIndex), arg.substring(eqIndex + 1)];
  });

/**
 * Partitions an array into two arrays based on a predicate
 *
 * @category Utils
 */
export const partitionArray = <T>(
  array: ReadonlyArray<T>,
  predicate: (item: T) => boolean,
): [matching: Array<T>, nonMatching: Array<T>] =>
  array.reduce<[Array<T>, Array<T>]>(
    ([matching, nonMatching], elem) =>
      predicate(elem) ? [[...matching, elem], nonMatching] : [matching, [...nonMatching, elem]],
    [[], []],
  );

/**
 * Formats a javascript object in YAML
 *
 * @category Utils
 */
export const objectToYaml = ({
  value,
  errorPrefix = '',
}: {
  readonly value: ReadonlyRecord;
  readonly errorPrefix?: string;
}): Array<string> =>
  Object.entries(value).flatMap(([key, elem]) => {
    const valueIsArray = Array.isArray(value);
    const elemPart = (
      typeof elem === 'number' || typeof elem === 'boolean' ? () => elem.toString()
      : typeof elem === 'string' ?
        () => {
          const lines = elem.split('\n');
          return lines.length <= 1 ? lines : ['|', ...lines];
        }
      : typeof elem === 'object' ?
        elem === null ?
          () => ''
        : () => [...(valueIsArray ? [] : ['']), ...objectToYaml({ value: elem, errorPrefix })]
      : () => {
          throw new Error(
            `${errorPrefix}This value of key '${key}' cannot be converted to YAML: ${prettyStringify(elem)}`,
          );
        })();
    const keyPart = valueIsArray ? '-' : `${key}:`;
    return Array.isArray(elemPart) ?
        elemPart.map(
          (line, index) =>
            `${index === 0 ? `${keyPart}${line.length === 0 ? '' : ' '}` : '  '}${line}`,
        )
      : `${keyPart}${elemPart.length === 0 ? '' : ' '}${elemPart}`;
  });
