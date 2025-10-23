#!/usr/bin/env node
/**
 * If no target is passed, builds all ts files in the esm directory except those in the
 * `esm/internal/` directory (these files, and all packages included as dependencies (not those
 * included as devDependencies or peerDependencies), will be bundled). If a target is passed with
 * `TARGET=`, it must be expressed relative to the `esm` directory and must use the OS separator. If
 * an `esm/bin/` directory exists, it will be built directly under `dist` and not under `dist/esm`
 */

import * as Json from '../internal/Json.js';
import * as PortError from '../internal/PortError.js';
import {
  allTsFiles,
  binariesFolderName,
  internalFolderName,
  packageJsonFileName,
  prodFolderName,
  projectFolderName,
} from '../internal/projectConfig/constants.js';
import { fromOsPathToPosixPath, isSubPathOf } from '../internal/projectConfig/utils.js';

import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
  NodeFileSystem as PlatformNodeFs,
  NodePath as PlatformNodePath,
} from '@effect/platform-node';

import {
  Array,
  Cause,
  Config,
  Effect,
  Exit,
  flow,
  Layer,
  Option,
  pipe,
  Predicate,
  Record,
  String,
} from 'effect';
import { build } from 'vite';

const PlatformNodePathService = PlatformPath.Path;
const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const dependencyKeys = (pkg: Record.ReadonlyRecord<string, unknown>, key: string): Array<string> =>
  pipe(
    pkg,
    Record.get(key),
    Option.filter(Predicate.isRecord),
    Option.map(Object.keys),
    Option.getOrElse(() => Array.empty<string>()),
  );

const program = Effect.gen(function* () {
  const path = yield* PlatformNodePathService;
  const fs = yield* PlatformNodeFsService;

  const rootPath = path.resolve();
  const packageJsonPath = path.join(rootPath, packageJsonFileName);
  const projectPath = path.join(rootPath, projectFolderName);
  const prodPath = path.join(rootPath, prodFolderName);
  const internalImportsGlob = allTsFiles.map((p) => path.join(projectPath, internalFolderName, p));
  const esmOutDir = path.join(prodFolderName, projectFolderName);

  /* yield* Effect.log('Copying static files');
  const staticFilesPath = path.join(rootPath, constants.staticFolderName);
  const hasStaticFiles = yield* fs.exists(staticFilesPath);
  if (hasStaticFiles) {
    yield* fs.copy(
      staticFilesPath,
      path.join(rootPath, constants.prodFolderName, constants.staticFolderName),
    );
  }*/

  yield* Effect.log(`Determining dependencies from '${packageJsonPath}'`);

  const packageJsonContents = yield* fs.readFileString(packageJsonPath, 'utf-8');

  const pkg = yield* Json.parse(packageJsonContents);

  if (!Predicate.isRecord(pkg)) {
    return yield* Effect.fail(new Error(`File '${packageJsonPath}' is invalid`));
  }

  const dependencies = dependencyKeys(pkg, 'dependencies');

  const toBeBundled = pipe(internalImportsGlob, Array.appendAll(dependencies));

  yield* Effect.log('Bundle files');
  const target = yield* pipe(Config.string('TARGET'), Config.withDefault(''));

  const dirContents =
    target === '' ? yield* fs.readDirectory(projectPath, { recursive: true }) : Array.of(target);

  yield* pipe(
    dirContents,
    Array.filterMap(
      flow(
        fromOsPathToPosixPath,
        Option.liftPredicate(
          Predicate.and(String.endsWith('.ts'), Predicate.not(isSubPathOf(internalFolderName))),
        ),
      ),
    ),
    Array.map((fileName) => {
      const source = path.join(projectPath, fileName);
      const target = path.join(esmOutDir, path.dirname(fileName));

      return pipe(
        Effect.log(`Bundling '${source}' to '${target}'`),
        Effect.zip(
          Effect.tryPromise({
            try: () =>
              // All settings here are merged with other settings passed in vite.config.ts when there is one
              build({
                root: rootPath,
                build: {
                  ssr: source,
                  outDir: target,
                  sourcemap: true,
                  target: 'es2022',
                  minify: 'esbuild',
                  emptyOutDir: false,
                  copyPublicDir: false,
                },
                clearScreen: false,
                ssr: {
                  external: true,
                  noExternal: toBeBundled,
                },
              }),
            catch: (e) =>
              PortError.make({
                originalError: e,
                originalFunctionName: 'vite build',
              }),
          }),
        ),
      );
    }),
    Effect.allWith({ concurrency: 1 }),
  );

  yield* Effect.log(`Moving ${binariesFolderName} files`);
  const srcBinPath = path.join(prodPath, projectFolderName, binariesFolderName);
  const binExists = yield* fs.exists(srcBinPath);
  if (binExists) yield* fs.rename(srcBinPath, path.join(prodPath, binariesFolderName));
});

const result = await Effect.runPromiseExit(pipe(program, Effect.provide(live)));
Exit.match(result, {
  onFailure: (cause) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.error(Cause.pretty(cause));
    process.exit(1);
  },
  onSuccess: () => console.log('Successful vite build'),
});
