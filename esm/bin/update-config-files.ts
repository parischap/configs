/**
 * This bin reads the keys and values of a default object exported by the file named
 * `project.config.ts` located in the current path. It creates a file for each key of that object
 * with the key as name. If the key ends with .json, the value is converted from an object to a json
 * string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. This
 * bin will also check that there are no unexpected config files present in the package, i.e config
 * files which are not created by this bin (there are a few exceptions: the `project.config.js` file
 * itself, the `README.md` file... see `patternsToIgnore` below).
 *
 * There are two exceptions:
 *
 * - when this bin is executed at the top package level, it does not read a `project.config.ts` file,
 *   which must not be present. A default configuration is stored for this package in this bin.
 * - when this bin is executed at the configs package level, it does not read a`project.config.ts`
 *   file, which must not be present. A default configuration is stored for this package in this
 *   bin. Moreover, this bin will install configuration files for the top package and all repo and
 *   subrepos. If there is no `project.config.ts`,or if this file contains errors, a default
 *   configuration is used.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Dirent } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, normalize, relative, resolve } from 'node:path';
import {
  configFilename,
  configsPackageName,
  docsFolderName,
  githubFolderName,
  packagesFolderName,
  pnpmLockFilename,
  projectsFolderName,
  readMeFilename,
  topPackageName,
  viteTimeStampFilenamePattern,
  vscodeWorkspaceFilenamePattern,
} from '../constants.js';
import configMonoRepo from '../internal/configMonoRepo.js';
import configOnePackageRepo from '../internal/configOnePackageRepo.js';
import configSubRepo from '../internal/configSubRepo.js';
import configTop from '../internal/configTop.js';
import { isReadonlyStringArray, isReadonlyStringRecord, isRecord } from '../types.js';
import { getExtension, prettyStringify } from '../utils.js';

// List of configuration files for which an error must not be reported if they are present in the package and not overridden by project.config.js
const patternsToIgnore = [
  readMeFilename,
  configFilename,
  viteTimeStampFilenamePattern,
  pnpmLockFilename,
  vscodeWorkspaceFilenamePattern,
];

const patternsToIgnoreRegExp = new RegExp(
  '^'
    + patternsToIgnore
      .map((pattern) => pattern.replace(/[/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '[^\\/]*'))
      .join('|')
    + '$',
);

// List of folders where configuration files might be found
const foldersToInclude = [githubFolderName, docsFolderName];

/*publishConfig: {
      main: `./${commonJsFolderName}/index.js`,
      types: `./${typesFolderName}/index.d.ts`,
      exports: {
        '.': {
          types: `./${typesFolderName}/index.d.ts`,
          default: `./${commonJsFolderName}/index.js`,
        },
      },
    },*/

const readDirEvenIfMissing = async ({
  path,
  recursive,
}: {
  readonly path: string;
  readonly recursive: boolean;
}): Promise<Dirent[]> => {
  try {
    return await readdir(path, { recursive, withFileTypes: true });
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') return [];
    throw e;
  }
};

const fileExists = async (path: string): Promise<boolean> => {
  try {
    /* eslint-disable-next-line functional/no-expression-statements*/
    await stat(path);
    return true;
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') return false;
    throw e;
  }
};

