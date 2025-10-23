#!/usr/bin/env node
/**
 * This bin reads the keys and values of a default object exported by the file named
 * project.config.js located in the current path. It creates a file for each key of that object with
 * the key as name. If the key ends with .json, the value is converted from an object to a json
 * string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. This
 * bin will also check that there are no unexpected config files present in the package, i.e config
 * files which are not created by this bin (there are a few exceptions: the `project.config.js` file
 * itself, the `README.md` file... see `patternsToIgnore` below)
 */
// This file must not import anything external
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import {
  configFileName,
  githubFolderName,
  pnpmLockFileName,
  readMeFileName,
  viteTimeStampFileNamePattern,
  vscodeWorkspaceFileNamePattern,
} from '../projectConfig/constants.js';
import { fromOsPathToPosixPath, getExtension, isRecord } from '../projectConfig/utils.js';

/* eslint-disable-next-line functional/no-try-statements*/
try {
  const posixPath = path.posix;

  // List of configuration files for which an error must not be reported if they are present in the package and not overridden by project.config.js
  const patternsToIgnore = [
    readMeFileName,
    configFileName,
    viteTimeStampFileNamePattern,
    pnpmLockFileName,
    vscodeWorkspaceFileNamePattern,
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
    configFileName,
  );
  const packageName = posixPath.basename(posixPath.resolve());

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`Handling '${packageName}'`);

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`\tReading '${configPath}'`);

  /**
   * @type {unknown}
   */
  const config = await import(configPath);

  if (!isRecord(config) || !('default' in config) || !isRecord(config['default']))
    /* eslint-disable-next-line functional/no-throw-statements*/
    throw new Error(`Config file '${configPath}' must export a non-null default object`);

  const configDefault = config['default'];
  const filesToCreate = Object.keys(configDefault).map(posixPath.normalize.bind(posixPath));

  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log('\tDetermine potential configuration files');

  const unexpectedConfigFiles = [
    ...readdirSync('.', { withFileTypes: true }),
    ...foldersToInclude
      .map((folder) =>
        existsSync(folder) ? readdirSync(folder, { recursive: true, withFileTypes: true }) : [],
      )
      .flat(),
  ]
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
  for (const [fileName, fileContent] of Object.entries(configDefault)) {
    const contentToWriteFunc =
      getExtension(fileName) === '.json' ? () => JSON.stringify(fileContent, null, 2)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          /* eslint-disable-next-line functional/no-throw-statements*/
          throw new Error(`Entry '${fileName}' in '${configPath}' must have value of type string`);
        };

    const contentToWrite = contentToWriteFunc();

    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    mkdirSync(posixPath.dirname(fileName), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    writeFileSync(fileName, contentToWrite);
  }
} catch (e) {
  if (e instanceof Error)
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`\tError thrown with message: '${e.message}'`);
  process.exit(1);
}
/* eslint-disable-next-line functional/no-expression-statements*/
console.log('\tSUCCESS');
