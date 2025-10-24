#!/usr/bin/env node
/** Creates a starter `package.json` and `project.config.ts` file for a one-package repo. */
import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
  NodeFileSystem as PlatformNodeFs,
  NodePath as PlatformNodePath,
} from '@effect/platform-node';
import { Cause, Effect, Exit, Layer, pipe } from 'effect';
import * as Json from '../internal/Json.js';
import configOnePackageRepo from '../internal/projectConfig/configOnePackageRepo.js';
import { configFileName, packageJsonFileName } from '../internal/projectConfig/constants.js';
import { Environment, Visibility } from '../internal/projectConfig/types.js';

const PlatformNodePathService = PlatformPath.Path;

const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const program = Effect.gen(function* () {
  const path = yield* PlatformNodePathService;
  const fs = yield* PlatformNodeFsService;

  const rootPath = path.resolve();

  yield* Effect.log(`Writing ${packageJsonFileName} to '${rootPath}'`);
  const targetPackageJsonPath = path.join(rootPath, packageJsonFileName);
  const params = {
    description: 'Your description',
    dependencies: {},
    devDependencies: {},
    internalPeerDependencies: {},
    externalPeerDependencies: {},
    examples: [],
    scripts: {},
    environment: Environment.Node,
    bundled: true,
    visibility: Visibility.Private,
    hasStaticFolder: false,
    hasDocGen: false,
    keywords: [],
  };
  const stringifiedtargetPackageJson = yield* Json.stringify(
    configOnePackageRepo(params)[packageJsonFileName]
  );
  yield* fs.writeFileString(targetPackageJsonPath, stringifiedtargetPackageJson);

  yield* Effect.log(`Writing ${configFileName} to '${rootPath}'`);
  const targetConfigFilePath = path.join(rootPath, configFileName);
  return yield* fs.writeFileString(
    targetConfigFilePath,
    `import * as Configs from '@parischap/configs';

export default Configs.configOnePackageRepo(${JSON.stringify(params)});`,
  );
});

const result = await Effect.runPromiseExit(
  Effect.provide(program, live),
);
Exit.match(result, {
  onFailure: (cause) => {
    // eslint-disable-next-line functional/no-expression-statements
    console.error(Cause.pretty(cause));
    process.exit(1);
  },
  onSuccess: () => console.log(`${packageJsonFileName} prodified successfully`),
});
