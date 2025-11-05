/**
 * This bin reads the keys and values of a default object exported by the file named
 * project.config.js located in the current path. If no such file exists, it uses 
 * 
 * It creates a file for each key of that object with
 * the key as name. If the key ends with .json, the value is converted from an object to a json
 * string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. This
 * bin will also check that there are no unexpected config files present in the package, i.e config
 * files which are not created by this bin (there are a few exceptions: the `project.config.js` file
 * itself, the `README.md` file... see `patternsToIgnore` below)
 */
// This module must not import any external dependency. It must be runnable without a package.json
import { type Dirent } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import {
  configFilename,
  githubFolderName,
  lintingAndFormattingDependencies,
  pnpmLockFilename,
  readMeFilename,
  viteTimeStampFilenamePattern,
  vscodeWorkspaceFilenamePattern,
} from '../constants.js';
import configOnePackageRepo from '../internal/configOnePackageRepo.js';
import { fromOsPathToPosixPath, getExtension, isRecord, prettyStringify } from '../utils.js';

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

const readMissingDir = (folder:string):Promise<Dirent[]> =>
  new Promise((resolve, reject) => {
    /* eslint-disable-next-line functional/no-expression-statements*/
    readdir(folder, { recursive: true, withFileTypes: true })
      .then(resolve)
      .catch((e:unknown) =>
        typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT' ? resolve([])
        : e instanceof Error ? reject(e)
        : reject(new Error('Unknwon error')),
      );
  });


  const posixPath = path.posix;

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

  /**
   * Dynamic import considers . to be the directory containing the module that calls it, hence
   * __dirname. But project.config.js is in the directory where the command was launched
   */
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const configPath = posixPath.join(
    fromOsPathToPosixPath(path.relative(__dirname, path.resolve())),
    configFilename,
  );
  const packageName = posixPath.basename(posixPath.resolve());

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`Creating default config files for: '${packageName}'`);

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`\tReading '${configPath}'`);

  let config:unknown;

  try{
     config = await import(configPath);
  }
  catch (e:unknown)
  {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ERR_MODULE_NOT_FOUND')
    {
      /* eslint-disable-next-line functional/no-expression-statements*/
      console.log('\tNo such file, using starter config file');
      config = {
        default: configOnePackageRepo({
    description: 'Utility to generate configuration files in a repository',
    dependencies: {
      effect: '^3.18.1',
      '@effect/platform': '^0.92.1',
      '@effect/platform-node': '^0.98.3',
      '@effect/cluster': '^0.50.3',
      '@effect/rpc': '^0.71.0',
      '@effect/sql': '^0.46.0',
      '@effect/workflow': '^0.11.3',
    },
    devDependencies: {
      '@types/eslint': '^9.6.1',
      '@types/eslint-config-prettier': '^6.11.3',
    },
    internalPeerDependencies: {},
    externalPeerDependencies: lintingAndFormattingDependencies,
    examples: [],
    scripts:{},
    environment: 'Node',
    packageType: 'Library',
    visibility: 'Private',
    hasDocGen: false,
    keywords: [],
  })
      }
    }
      
  else
    throw e;
  };

  if (!isRecord(config) || !('default' in config) || !isRecord(config['default']))
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(`Config file '${configPath}' must export a non-null default object`);

  const configDefault = config['default'];

  const filesToCreate = Object.keys(configDefault).map(posixPath.normalize.bind(posixPath));

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tDetermine potential configuration files');

  const files = await Promise.all([
    readdir('.', { withFileTypes: true }),
    ...foldersToInclude.map(readMissingDir),
  ]);

  const unexpectedConfigFiles = files
    .flat()
    .filter((dirent) => dirent.isFile())
    .map((dirent) => posixPath.join(fromOsPathToPosixPath(dirent.parentPath), dirent.name))
    .filter((path) => !filesToCreate.includes(path) && !patternsToIgnoreRegExp.test(path));

  if (unexpectedConfigFiles.length > 0)
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(
      'Following unexpected files where found in the package:\n'
        + unexpectedConfigFiles.join(',\n'),
    );

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tCreating configuration files');
  /* eslint-disable-next-line functional/no-loop-statements*/
  for (const [filename, fileContent] of Object.entries(configDefault)) {
    const contentToWriteFunc =
      getExtension(filename) === '.json' ? () => prettyStringify(fileContent)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          /* eslint-disable-next-line functional/no-throw-statements*/
          throw new Error(`Entry '${filename}' in '${configPath}' must have value of type string`);
        };

    const contentToWrite = contentToWriteFunc();

    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    await mkdir(posixPath.dirname(filename), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    await writeFile(filename, contentToWrite);
  }