const applyConfig = async ({
  packagePath,
  repoName,
  packageName,
  level,
}: {
  readonly packagePath: string;
  readonly repoName: string;
  readonly packageName: string;
  readonly level: 'top' | 'configsRepo' | 'otherMonorepo' | 'onePackageRepo' | 'subRepo';
}) => {
  const configPath = join(packagePath, configFilename);

  if (level === 'top' || level === 'configsRepo') {
    const hasConfigFile = await fileExists(configPath);
    if (hasConfigFile) throw new Error(`'${packageName}': no '${configFilename}' file allowed`);
  }

  const configFunc =
    level === 'top' ?
      async () => {
        console.log(`'${packageName}': using default top configuration`);
        return Promise.resolve(
          configTop({
            description: 'Top repo of my developments',
          }),
        );
      }
    : level === 'configsRepo' ?
      async () => {
        console.log(`'${packageName}': using default configs configuration`);
        return Promise.resolve(
          configOnePackageRepo({
            packageName,
            description: 'Utility to generate configuration files in a repository',
            devDependencies: {
              '@types/eslint': '^9.6.1',
              '@types/eslint-config-prettier': '^6.11.3',
            },
            environment: 'Node',
            buildMethod: 'None',
            isPublished: false,
            hasDocGen: false,
          }),
        );
      }
    : async () => {
        try {
          console.log(`'${packageName}': reading '${configFilename}'`);

          const contents = await readFile(configPath, 'utf8');
          const configParameters: unknown = JSON.parse(contents);

          if (!isRecord(configParameters))
            throw new Error(
              `'${packageName}': '${configFilename}' must contain the json representation of a non-null object`,
            );

          const configName = configParameters['configName'];
          //  'configOnePackageRepo', 'configSubRepo', 'configTop'
          if (configName === 'configMonoRepo' || configName === 'configTop') {
            const description = configParameters['description'];
            if (typeof description !== 'string')
              throw new Error(
                `'${packageName}': parameter 'description' of '${configFilename}' should be of type string'`,
              );

            if (Object.entries(configParameters).length !== 2)
              throw new Error(
                `'${packageName}': '${configFilename}' contains unexpected parameters for config '${configName}'`,
              );

            if (configName === 'configMonoRepo')
              return configMonoRepo({ packageName, description });

            return configTop({ description });
          }

          if (configName === 'configOnePackageRepo' || configName === 'configSubRepo') {
            const description = configParameters['description'];
            if (typeof description !== 'string')
              throw new Error(
                `'${packageName}': parameter 'description' of '${configFilename}' should be of type string'`,
              );

            const dependencies = configParameters['dependencies'] ?? {};
            if (!isReadonlyStringRecord(dependencies))
              throw new Error(
                `'${packageName}': parameter 'dependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
              );

            const devDependencies = configParameters['devDependencies'] ?? {};
            if (!isReadonlyStringRecord(devDependencies))
              throw new Error(
                `'${packageName}': parameter 'devDependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
              );

            const peerDependencies = configParameters['peerDependencies'] ?? {};
            if (!isReadonlyStringRecord(peerDependencies))
              throw new Error(
                `'${packageName}': parameter 'peerDependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
              );

            const examples = configParameters['examples'] ?? [];
            if (!isReadonlyStringArray(examples))
              throw new Error(
                `'${packageName}': parameter 'examples' of '${configFilename}' should be of type ReadonlyStringArray'`,
              );

            const scripts = configParameters['scripts'] ?? {};
            if (!isReadonlyStringRecord(scripts))
              throw new Error(
                `'${packageName}': parameter 'scripts' of '${configFilename}' should be of type ReadonlyStringRecord'`,
              );

            const environment = configParameters['environment'];
            if (typeof environment !== 'string')
              throw new Error(
                `'${packageName}': parameter 'environment' of '${configFilename}' should be of type string'`,
              );

            const buildMethod = configParameters['buildMethod'];
            if (typeof buildMethod !== 'string')
              throw new Error(
                `'${packageName}': parameter 'buildMethod' of '${configFilename}' should be of type string'`,
              );

            const isPublished = configParameters['isPublished'];
            if (typeof isPublished !== 'boolean')
              throw new Error(
                `'${packageName}': parameter 'isPublished' of '${configFilename}' should be of type boolean'`,
              );

            const hasDocGen = configParameters['hasDocGen'];
            if (typeof hasDocGen !== 'boolean')
              throw new Error(
                `'${packageName}': parameter 'hasDocGen' of '${configFilename}' should be of type boolean'`,
              );

            const keywords = configParameters['keywords'] ?? [];
            if (!isReadonlyStringArray(keywords))
              throw new Error(
                `'${packageName}': parameter 'keywords' of '${configFilename}' should be of type ReadonlyStringArray'`,
              );

            const useEffectAsPeerDependency = configParameters['useEffectAsPeerDependency'];
            if (typeof useEffectAsPeerDependency !== 'boolean')
              throw new Error(
                `'${packageName}': parameter 'useEffectAsPeerDependency' of '${configFilename}' should be of type boolean'`,
              );

            const useEffectPlatform = configParameters['useEffectPlatform'] ?? 'No';
            if (typeof useEffectPlatform !== 'string')
              throw new Error(
                `'${packageName}': parameter 'useEffectPlatform' of '${configFilename}' should be of type string'`,
              );

            if (Object.entries(configParameters).length !== 12)
              throw new Error(
                `'${packageName}': '${configFilename}' contains unexpected parameters for config '${configName}'`,
              );

            if (configName === 'configOnePackageRepo')
              return configOnePackageRepo({
                packageName,
                description,
                dependencies,
                devDependencies,
                peerDependencies,
                examples,
                scripts,
                environment,
                buildMethod,
                isPublished,
                hasDocGen,
                keywords,
                useEffectAsPeerDependency,
                useEffectPlatform,
              });

            return configSubRepo({
              repoName,
              packageName,
              description,
              dependencies,
              devDependencies,
              peerDependencies,
              examples,
              scripts,
              environment,
              buildMethod,
              isPublished,
              hasDocGen,
              keywords,
              useEffectAsPeerDependency,
              useEffectPlatform,
            });
          }
        } catch (e) {
          if (level === 'unknown')
            throw new Error(`'${packageName}': ${e instanceof Error ? e.message : 'Error'}`, {
              cause: e,
            });

          const configFunc =
            level === 'otherMonorepo' ?
              () => {
                console.log(
                  `'${packageName}': error while reading '${configFilename}', using default monorepo configuration`,
                );
                return configMonoRepo({ packageName, description: 'Default monorepo' });
              }
            : level === 'onePackageRepo' ?
              () => {
                console.log(
                  `'${packageName}': error while reading '${configFilename}', using default one-package repo configuration`,
                );
                return configOnePackageRepo({
                  packageName,
                  description: 'Default configuration of a one-package repo',
                  environment: 'Node',
                  buildMethod: 'Bundle',
                  isPublished: false,
                  hasDocGen: false,
                });
              }
            : () => {
                console.log(
                  `'${packageName}': error while reading '${configFilename}', using default subrepo configuration`,
                );
                return configSubRepo({
                  repoName: basename(dirname(dirname(packagePath))),
                  packageName,
                  description: 'Default subrepo',
                  environment: 'Node',
                  buildMethod: 'Transpile',
                  isPublished: false,
                  hasDocGen: false,
                });
              };
          return configFunc();
        }
      };

  const config = await configFunc();
  // In project.config.ts, paths are posix-Style. Let's convert them to OS style
  const filesToCreate = Object.keys(config).map(normalize);
  console.log(`'${packageName}': Determining potential conflicting files`);

  const configFiles = (
    await Promise.all([
      readdir(packagePath, { withFileTypes: true }),
      ...foldersToInclude.map((folderPath) =>
        readDirEvenIfMissing({ path: join(packagePath, folderPath), recursive: true }),
      ),
    ])
  ).flat();

  const unexpectedConfigFiles = configFiles
    .filter((dirent) => dirent.isFile())
    .map((dirent) => relative(packagePath, join(dirent.parentPath, dirent.name)))
    .filter((path) => !filesToCreate.includes(path) && !patternsToIgnoreRegExp.test(path));

  if (unexpectedConfigFiles.length > 0)
    throw new Error(
      `'${packageName}': Following unexpected files where found in the package:\n`
        + unexpectedConfigFiles.join(',\n'),
    );

  console.log(`'${packageName}': Writing configuration files`);
  for (const [filename, fileContent] of Object.entries(config)) {
    const contentToWriteFunc =
      getExtension(filename) === '.json' ? () => prettyStringify(fileContent)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          throw new Error(
            `'${packageName}': Entry '${filename}' in '${configFilename}' must have value of type string`,
          );
        };

    const contentToWrite = contentToWriteFunc();

    const targetFilename = join(packagePath, filename);
    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    await mkdir(dirname(targetFilename), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    await writeFile(targetFilename, contentToWrite);
  }
};

