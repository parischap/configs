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

import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
  NodeFileSystem as PlatformNodeFs,
  NodePath as PlatformNodePath,
} from '@effect/platform-node';
import {
  Array,
  Cause,
  Effect,
  Either,
  Equal,
  Exit,
  Function,
  Layer,
  Match,
  Option,
  Predicate,
  Record,
  Struct,
  flow,
  pipe,
} from 'effect';
import { minimatch } from 'minimatch';
import { readdirSync } from 'node:fs';
import * as path from 'node:path/posix';
import * as Json from '../Json.js';
import * as PortError from '../PortError.js';
import * as Prettier from '../Prettier.js';
import {
  configFileName,
  githubFolderName,
  pnpmLockFileName,
  readMeFileName,
  viteTimeStampFileNamePattern,
  vscodeWorkspaceFileNamePattern,
} from '../projectConfig/constants.js';
import * as Types from '../projectConfig/types.js';
import { getExtension } from '../projectConfig/utils.js';

const PlatformNodePathService = PlatformPath.Path;
const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

// List of configuration files for which an error must not be reported if they are present in the package and not overridden by project.config.js
const patternsToIgnore = [
  readMeFileName,
  configFileName,
  viteTimeStampFileNamePattern,
  pnpmLockFileName,
  vscodeWorkspaceFileNamePattern,
];

// List of folders where configuration files might be found
const foldersToInclude = [githubFolderName];
const rootPath = path.resolve();
const configPath = path.join('./', configFileName);

/* eslint-disable-next-line functional/no-expression-statements*/
console.log(`Reading '${configPath}'`);

/* eslint-disable-next-line functional/no-let*/
let config: unknown;

/* eslint-disable-next-line functional/no-try-statements*/
try {
  /* eslint-disable-next-line functional/no-expression-statements*/
  config = await import(configPath);
} catch (e) {
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`Config file '${configPath}' could not be read.`);
  if (e instanceof Error)
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`Error is: ${e.message}`);
  process.exit(1);
}

if (
  !Types.Record.has(config)
  || !Object.prototype.hasOwnProperty.call(config, 'default')
  || !Types.Record.has(config['default'])
) {
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`Config file '${configPath}' must export a non-null default object`);
  process.exit(1);
}

const configDefault = config['default'];
const filesToCreate = Object.keys(configDefault);

/* eslint-disable-next-line functional/no-expression-statements*/
console.log('Determine potential configuration files present in package');
const files = readdirSync(rootPath);

