// This module must not import any external dependency. It must be runnable without a package.json
import { isAbsolute, relative } from 'node:path';
import { packageJsonFilename } from './constants.js';
import { Config, type ReadonlyRecord, type Record, isArray, isRecord } from './types.js';

/** Escapes regular expression special characters */
export const regExpEscape = (s: string): string =>
  // @ts-expect-error Awaiting bug correction in typescript
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  RegExp.escape(s);

/** Returns true if `p` is a subpath of `target` */
export const isSubPathOf =
  (target: string) =>
  (p: string): boolean => {
    const relPath = relative(target, p);
    return !relPath.startsWith('..') && !isAbsolute(relPath);
  };

/** Stringifies with indentation */
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
 */
type MergedRecord<R1, R2> =
  R1 extends Record ?
    R2 extends Record ?
      {
        [key in keyof R1 as key extends keyof R2 ? never : key]: R1[key];
      } & { [key in keyof R2 as key extends keyof R1 ? never : key]: R2[key] } & {
        [key in keyof R1 as key extends keyof R2 ? key : never]: key extends keyof R2 ?
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
 */
export const deepMerge2 = <R1 extends ReadonlyRecord, R2 extends ReadonlyRecord>(
  first: R1,
  second: R2,
): MergedRecord<R1, R2> => {
  const result = { ...first } as Record;

  const secondKeys = Reflect.ownKeys(second);

  for (const secondKey of secondKeys) {
    const secondValue = second[secondKey as keyof R2];
    if (secondKey in first) {
      /* @ts-expect-error Typescript should narrow first but does not */
      const firstValue: unknown = first[secondKey];
      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data*/
      result[secondKey as string] =
        isRecord(secondValue) && isRecord(firstValue) ?
          (deepMerge2(firstValue, secondValue) as never)
        : isArray(secondValue) && isArray(firstValue) ? ([...firstValue, ...secondValue] as never)
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
export const deepMerge: {
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
} = (...Rs: ReadonlyArray<ReadonlyRecord>) => Rs.reduce(deepMerge2, {} as never) as never;

/**
 * Modifies a package.json config so that :
 *
 * - a dependency that appears both in dependencies and peerDependencies is kept only as a
 *   peerDependency
 * - a dependency that appears in devDependencies and dependencies or peerDependencies is kept only as
 *   a dependency or peerDependency
 * - removes empty dependencies, devDependencies and peerDependencies keys
 */
export const cleanDependencies = <C extends Config>({
  packageName,
  onlyAllowDevDependencies,
  config,
}: {
  readonly packageName: string;
  readonly onlyAllowDevDependencies: boolean;
  readonly config: C;
}): C => {
  const packageJsonConfig = config[packageJsonFilename];

  const peerDependencies = packageJsonConfig['peerDependencies'] ?? {};
  if (onlyAllowDevDependencies && Object.keys(peerDependencies).length > 0)
    throw new Error(`'${packageName}': peerDependencies are not allowed in this package`);

  const dependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['dependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies),
    ),
  );
  if (onlyAllowDevDependencies && Object.keys(dependencies).length > 0)
    throw new Error(`'${packageName}': dependencies are not allowed in this package`);

  const devDependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['devDependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies) && !(packageName in dependencies),
    ),
  );

  const newPackageJsonConfig = {
    ...Object.fromEntries(
      Object.entries(packageJsonConfig).filter(
        ([key]) => !['dependencies', 'devDependencies', 'peerDependencies'].includes(key),
      ),
    ),
    ...(Object.keys(dependencies).length === 0 ? {} : { dependencies }),
    ...(Object.keys(devDependencies).length === 0 ? {} : { devDependencies }),
    ...(Object.keys(peerDependencies).length === 0 ? {} : { peerDependencies }),
  };

  return {
    ...config,
    [packageJsonFilename]: newPackageJsonConfig,
  };
};
