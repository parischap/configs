#!/usr/bin/env node
/**
 * If no target is passed, builds all ts files except those in the esm/shared directory (these files
 * will be bundled to the other ts files). If a bin directory is present under esm/, it will be
 * built directly under dist and not under dist/esm
 */

import * as constants from '../shared/constants.js';
import * as Json from '../shared/Json.js';
import * as PortError from '../shared/PortError.js';
import * as utils from '../shared/utils.js';

import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
	NodeFileSystem as PlatformNodeFs,
	NodePath as PlatformNodePath
} from '@effect/platform-node';

import {
	Array,
	Cause,
	Config,
	Effect,
	Exit,
	Layer,
	Option,
	pipe,
	Predicate,
	Record,
	String
} from 'effect';
import { dirname } from 'node:path';
import { build } from 'vite';

const PlatformNodePathService = PlatformPath.Path;
const PlatformNodePathLive = PlatformNodePath.layer;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const dependencyKeys = (pkg: Record.ReadonlyRecord<string, unknown>, key: string): Array<string> =>
	pipe(
		pkg,
		Record.get(key),
		Option.filter(Predicate.isRecord),
		Option.map(Object.keys),
		Option.getOrElse(() => Array.empty<string>())
	);

const program = Effect.gen(function* () {
	const path = yield* PlatformNodePathService;
	const fs = yield* PlatformNodeFsService;

	const rootPath = path.resolve();
	const packageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const projectPath = path.join(rootPath, constants.projectFolderName);
	const prodPath = path.join(rootPath, constants.prodFolderName);
	const sharedImportsGlob = constants.allTsFiles.map((p) =>
		path.join(projectPath, constants.sharedFilesFolderName, p)
	);
	const esmOutDir = path.join(constants.prodFolderName, constants.projectFolderName);

	yield* Effect.log('Copying static files');
	const staticFilesPath = path.join(rootPath, constants.staticFolderName);
	const hasStaticFiles = yield* fs.exists(staticFilesPath);
	if (hasStaticFiles) {
		yield* fs.copy(
			staticFilesPath,
			path.join(rootPath, constants.prodFolderName, constants.staticFolderName)
		);
	}

	yield* Effect.log(`Determining dependencies from '${packageJsonPath}'`);

	const packageJsonContents = yield* fs.readFileString(packageJsonPath, 'utf-8');

	const pkg = yield* Json.parse(packageJsonContents);

	if (!Predicate.isRecord(pkg)) {
		return yield* Effect.fail(new Error(`File '${packageJsonPath}' is invalid`));
	}

	const dependencies = dependencyKeys(pkg, 'dependencies');

	const toBeBundled = pipe(sharedImportsGlob, Array.appendAll(dependencies));

	yield* Effect.log('Bundle files');
	const target = yield* pipe(Config.string('TARGET'), Config.withDefault(''));

	const dirContents =
		target === '' ?
			yield* fs.readDirectory(projectPath, { recursive: true })
		:	pipe(target, utils.fromPosixPathToOsPath, Array.of);

	yield* pipe(
		dirContents,
		Array.filter(
			Predicate.every(
				Array.make(
					String.endsWith('.ts'),
					Predicate.not(String.endsWith('.d.ts')),
					Predicate.not(utils.isSubPathOf(constants.sharedFilesFolderName))
				)
			)
		),
		Array.map((fileName) => {
			const source = path.join(projectPath, fileName);
			const target = path.join(esmOutDir, dirname(fileName));

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
									copyPublicDir: false
								},
								clearScreen: false,
								ssr: {
									external: true,
									noExternal: toBeBundled
								}
							}),
						catch: (e) =>
							PortError.make({
								originalError: e,
								originalFunctionName: 'vite build'
							})
					})
				)
			);
		}),
		Effect.allWith({ concurrency: 1 })
	);

	yield* Effect.log(`Moving ${constants.executablesFolderName} files`);
	const srcBinPath = path.join(
		prodPath,
		constants.projectFolderName,
		constants.executablesFolderName
	);
	const binExists = yield* fs.exists(srcBinPath);
	if (binExists) yield* fs.rename(srcBinPath, path.join(prodPath, constants.executablesFolderName));
});

const result = await Effect.runPromiseExit(pipe(program, Effect.provide(live)));
Exit.match(result, {
	onFailure: (cause) => {
		// eslint-disable-next-line functional/no-expression-statements
		console.error(Cause.pretty(cause));
		process.exit(1);
	},
	onSuccess: () => console.log('Successful vite build')
});
