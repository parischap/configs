/**
 * This bin reads the keys and values of a default object exported by the file named
 * project.config.js located in the current path. If no such file exists, it uses
 *
 * It creates a file for each key of that object with the key as name. If the key ends with .json,
 * the value is converted from an object to a json string with JSON.stringfy. Otherwise, the value
 * must be a string and it is written as is. This bin will also check that there are no unexpected
 * config files present in the package, i.e config files which are not created by this bin (there
 * are a few exceptions: the `project.config.js` file itself, the `README.md` file... see
 * `patternsToIgnore` below)
 */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Dirent } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, relative, resolve } from 'node:path/posix';
import {
  configFilename,
  configsPackageName,
  effectPlatformDependencies,
  githubFolderName,
  lintingAndFormattingDependencies,
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
import {
  deepMerge,
  fromOsPathToPosixPath,
  getExtension,
  isRecord,
  packageNameFromCWD,
  prettyStringify,
} from '../utils.js';

const posixDirname = fromOsPathToPosixPath(import.meta.dirname);

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
const foldersToInclude = [githubFolderName];

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
  folder,
  recursive,
}: {
  readonly folder: string;
  readonly recursive: boolean;
}): Promise<Dirent[]> => {
  /* eslint-disable-next-line functional/no-try-statements*/
  try {
    return await readdir(folder, { recursive, withFileTypes: true });
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') return [];
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw e;
  }
};

const fileExists = async (path: string): Promise<boolean> => {
  /* eslint-disable-next-line functional/no-try-statements*/
  try {
    /* eslint-disable-next-line functional/no-expression-statements*/
    await stat(path);
    return true;
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') return false;
    /* eslint-disable-next-line functional/no-throw-statements*/
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
  const targetPath = join(packagePath, packageName);
  const configPath = join(targetPath, configFilename);

  if (level === 'top' || level === 'configsRepo') {
    const hasConfigFile = await fileExists(configPath);
    if (hasConfigFile)
      /* eslint-disable-next-line functional/no-throw-statements*/
      throw new Error(`'${packageName}': no '${configFilename}' file allowed`);
  }

  const configFunc =
    level === 'top' ?
      async () => {
        console.log(`'${packageName}': using default top configuration`);
        return configTop({
          description: 'Top repo of my developments',
        });
      }
    : level === 'configsRepo' ?
      async () => {
        console.log(`'${packageName}': using default configs configuration`);
        return deepMerge(
          configOnePackageRepo({
            description: 'Utility to generate configuration files in a repository',
            dependencies: {
              ...effectPlatformDependencies,
            },
            devDependencies: {
              '@types/eslint': '^9.6.1',
              '@types/eslint-config-prettier': '^6.11.3',
            },
            externalPeerDependencies: lintingAndFormattingDependencies,
            environment: 'Node',
            packageType: 'Library',
            isPublished: false,
            hasDocGen: false,
          }),
          {
            [packageJsonFilename]: {
              // eslint and prettier need to import file with ts extension.Won't work with .js
              exports: {
                './prettierConfig': {
                  import: `./${projectFolderName}/prettierConfig.ts`,
                },
                './eslintConfigNode': {
                  import: `./${projectFolderName}/eslintConfigNode.ts`,
                },
                './eslintConfigBrowser': {
                  import: `./${projectFolderName}/eslintConfigBrowser.ts`,
                },
                './eslintConfigLibrary': {
                  import: `./${projectFolderName}/eslintConfigLibrary.ts`,
                },
              },
            },
          },
        );
      }
    : async () => {
        try {
          // if passed a relative path, import uses current module path as reference path
          const contents = await import(relative(posixDirname, configPath));
          if (!isRecord(contents) || !('default' in contents) || !isRecord(contents['default']))
            /* eslint-disable-next-line functional/no-throw-statements*/
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
                return configMonoRepo({ description: 'Default monorepo' });
              }
            : level === 'onePackageRepo' ?
              () => {
                console.log(
                  `'${packageName}': error while reading '${configFilename}', using default one-package repo configuration`,
                );
                return configOnePackageRepo({
                  description: 'Utility to generate configuration files in a repository',
                  environment: 'Node',
                  packageType: 'Library',
                  isPublished: false,
                  hasDocGen: false,
                });
              }
            : () => {
                console.log(
                  `'${packageName}': error while reading '${configFilename}', using default subrepo configuration`,
                );
                return configSubRepo({
                  description: 'Default subrepo',
                  environment: 'Node',
                  packageType: 'Library',
                  isPublished: false,
                  hasDocGen: false,
                });
              };
          return configFunc();
        }
      };

  const config = await configFunc();
  const filesToCreate = Object.keys(config).map(normalize);
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`'${packageName}': Determining potential conflicting files`);

  const files = await Promise.all([
    readdir(targetPath, { withFileTypes: true }),
    ...foldersToInclude.map((f) =>
      readDirEvenIfMissing({ folder: join(targetPath, f), recursive: true }),
    ),
  ]);

  const unexpectedConfigFiles = files
    .flat()
    .filter((dirent) => dirent.isFile())
    .map((dirent) =>
      relative(targetPath, join(fromOsPathToPosixPath(dirent.parentPath), dirent.name)),
    )
    .filter((path) => !filesToCreate.includes(path) && !patternsToIgnoreRegExp.test(path));

  if (unexpectedConfigFiles.length > 0)
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(
      `'${packageName}': Following unexpected files where found in the package:\n`
        + unexpectedConfigFiles.join(',\n'),
    );

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`'${packageName}': Writing configuration files`);
  /* eslint-disable-next-line functional/no-loop-statements*/
  for (const [filename, fileContent] of Object.entries(config)) {
    const contentToWriteFunc =
      getExtension(filename) === '.json' ? () => prettyStringify(fileContent)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          /* eslint-disable-next-line functional/no-throw-statements*/
          throw new Error(
            `'${packageName}': Entry '${filename}' in '${configFilename}' must have value of type string`,
          );
        };

    const contentToWrite = contentToWriteFunc();

    const targetFilename = join(targetPath, filename);
    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    await mkdir(dirname(targetFilename), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    await writeFile(targetFilename, contentToWrite);
  }
};

const packageName = packageNameFromCWD();
const isConfigsPackage = packageName === configsPackageName;
if (isConfigsPackage) {
  const topPath = '../../..';
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({ packagePath: topPath, packageName: topPackageName, level: 'top' });
  const topPackagesPath = join(topPath, topPackageName, packagesFolderName);
  const repoNames = (await readdir(topPackagesPath, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory)
    .map((dirent) => dirent.name);
  const repoApplyConfigPromises = repoNames.map(async (repoName) => {
    const isMonoRepo = await fileExists(join(topPackagesPath, repoName, packagesFolderName));
    return await applyConfig({
      packagePath: topPackagesPath,
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
          folder: join(topPackagesPath, repoName, packagesFolderName),
          recursive: false,
        }),
      ),
    )
  )
    .flat()
    .filter((dirent) => dirent.isDirectory)
    .map((subRepoDirent) =>
      applyConfig({
        packagePath: subRepoDirent.parentPath,
        packageName: subRepoDirent.name,
        level: 'subRepo',
      }),
    );
  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(subRepoApplyConfigPromises);
} else
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({
    packagePath: resolve(),
    packageName,
    level:
      isConfigsPackage ? 'configsRepo'
      : packageName === topPackageName ? 'top'
      : 'unknown',
  });

/* eslint-disable-next-line functional/no-expression-statements*/
console.log('SUCCESS');
