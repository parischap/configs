// This module must not import any external dependency. It must be runnable without a package.json
import { isAbsolute, relative } from 'node:path';
import {
  owner,
  packageJsonFilename,
  packagesFolderName,
  prodFolderName,
  slashedScope,
  versionControlService,
} from './constants.js';
import {
  Config,
  type ReadonlyRecord,
  type ReadonlyStringRecord,
  type Record,
  type StringRecord,
  isArray,
  isRecord,
} from './types.js';

const packageSourceRegExp =
  /^sourceInProd='(?<sourceInProd>NPM|GITHUB)'&versionInProd='(?<versionInProd>[^']*)'&parent='(?<parent>[^']*)'&buildTypeInProd='(?<buildTypeInProd>DEV|PROD|)'&buildTypeInDev='(?<buildTypeInDev>DEV|PROD)'$/;

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

export const toInternalExternalDependencies = ({
  dependencies,
  isDevDependencies,
  packageName,
}: {
  readonly dependencies: ReadonlyStringRecord;
  readonly isDevDependencies: boolean;
  readonly packageName: string;
}): [
  internalDependenciesInDev: StringRecord,
  internalDependenciesInProd: StringRecord,
  externalDependencies: StringRecord,
] => {
  type DependencyEntry = readonly [packageName: string, packageSource: string];
  interface DependencyEntries extends ReadonlyArray<DependencyEntry> {}
  const [internalDependencies, externalDependencies] = Object.entries(dependencies).reduce(
    ([internalDependencies, externalDependencies], entry) =>
      entry[0].startsWith(slashedScope) ?
        [internalDependencies.concat([entry]), externalDependencies]
      : [internalDependencies, externalDependencies.concat([entry])],
    [[] as DependencyEntries, [] as DependencyEntries],
  );

  const [internalDependenciesInDev, internalDependenciesInProd] = internalDependencies
    .map(([importName, importSource]) => {
      if (importSource === 'SELF')
        if (!isDevDependencies)
          throw new Error(
            `'${packageName}': 'SELF' used as source for '${importName}' only authorized in devDependencies`,
          );
        else
          return [
            [importName, 'link:.'] as DependencyEntry,
            [importName, ''] as DependencyEntry,
          ] as const;
      const parsed = packageSourceRegExp.exec(importSource);
      if (parsed === null)
        throw new Error(`'${packageName}': could not parse source of '${importName}'`);
      const { sourceInProd, versionInProd, parent, buildTypeInProd, buildTypeInDev } =
        parsed.groups as {
          readonly sourceInProd: string;
          readonly versionInProd: string;
          readonly parent: string;
          readonly buildTypeInProd: string;
          readonly buildTypeInDev: string;
        };
      if (sourceInProd === 'NPM' && buildTypeInProd !== '')
        throw new Error(
          `'${packageName}': source of '${importName}' is npm and cannot define a buildTypeInProd`,
        );

      const toVersionControlSource = (version: string, buildType: string) => {
        const unscopedImportName = importName.substring(slashedScope.length);
        const buildPath = buildType === 'DEV' ? '' : prodFolderName;
        const [repo, subRepoPath] =
          parent === '' ?
            [unscopedImportName, buildPath]
          : [
              parent,
              `${packagesFolderName}/${unscopedImportName}${buildPath === '' ? '' : '/' + buildPath}`,
            ];
        const params = [
          ...(version === '' ? [] : [version]),
          ...(subRepoPath === '' ? [] : [`path:${subRepoPath}`]),
        ].join('&');
        return `git+https://${versionControlService}/${owner}/${repo}${params === '' ? '' : '#' + params}`;
      };

      return [
        [importName, toVersionControlSource('', buildTypeInDev)] as DependencyEntry,
        [
          importName,
          sourceInProd === 'NPM' ?
            versionInProd === '' ?
              'latest'
            : versionInProd
          : toVersionControlSource(versionInProd, buildTypeInProd),
        ] as DependencyEntry,
      ] as const;
    })
    // unzip
    .reduce(
      ([internalDependenciesInDev, internalDependenciesInProd], [devEntry, prodEntry]) => [
        internalDependenciesInDev.concat([devEntry]),
        internalDependenciesInProd.concat([prodEntry]),
      ],
      [[] as DependencyEntries, [] as DependencyEntries],
    );

  return [
    Object.fromEntries(internalDependenciesInDev),
    Object.fromEntries(internalDependenciesInProd),
    Object.fromEntries(externalDependencies),
  ];
};

export const makeConfigWithLocalInternalDependencies = <C extends Config>(config: C): C => {
  const packageJsonConfig = config[packageJsonFilename];

  const packageName = packageJsonConfig['name'];

  const peerDependencies = packageJsonConfig['peerDependencies'] ?? {};
  const [internalPeerDependenciesInDev, internalPeerDependenciesInProd, externalPeerDependencies] =
    toInternalExternalDependencies({
      dependencies: peerDependencies,
      isDevDependencies: false,
      packageName,
    });

  const dependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['dependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies),
    ),
  );
  const [internalDependenciesInDev, internalDependenciesInProd, externalDependencies] =
    toInternalExternalDependencies({ dependencies, isDevDependencies: false, packageName });

  const devDependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['devDependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies) && !(packageName in dependencies),
    ),
  );

  const [internalDevDependenciesInDev, , externalDevDependencies] = toInternalExternalDependencies({
    dependencies: devDependencies,
    isDevDependencies: true,
    packageName,
  });

  const newPackageJsonConfig = {
    ...packageJsonConfig,
    dependencies: { ...internalDependenciesInDev, ...externalDependencies },
    devDependencies: { ...internalDevDependenciesInDev, ...externalDevDependencies },
    peerDependencies: { ...internalPeerDependenciesInDev, ...externalPeerDependencies },
    publishConfig: {
      dependencies: internalDependenciesInProd,
      peerDependencies: internalPeerDependenciesInProd,
    },
  };

  if (Object.keys(newPackageJsonConfig.dependencies).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete newPackageJsonConfig.dependencies;

  if (Object.keys(newPackageJsonConfig.devDependencies).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete newPackageJsonConfig.devDependencies;

  if (Object.keys(newPackageJsonConfig.peerDependencies).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete newPackageJsonConfig.peerDependencies;

  const publishConfig = newPackageJsonConfig.publishConfig;

  if (Object.keys(publishConfig.dependencies).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete publishConfig.dependencies;

  if (Object.keys(publishConfig.peerDependencies).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete publishConfig.peerDependencies;

  if (Object.keys(publishConfig).length === 0)
    // @ts-expect-error - This is not functional
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
    delete newPackageJsonConfig.publishConfig;

  return {
    ...config,
    [packageJsonFilename]: newPackageJsonConfig,
  };
};
