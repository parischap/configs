#!/usr/bin/env node
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
	Either,
	Exit,
	Function,
	Layer,
	Option,
	Predicate,
	Record,
	String,
	Tuple,
	pipe
} from 'effect';
import * as Json from '../shared/Json.js';
import * as Prettier from '../shared/Prettier.js';
import * as constants from '../shared/constants.js';
import licenseTemplate from '../shared/license.template.js';
import * as utils from '../shared/utils.js';

const PlatformNodePathService = PlatformPath.Path;

const PlatformNodePathLive = PlatformNodePath.layer;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const packageJsonKeysToKeepInProd = Array.make(
	'name',
	'version',
	'description',
	'author',
	'license',
	'sideEffects',
	'repository',
	'bugs',
	'homepage',
	'main',
	'module',
	'types',
	'exports',
	'imports',
	'dependencies',
	'peerDependencies',
	'bin',
	'files',
	'funding',
	'keywords'
);

const program = Effect.gen(function* () {
	const path = yield* PlatformNodePathService;
	const fs = yield* PlatformNodeFsService;
	const prettier = yield* Prettier.Service;

	const rootPath = path.resolve();

	const srcPackageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const prodPath = path.join(rootPath, constants.prodFolderName);

	const prodPackageJsonPath = path.join(prodPath, constants.packageJsonFileName);

	const prodProjectPackageJsonPath = path.join(
		prodPath,
		constants.projectFolderName,
		constants.packageJsonFileName
	);

	const binPath = path.join(prodPath, constants.executablesFolderName);

	const isLibrary = yield* pipe(Config.boolean('IS_LIBRARY'), Config.withDefault(false));

	yield* Effect.log(`Copying ${constants.readMeFileName} to '${prodPath}'`);
	const readMePath = path.join(rootPath, constants.readMeFileName);
	const hasReadMe = yield* fs.exists(readMePath);
	if (hasReadMe) yield* fs.copyFile(readMePath, path.join(prodPath, constants.readMeFileName));

	/*yield* Effect.log(
		`Copying contents of ${constants.docsFolderName}/${constants.docsAssetsFolderName} to '${prodPath}'`
	);
	const docsAssetsPath = path.join(
		rootPath,
		constants.docsFolderName,
		constants.docsAssetsFolderName
	);
	const hasDocsAssets = yield* fs.exists(docsAssetsPath);
	if (hasDocsAssets) {
		const prodDocsPath = path.join(
			prodPath,
			constants.docsFolderName,
			constants.docsAssetsFolderName
		);
		yield* fs.makeDirectory(prodDocsPath, { recursive: true });
		yield* fs.copy(docsAssetsPath, prodDocsPath);
	}*/

	yield* Effect.log(`Writing ${constants.licenseFileName} to '${prodPath}'`);
	yield* fs.writeFileString(path.join(prodPath, constants.licenseFileName), licenseTemplate);

	yield* Effect.log('Determining list of bin files');
	const binContents = yield* pipe(
		fs.readDirectory(binPath),
		Effect.catchTag('SystemError', (error) =>
			error.reason === 'NotFound' ? Effect.succeed(Array.empty<string>()) : Effect.fail(error)
		)
	);
	const binFiles = pipe(
		binContents,
		Array.filter(String.endsWith('.js')),
		Array.map(String.slice(0, -3)),
		Record.fromIterableWith((fileName) =>
			Tuple.make(
				fileName,
				pipe(
					path.join(constants.executablesFolderName, fileName + '.js'),
					utils.fromOsPathToPosixPath
				)
			)
		)
	);

	yield* Effect.log(`Reading '${srcPackageJsonPath}'`);

	const pkgContents = yield* fs.readFileString(srcPackageJsonPath, 'utf-8');

	const pkg = yield* Json.parse(pkgContents);

	if (!Predicate.isRecord(pkg)) {
		return yield* Effect.fail(new Error(`File '${constants.packageJsonFileName}' is invalid`));
	}

	const publishConfig = pipe(
		pkg,
		Record.get('publishConfig'),
		Option.filter(Predicate.isRecord),
		Option.getOrElse(() => Record.empty<string | symbol, unknown>())
	);

	const packageName = yield* pipe(
		pkg,
		Record.get('name'),
		Option.filter(Predicate.isString),
		Option.filter(String.startsWith(constants.devScope + '/')),
		Option.map(String.substring(constants.devScope.length + 1)),
		Either.fromOption(
			() =>
				new Error(
					`Field 'name' of ${srcPackageJsonPath} must be a string starting with '${constants.devScope}/'`
				)
		)
	);

	const prodPackageName = constants.scope + '/' + packageName;
	const dependencies = pipe(
		pkg,
		Record.get('dependencies'),
		Option.filter(Predicate.isRecord),
		Option.getOrElse(() => Record.empty<string, unknown>())
	);

	// It does not really make sense to override dependencies in publishConfig...
	const publishConfigDependencies = pipe(
		publishConfig,
		Record.get('dependencies'),
		Option.filter(Predicate.isRecord),
		Option.getOrElse(() => Record.empty<string, unknown>())
	);

	const peerDependencies = pipe(
		pkg,
		Record.get('peerDependencies'),
		Option.filter(Predicate.isRecord),
		Option.getOrElse(() => Record.empty<string, unknown>())
	);

	const publishConfigPeerDependencies = pipe(
		publishConfig,
		Record.get('peerDependencies'),
		Option.filter(Predicate.isRecord),
		Option.getOrElse(() => Record.empty<string, unknown>())
	);

	const prodPackageJson = yield* pipe(
		{
			...pkg,
			...publishConfig,
			dependencies:
				isLibrary ? { ...dependencies, ...publishConfigDependencies } : publishConfigDependencies,
			peerDependencies: {
				...peerDependencies,
				...publishConfigPeerDependencies
			}
		},
		Record.set('name', prodPackageName),
		Record.isEmptyRecord(binFiles) ? Function.identity : Record.set('bin', binFiles),
		Record.filter((_, key) => Array.contains(packageJsonKeysToKeepInProd, key)),
		Record.filter((v) => !Predicate.isRecord(v) || !Record.isEmptyRecord(v)),
		// Add type field for configs package because devDependencies inherited from package.top.ts are not bundled and have to be imported
		packageName === 'configs' ? Record.set('type', 'module') : Function.identity,
		Json.stringify
	);

	yield* Effect.log(`Writing '${prodPackageJsonPath}'`);
	//yield* fs.makeDirectory(prodPath, { recursive: true });
	yield* prettier.save(prodPackageJsonPath, prodPackageJson);

	yield* Effect.log(`Writing '${prodProjectPackageJsonPath}'`);
	const prodProjectPackageJson = yield* Json.stringify({
		type: 'module',
		sideEffects: []
	});
	return yield* prettier.save(prodProjectPackageJsonPath, prodProjectPackageJson);
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
