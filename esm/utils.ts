import { isAbsolute, relative } from 'node:path';
import { packageJsonFilename, slashedDevScope, slashedScope } from './constants.js';
import {
  Config,
  type ReadonlyRecord,
  ReadonlyStringRecord,
  StringRecord,
  isArray,
  isRecord,
} from './types.js';

export const getExtension = (filename: string): string => {
  const extPos = filename.lastIndexOf('.');
  if (extPos === -1) return '';
  return filename.substring(extPos);
};

/*export const fromOsPathToPosixPath = (p: string): string =>
  path.sep === path.posix.sep ? p : p.replaceAll(path.sep, path.posix.sep);*/

export const isSubPathOf =
  (target: string) =>
  (p: string): boolean => {
    const relPath = relative(target, p);
    return !relPath.startsWith('..') && !isAbsolute(relPath);
  };

//export const devWorkspaceLink = (packageName:string):string => `workspace:${slashedDevScope}${packageName}@*`;
export const prettyStringify = (v: unknown): string => JSON.stringify(v, null, 2);

/* eslint-disable-next-line functional/type-declaration-immutability */
type MergedRecord<R1 extends ReadonlyRecord, R2 extends ReadonlyRecord> = {
  [key in keyof R1 | keyof R2]: [key] extends [keyof R1 & keyof R2] ?
    [R1[key]] extends [ReadonlyRecord] ?
      [R2[key]] extends [ReadonlyRecord] ?
        MergedRecord<R1[key], R2[key]>
      : R2[key]
    : R2[key]
  : [key] extends [keyof R1] ? R1[key]
  : [key] extends [keyof R2] ? R2[key]
  : never;
};

export const deepMerge2 = <R1 extends ReadonlyRecord, R2 extends ReadonlyRecord>(
  first: R1,
  second: R2,
): MergedRecord<R1, R2> => {
  const result = { ...first } as Record<keyof R1 | keyof R2, unknown>;

  const secondKeys = Reflect.ownKeys(second) as ReadonlyArray<keyof R2>;

  for (const secondKey of secondKeys) {
    const secondValue = second[secondKey];
    if (secondKey in first) {
      /* @ts-expect-error Typescript should narrow first but does not */
      const firstValue: unknown = first[secondKey];
      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data*/
      result[secondKey] =
        isRecord(secondValue) && isRecord(firstValue) ?
          (deepMerge2(firstValue, secondValue) as never)
        : isArray(secondValue) && isArray(firstValue) ? ([...firstValue, ...secondValue] as never)
        : secondValue;
    } else
      /* eslint-disable-next-line functional/no-expression-statements, functional/immutable-data */
      result[secondKey] = secondValue;
  }

  return result as never;
};

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
} = (...Rs: ReadonlyArray<ReadonlyRecord>) => Rs.reduce(deepMerge2, {} as never) as never;

const toInternalExternalDependencies = (
  dependencies: ReadonlyStringRecord,
): [
  internalDependencies: StringRecord,
  localInternalDependencies: StringRecord,
  externalDependencies: StringRecord,
] => {
  interface DependencyEntries
    extends ReadonlyArray<readonly [packageName: string, packageSourceAndVersion: string]> {}
  const [internalDependencies, externalDependencies] = Object.entries(dependencies).reduce(
    ([internalDependencies, externalDependencies], entry) =>
      entry[0].startsWith(slashedScope) ?
        [internalDependencies.concat([entry]), externalDependencies]
      : [internalDependencies, externalDependencies.concat([entry])],
    [[] as DependencyEntries, [] as DependencyEntries],
  );

  const localInternalDependencies = internalDependencies.map(([packageName]) => [
    packageName,
    `workspace:${slashedDevScope}${packageName.substring(slashedScope.length)}@*`,
  ]);
  return [
    Object.fromEntries(internalDependencies),
    Object.fromEntries(localInternalDependencies),
    Object.fromEntries(externalDependencies),
  ];
};

const addAsIfNotEmpty = ({
  key,
  value,
}: {
  readonly key: string;
  readonly value: ReadonlyRecord;
}) => (Object.keys(value).length === 0 ? {} : { [key]: value });

export const makeConfigWithLocalInternalDependencies = <C extends Config>(config: C): C => {
  const packageJsonConfig = config[packageJsonFilename];

  if (packageJsonConfig === undefined) return config;

  const devDependencies = packageJsonConfig['devDependencies'] ?? {};
  const peerDependencies = packageJsonConfig['peerDependencies'] ?? {};
  const dependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['dependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies),
    ),
  );

  const [internalDependencies, localInternalDependencies, externalDependencies] =
    toInternalExternalDependencies(dependencies);
  const [, localInternalDevDependencies, externalDevDependencies] =
    toInternalExternalDependencies(devDependencies);

  const [internalPeerDependencies, localInternalPeerDependencies, externalPeerDependencies] =
    toInternalExternalDependencies(peerDependencies);

  return {
    ...config,
    [packageJsonFilename]: {
      ...config[packageJsonFilename],
      ...addAsIfNotEmpty({
        key: 'dependencies',
        value: { ...localInternalDependencies, ...externalDependencies },
      }),
      ...addAsIfNotEmpty({
        key: 'devDependencies',
        value: { ...localInternalDevDependencies, ...externalDevDependencies },
      }),
      ...addAsIfNotEmpty({
        key: 'peerDependencies',
        value: { ...localInternalPeerDependencies, ...externalPeerDependencies },
      }),
      ...addAsIfNotEmpty({
        key: 'publishConfig',
        value: {
          ...addAsIfNotEmpty({
            key: 'dependencies',
            value: internalDependencies,
          }),
          ...addAsIfNotEmpty({
            key: 'peerDependencies',
            value: internalPeerDependencies,
          }),
        },
      }),
    },
  };
};
