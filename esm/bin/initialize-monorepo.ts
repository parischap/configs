#!/usr/bin/env node
/** Creates a starter `package.json` and `project.config.ts` file for a monorepo. */
import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
	NodeFileSystem as PlatformNodeFs,
	NodePath as PlatformNodePath
} from '@effect/platform-node';
import { Cause, Effect, Exit, Layer, pipe } from 'effect';
import * as Json from '../shared/Json.js';
import * as Prettier from '../shared/Prettier.js';
import configMonorepo from '../shared/configMonorepo.js';
import * as constants from '../shared/constants.js';

const PlatformNodePathService = PlatformPath.Path;

const PlatformNodePathLive = PlatformNodePath.layer;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const program = Effect.gen(function* () {
	const path = yield* PlatformNodePathService;
	const fs = yield* PlatformNodeFsService;
	const prettier = yield* Prettier.Service;

	const rootPath = path.resolve();

	yield* Effect.log(`Writing ${constants.packageJsonFileName} to '${rootPath}'`);
	const targetPackageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const stringifiedtargetPackageJson = yield* Json.stringify(
		configMonorepo[constants.packageJsonFileName]
	);
	yield* prettier.save(targetPackageJsonPath, stringifiedtargetPackageJson);

	yield* Effect.log(`Writing ${constants.configFileName} to '${rootPath}'`);
	const targetConfigFilePath = path.join(rootPath, constants.configFileName);
	return yield* fs.writeFileString(
		targetConfigFilePath,
		`import * as Configs from '@parischap/configs';

export default Configs.configMonorepo;`
	);
});

const result = await Effect.runPromiseExit(
	pipe(program, Effect.provide(live), Effect.provide(Prettier.live))
);
Exit.match(result, {
	onFailure: (cause) => {
		// eslint-disable-next-line functional/no-expression-statements
		console.error(Cause.pretty(cause));
		process.exit(1);
	},
	onSuccess: () => console.log(`${constants.packageJsonFileName} prodified successfully`)
});
