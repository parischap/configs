/**
 * This bin reads the keys and values of a default object exported by the file named
 * `project.config.ts` located in the current path. It creates a file for each key of that object
 * with the key as name. If the key ends with .json, the value is converted from an object to a json
 * string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. This
 * bin will also check that there are no unexpected config files present in the package, i.e config
 * files which are not created by this bin (there are a few exceptions: the `project.config.js` file
 * itself, the `README.md` file... see `patternsToIgnore` below).
 *
 * There is two exceptions:
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
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, normalize, relative, resolve } from 'node:path';
import {
  configFilename,
  configsPackageName,
  configsPackagePeerDependencies,
  docsFolderName,
  githubFolderName,
  packageJsonFilename,
  packagesFolderName,
  pnpmLockFilename,
  projectFolderName,
  readMeFilename,
  topPackageName,
  viteTimeStampFilenamePattern,
  vscodeWorkspaceFilenamePattern,
} from '../constants.js';
import configMonoRepo from '../internal/configMonoRepo.js';
import configOnePackageRepo from '../internal/configOnePackageRepo.js';
import configSubRepo from '../internal/configSubRepo.js';
import configTop from '../internal/configTop.js';
import { isRecord } from '../types.js';
import { deepMerge, getExtension, prettyStringify } from '../utils.js';

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
  packageName,
  level,
}: {
  readonly packagePath: string;
  readonly packageName: string;
  readonly level:
    | 'top'
    | 'configsRepo'
    | 'otherMonorepo'
    | 'onePackageRepo'
    | 'subRepo'
    | 'unknown';
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
          deepMerge(
            configOnePackageRepo({
              packageName,
              description: 'Utility to generate configuration files in a repository',
              devDependencies: {
                '@types/eslint': '^9.6.1',
                '@types/eslint-config-prettier': '^6.11.3',
              },
              peerDependencies: configsPackagePeerDependencies,
              environment: 'Node',
              buildMethod: 'None',
              isPublished: false,
              hasDocGen: false,
            }),
            {
              [packageJsonFilename]: {
                // eslint and prettier need to import file with ts extension.Won't work with .js
                exports: {
                  './prettierConfig': {
                    // Do not import .js because prettier uses node --experimental-transform-types
                    import: `./${projectFolderName}/prettierConfig.ts`,
                  },
                  './eslintConfigNode': {
                    // Do not import .js because eslint uses jiti
                    import: `./${projectFolderName}/eslintConfigNode.ts`,
                  },
                  './eslintConfigBrowser': {
                    // Do not import .js because eslint uses jiti
                    import: `./${projectFolderName}/eslintConfigBrowser.ts`,
                  },
                  './eslintConfigLibrary': {
                    // Do not import .js because eslint uses jiti
                    import: `./${projectFolderName}/eslintConfigLibrary.ts`,
                  },
                },
              },
            },
          ),
        );
      }
    : async () => {
        try {
          console.log(`'${packageName}': reading '${configFilename}'`);
          const contents: unknown = await import(resolve(configPath));
          if (!isRecord(contents) || !('default' in contents) || !isRecord(contents['default']))
            throw new Error(
              `'${packageName}': '${configFilename}' must export a non-null default object`,
            );
          return contents['default'];
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

const packageName = basename(resolve());
const isConfigsPackage = packageName === configsPackageName;
if (isConfigsPackage) {
  const topPath = join('..', '..');
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({ packagePath: topPath, packageName: topPackageName, level: 'top' });
  const topPackagesPath = join(topPath, packagesFolderName);
  const repoNames = (await readdir(topPackagesPath, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const repoApplyConfigPromises = repoNames.map(async (repoName) => {
    const repoPath = join(topPackagesPath, repoName);
    const isMonoRepo = await fileExists(join(repoPath, packagesFolderName));
    /* eslint-disable-next-line functional/no-expression-statements */
    await applyConfig({
      packagePath: repoPath,
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
      repoNames.map((repoName) =>
        readDirEvenIfMissing({
          path: join(topPackagesPath, repoName, packagesFolderName),
          recursive: false,
        }),
      ),
    )
  )
    .flat()
    .filter((subRepoDirent) => subRepoDirent.isDirectory())
    .map((subRepoDirent) =>
      applyConfig({
        packagePath: join(subRepoDirent.parentPath, subRepoDirent.name),
        packageName: subRepoDirent.name,
        level: 'subRepo',
      }),
    );
  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(subRepoApplyConfigPromises);
} else
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({
    packagePath: '.',
    packageName,
    level: packageName === topPackageName ? 'top' : 'unknown',
  });

console.log('SUCCESS');