const program = Effect.gen(function* () {
  const path = yield* PlatformNodePathService;
  const fs = yield* PlatformNodeFsService;
  const prettier = yield* Prettier.Service;

  const rootPath = path.resolve();

  const configUrl = yield* pipe(path.join(rootPath, configFileName), path.toFileUrl);

  const configUrlHref = configUrl.href;

  yield* Effect.log(`Reading '${configUrlHref}'`);

  const config = yield* Effect.tryPromise({
    try: () => import(configUrlHref) as Promise<unknown>,
    catch: (error) =>
      PortError.make({
        originalError: error,
        originalFunctionName: 'import',
      }),
  });

  if (
    !Predicate.isRecord(config)
    || !Record.has(config, 'default')
    || !Predicate.isRecord(config['default'])
  ) {
    return yield* Effect.fail(
      new Error(`Config file '${configUrlHref}' must export a non-null default object`),
    );
  }

  const configDefault = config['default'];
  const filesToCreate = Record.keys(configDefault);

  const [rootFolders, rootFiles] = yield* pipe(
    fs.readDirectory(rootPath),
    Effect.flatMap(
      flow(
        Array.filterMap(
          flow(
            Option.liftPredicate(
              (filename) =>
                !Array.some(patternsToIgnore, (pattern) => minimatch(filename, pattern)),
            ),
            Option.map((name) => {
              const fullPath = path.join(rootPath, name);
              return Effect.all({
                name: Effect.succeed(name),
                fullPath: Effect.succeed(fullPath),
                info: fs.stat(fullPath),
              });
            }),
          ),
        ),
        Effect.all,
      ),
    ),
    Effect.map(
      Array.partition(
        Predicate.struct({
          info: flow(Struct.get('type')<PlatformFs.File.Info>, Equal.equals('File')),
        }),
      ),
    ),
  );

  const potentialConfigFiles = yield* pipe(
    rootFolders,
    Array.intersection(foldersToInclude),
    Array.map((folder) =>
      pipe(
        fs.readDirectory(folder.fullPath, { recursive: true }),
        Effect.flatMap(
          flow(
            Array.map((name) => {
              const posixName = utils.fromOsPathToPosixPath(name);
              const fullPath = path.join(folder.fullPath, posixName);
              return Effect.all({
                name: Effect.succeed(path.join(folder.name, posixName)),
                fullPath: Effect.succeed(fullPath),
                info: fs.stat(fullPath),
              });
            }),
            Effect.all,
          ),
        ),
      ),
    ),
    Effect.all,
    Effect.map(
      flow(
        Array.flatten,
        Array.filter(
          Predicate.struct({
            info: flow(Struct.get('type')<PlatformFs.File.Info>, Equal.equals('File')),
          }),
        ),
        Array.appendAll(rootFiles),
        // Paths in project.config.js are always posix style
        Array.map(Struct.get('name')),
      ),
    ),
  );

  yield* Effect.log('Determine potential configuration files present in package');

  const [rootFolders, rootFiles] = yield* pipe(
    fs.readDirectory(rootPath),
    Effect.flatMap(
      flow(
        Array.filterMap(
          flow(
            Option.liftPredicate(
              (filename) =>
                !Array.some(patternsToIgnore, (pattern) => minimatch(filename, pattern)),
            ),
            Option.map((name) => {
              const fullPath = path.join(rootPath, name);
              return Effect.all({
                name: Effect.succeed(name),
                fullPath: Effect.succeed(fullPath),
                info: fs.stat(fullPath),
              });
            }),
          ),
        ),
        Effect.all,
      ),
    ),
    Effect.map(
      Array.partition(
        Predicate.struct({
          info: flow(Struct.get('type')<PlatformFs.File.Info>, Equal.equals('File')),
        }),
      ),
    ),
  );

  const potentialConfigFiles = yield* pipe(
    rootFolders,
    Array.intersection(foldersToInclude),
    Array.map((folder) =>
      pipe(
        fs.readDirectory(folder.fullPath, { recursive: true }),
        Effect.flatMap(
          flow(
            Array.map((name) => {
              const posixName = utils.fromOsPathToPosixPath(name);
              const fullPath = path.join(folder.fullPath, posixName);
              return Effect.all({
                name: Effect.succeed(path.join(folder.name, posixName)),
                fullPath: Effect.succeed(fullPath),
                info: fs.stat(fullPath),
              });
            }),
            Effect.all,
          ),
        ),
      ),
    ),
    Effect.all,
    Effect.map(
      flow(
        Array.flatten,
        Array.filter(
          Predicate.struct({
            info: flow(Struct.get('type')<PlatformFs.File.Info>, Equal.equals('File')),
          }),
        ),
        Array.appendAll(rootFiles),
        // Paths in project.config.js are always posix style
        Array.map(Struct.get('name')),
      ),
    ),
  );

  yield* pipe(
    potentialConfigFiles,
    Array.difference(filesToCreate),
    Either.liftPredicate(Array.isNonEmptyArray, Function.constNull),
    Either.map(
      (unexpected) =>
        'Following unexpected files where found in the package: ' + Array.join(unexpected, ', '),
    ),
    Either.flip,
  );

  return yield* pipe(
    configDefault,
    Record.map((value, key) =>
      pipe(
        Effect.gen(function* () {
          yield* Effect.log(`Handling config ${key}`);

          const extension = getExtension(key);

          const data = yield* pipe(
            extension,
            Match.value,
            Match.when('.json', () => Json.stringify(value)),
            Match.orElse(() =>
              pipe(
                value,
                Option.liftPredicate(Predicate.isString),
                Either.fromOption(
                  () =>
                    new Error(
                      "Property with extension other than '.json' must have value of type string",
                    ),
                ),
              ),
            ),
          );

          // Create directory in case it does not exist
          yield* fs.makeDirectory(path.join(rootPath, path.dirname(key)), { recursive: true });

          const target = path.join(rootPath, key);

          return yield* prettier.save(target, data);
        }),
      ),
    ),
    Effect.all,
  );
});

const result = await Effect.runPromiseExit(
  pipe(program, Effect.provide(live), Effect.provide(Prettier.live)),
);

Exit.match(result, {
  onFailure: (cause) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.error(Cause.pretty(cause));
    process.exit(1);
  },
  onSuccess: () => console.log('Configs installed successfully'),
});
