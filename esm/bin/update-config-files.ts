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
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import {
  configFilename,
  configsPackageName,
  effectPlatformDependencies,
  githubFolderName,
  lintingAndFormattingDependencies,
  packageJsonFilename,
  pnpmLockFilename,
  projectFolderName,
  readMeFilename,
  topPackageName,
  viteTimeStampFilenamePattern,
  vscodeWorkspaceFilenamePattern,
} from '../constants.js';
import configOnePackageRepo from '../internal/configOnePackageRepo.js';
import configTop from '../internal/configTop.js';
import { ReadonlyRecord } from '../types.js';
import {
  deepMerge,
  fromOsPathToPosixPath,
  getExtension,
  isRecord,
  packageNameFromCWD,
  prettyStringify,
} from '../utils.js';

const posixPath = path.posix;
const normalize = posixPath.normalize.bind(posixPath);

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageName = packageNameFromCWD();

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

const readMissingDir = async (folder: string): Promise<Dirent[]> => {
  /* eslint-disable-next-line functional/no-try-statements*/
  try {
    return await readdir(folder, { recursive: true, withFileTypes: true });
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

const applyConfig = async (config: ReadonlyRecord, targetPath: string) => {
  const filesToCreate = Object.keys(config).map(normalize);
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tDetermining potential conflicting files');

  const files = await Promise.all([
    readdir(targetPath, { withFileTypes: true }),
    ...foldersToInclude.map((f) => readMissingDir(posixPath.join(targetPath, f))),
  ]);

  const unexpectedConfigFiles = files
    .flat()
    .filter((dirent) => dirent.isFile())
    .map((dirent) =>
      posixPath.relative(
        targetPath,
        posixPath.join(fromOsPathToPosixPath(dirent.parentPath), dirent.name),
      ),
    )
    .filter((path) => !filesToCreate.includes(path) && !patternsToIgnoreRegExp.test(path));

  if (unexpectedConfigFiles.length > 0)
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(
      'Following unexpected files where found in the package:\n'
        + unexpectedConfigFiles.join(',\n'),
    );

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tWriting configuration files');
  /* eslint-disable-next-line functional/no-loop-statements*/
  for (const [filename, fileContent] of Object.entries(config)) {
    const contentToWriteFunc =
      getExtension(filename) === '.json' ? () => prettyStringify(fileContent)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          /* eslint-disable-next-line functional/no-throw-statements*/
          throw new Error(
            `Entry '${filename}' in '${configFilename}' must have value of type string`,
          );
        };

    const contentToWrite = contentToWriteFunc();

    const targetFilename = posixPath.join(targetPath, filename);
    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    await mkdir(posixPath.dirname(targetFilename), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    await writeFile(targetFilename, contentToWrite);
  }
};

/* eslint-disable-next-line functional/no-expression-statements*/
console.log(`Creating default config files for: '${packageName}'`);

const isConfigPackage = packageName === configsPackageName;
const isTopPackage = packageName === topPackageName;

if (isConfigPackage || isTopPackage) {
  const hasConfig = await fileExists(configFilename);
  if (hasConfig)
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(`Package '${configsPackageName}' must not contain a file '${configFilename}'`);
}

const topConfigFunc = () =>
  configTop({
    description: 'Top repo of my developments',
  });

if (isConfigPackage || isTopPackage)
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tUsing default configuration');
else
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`\tReading '${configFilename}'`);

const configFunc =
  isConfigPackage ?
    () =>
      Promise.resolve(
        deepMerge(
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
        ),
      )
  : isTopPackage ? () => Promise.resolve(topConfigFunc())
  : async () => {
      const contents: unknown = await import(
        posixPath.join(
          fromOsPathToPosixPath(path.relative(__dirname, path.resolve())),
          configFilename,
        )
      );

      if (!isRecord(contents) || !('default' in contents) || !isRecord(contents['default']))
        /* eslint-disable-next-line functional/no-throw-statements*/
        throw new Error(`Config file '${configFilename}' must export a non-null default object`);

      return contents['default'];
    };
const config = await configFunc();
/* eslint-disable-next-line functional/no-expression-statements*/
await applyConfig(config, '.');

if (isConfigPackage) {
  const hasTopPackageJson = await fileExists(`../../${packageJsonFilename}`);
  if (!hasTopPackageJson) {
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`Creating default config files for: '${topPackageName}'`);
    /* eslint-disable-next-line functional/no-expression-statements*/
    await applyConfig(topConfigFunc(), '../..');
  }
}

/* eslint-disable-next-line functional/no-expression-statements*/
console.log('SUCCESS');
