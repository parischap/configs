// This module must not import any external dependency. It must be runnable without a package.json
import { isAbsolute, relative } from 'node:path';
import { parse } from 'node:querystring';
import {
  owner,
  packageJsonFilename,
  packagesFolderName,
  prodFolderName,
  slashedDevScope,
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
} = (...Rs: ReadonlyArray<ReadonlyRecord>) => Rs.reduce(deepMerge2, {} as never) as never;

const toVersionControlSource = ({
  version = undefined,
  buildStage,
  importRepoName,
  importSubRepoName,
}: {
  readonly version?: string | undefined;
  readonly buildStage: 'PROD' | 'DEV';
  readonly importRepoName: string;
  readonly importSubRepoName: string | undefined;
}): string => {
  const buildPath = buildStage === 'DEV' ? '' : prodFolderName;
  const subRepoPath =
    importSubRepoName === undefined ? buildPath : (
      `${packagesFolderName}/${importSubRepoName}/${buildPath}`
    );
  const params = [
    ...(version === undefined ? [] : [version]),
    ...(subRepoPath === '' ? [] : [`path:${subRepoPath}`]),
  ].join('&');
  // Use ssh protocol so the sshkey can be used to access private github repos
  return `git+ssh://${versionControlService}/${owner}/${importRepoName}${params === '' ? '' : '#' + params}`;
};

const toWorkspaceSource = ({
  buildStage,
  unscopedImportName,
}: {
  readonly buildStage: 'PROD' | 'DEV';
  readonly unscopedImportName: string;
}): string =>
  buildStage === 'DEV' ? `workspace:${slashedDevScope}${unscopedImportName}@*` : 'workspace:*';

/**
 * Takes a list of dependencies with their name and source. Returns:
 *
 * - the external dependencies unchanged (externalDependencies)
 * - a development version of the internal dependencies (internalDependenciesInDev)
 * - a production version of the internal dependencies (internalDependenciesInProd)
 *
 * Internal dependencies are those that start with '@parischap'.
 *
 * Internal dependencies' sources must be passed in the following format:
 * sourceInProd='value'&versionInProd='value'&buildTypeInProd='value'&sourceInDev='value'&buildTypeInDev='value'&parent='value';
 *
 * Parameters can be passed in any order. Here is a description of their meaning:
 *
 * - SourceInProd: indicates where to get the dependency from in the production version of the package
 *   that uses it. Allowed values are `NPM` or `GITHUB`. This parameter must not be used for a
 *   devDependency because it will get removed in production.
 * - versionInProd: indicates the version of the dependency to use in the production version of the
 *   package that uses it. If sourceInProd is GITHUB, the version is the release tag (e.g.
 *   effect-lib@0.11.0). This parameter must not be used for a devDependency because it will get
 *   removed in production. If omitted, the version defaults to latest published version for NPM and
 *   the latest commit for GITHUB.
 * - buildStageInProd: this parameter must only be used if SourceInProd is GITHUB. It indicates the
 *   build stage of the dependency to use in the production version of the package that uses it. If
 *   sourceInProd is GITHUB, you can use 'DEV' to use the development version of the dependency (the
 *   one under `./esm`) and 'PROD' to use the production version of the dependency (the one under
 *   `dist/esm`). This parameter must not be used for a devDependency because it will get removed in
 *   production.
 * - SourceInDev: indicates where to get the dependency from in the development version of the package
 *   that uses it. Allowed values are `WORKSPACE` (uses the workspace protocol, errors if the
 *   dependency is not in the same workspace as the package that uses it), `GITHUB` (uses the github
 *   scheme) or `AUTO` (uses the workspace protocol if possible, the gityhub scheme otherwise).
 * - buildStageInDev: this parameter indicates the build stage of the dependency to use in the
 *   development version of the package that uses it. Allowed values are 'DEV' to use the
 *   development version of the dependency (the one under `.`) and 'PROD' to use the production
 *   version of the dependency (the one under `dist`).
 * - parent: optional argument which indicates the dependency's parent monorepo. Must only be used for
 *   internal dependencies that are subrepos
 */