if (basename(resolve()) === configsPackageName) {
  const topPath = join('..', '..');
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({
    packagePath: topPath,
    repoName: topPackageName,
    packageName: topPackageName,
    level: 'top',
  });
  const topProjectsPath = join(topPath, projectsFolderName);
  const repoNames = (await readdir(topProjectsPath, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const repoApplyConfigPromises = repoNames.map(async (repoName) => {
    const repoPath = join(topProjectsPath, repoName);
    const isMonoRepo = await fileExists(join(repoPath, packagesFolderName));
    /* eslint-disable-next-line functional/no-expression-statements */
    await applyConfig({
      packagePath: repoPath,
      repoName,
      packageName: repoName,
      level:
        repoName === configsPackageName ? 'configsRepo'
        : isMonoRepo ? 'otherMonorepo'
        : 'onePackageRepo',
    });
  });
  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(repoApplyConfigPromises);
  const subRepoApplyConfigPromises = (
    await Promise.all(
      repoNames.map(async (repoName) => {
        const dirents = await readDirEvenIfMissing({
          path: join(topProjectsPath, repoName, packagesFolderName),
          recursive: false,
        });
        return [repoName, dirents] as const;
      }),
    )
  )
    .map(([repoName, subRepoDirents]) => {
      return subRepoDirents
        .filter((subRepoDirent) => subRepoDirent.isDirectory())
        .map((subRepoDirent) => ({
          repoName,
          packageName: subRepoDirent.name,
          packagePath: join(subRepoDirent.parentPath, subRepoDirent.name),
        }));
    })
    .flat()
    .map(({ repoName, packageName, packagePath }) =>
      applyConfig({
        packagePath,
        repoName,
        packageName,
        level: 'subRepo',
      }),
    );
  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(subRepoApplyConfigPromises);
} else throw new Error(`This bin can only be run in '${configsPackageName}' package.`);

console.log('SUCCESS');