export const toInternalExternalDependencies = ({
  repoName,
  packageName,
  dependencies,
  allowWorkspaceSources,
  isDevDependencies,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly dependencies: ReadonlyStringRecord;
  readonly allowWorkspaceSources: boolean;
  readonly isDevDependencies: boolean;
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

  const decodedInternalDependencies = internalDependencies.map(([importName, importSource]) => {
    const { sourceInProd, versionInProd, buildStageInProd, sourceInDev, buildStageInDev, parent } =
      parse(importSource);

    if (
      Array.isArray(sourceInProd)
      || Array.isArray(versionInProd)
      || Array.isArray(buildStageInProd)
      || Array.isArray(sourceInDev)
      || Array.isArray(buildStageInDev)
      || Array.isArray(parent)
    )
      throw new Error(
        `'${packageName}': dependency '${importName}' cannot use parameters of type Array`,
      );

    const unscopedImportName = importName.substring(slashedScope.length);
    const [importRepoName, importSubRepoName] =
      parent === undefined ? [unscopedImportName, undefined] : [parent, unscopedImportName];

    return [
      importName,
      {
        sourceInProd,
        versionInProd,
        buildStageInProd,
        sourceInDev,
        buildStageInDev,
        importRepoName,
        importSubRepoName,
        unscopedImportName,
      },
    ] as const;
  });

  const internalDependenciesInDev = decodedInternalDependencies.map(
    ([
      importName,
      { sourceInDev, buildStageInDev, importRepoName, importSubRepoName, unscopedImportName },
    ]) => {
      if (buildStageInDev !== 'DEV' && buildStageInDev !== 'PROD')
        throw new Error(
          `'${packageName}': dependency '${importName}' must have value 'DEV' or 'PROD' for 'buildStageInDev' parameter. Actual:'${buildStageInDev}'`,
        );

      if (sourceInDev === 'GITHUB')
        return [
          importName,
          toVersionControlSource({
            buildStage: buildStageInDev,
            importRepoName,
            importSubRepoName,
          }),
        ] as const;
      else if (sourceInDev === 'WORKSPACE')
        if (repoName === importRepoName && allowWorkspaceSources)
          return [
            importName,
            toWorkspaceSource({ buildStage: buildStageInDev, unscopedImportName }),
          ] as const;
        else
          throw new Error(
            `'${packageName}': dependency '${importName}' is not allowed to use 'WORKSPACE' for 'SourceInDev' parameter`
              + (allowWorkspaceSources ?
                ` because '${packageName}' belongs to repo '${repoName}' and '${importName}' belongs to repo ${importRepoName}`
              : ''),
          );
      else if (sourceInDev === 'AUTO')
        if (repoName === importRepoName && allowWorkspaceSources)
          return [
            importName,
            toWorkspaceSource({ buildStage: buildStageInDev, unscopedImportName }),
          ] as const;
        else
          return [
            importName,
            toVersionControlSource({
              buildStage: buildStageInDev,
              importRepoName,
              importSubRepoName,
            }),
          ] as const;
      else
        throw new Error(
          `'${packageName}': dependency '${importName}' must have value 'GITHUB', 'WORKSPACE' or 'AUTO' for 'sourceInDev' parameter. Actual:'${sourceInDev}'`,
        );
    },
  );

  if (isDevDependencies) {
    decodedInternalDependencies.forEach(
      ([importName, { sourceInProd, versionInProd, buildStageInProd }]) => {
        if (sourceInProd !== undefined)
          throw new Error(
            `'${packageName}': devDependency '${importName}' will get removed in production and cannot specify 'sourceInProd' parameter`,
          );
        if (versionInProd !== undefined)
          throw new Error(
            `'${packageName}': devDependency '${importName}' will get removed in production and cannot specify 'versionInProd' parameter`,
          );
        if (buildStageInProd !== undefined)
          throw new Error(
            `'${packageName}': devDependency '${importName}' will get removed in production and cannot specify 'buildStageInProd' parameter`,
          );
      },
    );
    return [
      Object.fromEntries(internalDependenciesInDev),
      {},
      Object.fromEntries(externalDependencies),
    ];
  }

  const internalDependenciesInProd = decodedInternalDependencies.map(
    ([
      importName,
      { sourceInProd, versionInProd, buildStageInProd, importRepoName, importSubRepoName },
    ]) => {
      if (sourceInProd === 'NPM')
        if (buildStageInProd !== undefined)
          throw new Error(
            `'${packageName}': dependency '${importName}' cannot define a value for 'buildStageInProd' parameter because it uses source 'NPM'. Actual:'${buildStageInProd}'`,
          );
        else return [importName, versionInProd ?? 'latest'] as const;

      if (buildStageInProd !== 'DEV' && buildStageInProd !== 'PROD')
        throw new Error(
          `'${packageName}': dependency '${importName}' must have value 'DEV' or 'PROD' for 'buildStageInProd' parameter. Actual:'${buildStageInProd}'`,
        );

      if (sourceInProd !== 'GITHUB')
        throw new Error(
          `'${packageName}': dependency '${importName}' must have value 'GITHUB' or 'NPM' for 'SourceInProd' parameter. Actual:'${sourceInProd}'`,
        );

      return [
        importName,
        toVersionControlSource({
          version: versionInProd,
          buildStage: buildStageInProd,
          importRepoName,
          importSubRepoName,
        }),
      ] as const;
    },
  );

  return [
    Object.fromEntries(internalDependenciesInDev),
    Object.fromEntries(internalDependenciesInProd),
    Object.fromEntries(externalDependencies),
  ];
};

export const makeConfigWithLocalInternalDependencies = <C extends Config>({
  repoName,
  packageName,
  onlyAllowDevDependencies,
  allowWorkspaceSources,
  config,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly onlyAllowDevDependencies: boolean;
  readonly allowWorkspaceSources: boolean;
  readonly config: C;
}): C => {
  const packageJsonConfig = config[packageJsonFilename];

  const peerDependencies = packageJsonConfig['peerDependencies'] ?? {};
  if (onlyAllowDevDependencies && Object.keys(peerDependencies).length > 0)
    throw new Error(`'${packageName}': peerDependencies are not allowed in this package`);
  const [internalPeerDependenciesInDev, internalPeerDependenciesInProd, externalPeerDependencies] =
    toInternalExternalDependencies({
      repoName,
      packageName,
      dependencies: peerDependencies,
      allowWorkspaceSources,
      isDevDependencies: false,
    });

  const dependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['dependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies),
    ),
  );
  if (onlyAllowDevDependencies && Object.keys(dependencies).length > 0)
    throw new Error(`'${packageName}': dependencies are not allowed in this package`);

  const [internalDependenciesInDev, internalDependenciesInProd, externalDependencies] =
    toInternalExternalDependencies({
      repoName,
      packageName,
      dependencies,
      allowWorkspaceSources,
      isDevDependencies: false,
    });

  const devDependencies = Object.fromEntries(
    Object.entries(packageJsonConfig['devDependencies'] ?? {}).filter(
      ([packageName]) => !(packageName in peerDependencies) && !(packageName in dependencies),
    ),
  );

  const [internalDevDependenciesInDev, , externalDevDependencies] = toInternalExternalDependencies({
    repoName,
    packageName,
    dependencies: devDependencies,
    allowWorkspaceSources,
    isDevDependencies: true,
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
