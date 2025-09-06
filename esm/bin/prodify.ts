#!/usr/bin/env node
/**
 * Copies `esm/README.md` if there is one to `dist` Generates the `LICENSE` file directly under
 * `dist`. Copies `esm/package.json` to `dist` but spreads the `publishConfig` key so that any key
 * present in `publishConfig` will override the key with the same name. Also adds a `bin` key with
 * all the bin executables present under `esm/bin/` and removes keys with empty objects, empty
 * arrays or empty strings as value. Result is prettified using prettier. Creates a `package.json`
 * file under `dist/esm/`. It is not necessary to create one under `dist/cjs/` for transpiled
 * packages as `type: 'commonjs'` is the default.
 */
import { FileSystem as PlatformFs, Path as PlatformPath } from '@effect/platform';
import {
	NodeFileSystem as PlatformNodeFs,
	NodePath as PlatformNodePath
} from '@effect/platform-node';
import {
	Array,
	Cause,
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
import * as Json from '../internal/Json.js';
import * as Prettier from '../internal/Prettier.js';
import * as constants from '../internal/constants.js';
import licenseTemplate from '../internal/licenseTemplate.js';
import * as utils from '../internal/utils.js';

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

	const srcPackageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const prodPath = path.join(rootPath, constants.prodFolderName);

	const prodPackageJsonPath = path.join(prodPath, constants.packageJsonFileName);

	const prodProjectPackageJsonPath = path.join(
		prodPath,
		constants.projectFolderName,
		constants.packageJsonFileName
	);

	const binPath = path.join(prodPath, constants.executablesFolderName);

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
		Option.filter(String.startsWith(constants.slashedDevScope)),
		Option.map(String.substring(constants.slashedDevScope.length)),
		Either.fromOption(
			() =>
				new Error(
					`Field 'name' of ${srcPackageJsonPath} must be a string starting with '${constants.slashedDevScope}'`
				)
		)
	);

	const prodPackageName = constants.slashedScope + packageName;

	const prodPackageJson = pipe(
		{
			...pkg,
			...publishConfig
		},
		Record.set('name', prodPackageName),
		Record.isEmptyRecord(binFiles) ? Function.identity : Record.set('bin', binFiles),
		Record.filter(
			(v) =>
				(!Predicate.isRecord(v) || !Record.isEmptyRecord(v)) &&
				(!Array.isArray(v) || !Array.isEmptyArray(v)) &&
				(!Predicate.isString(v) || !String.isEmpty(v))
		)
	);

	const stringifiedProdPackageJson = yield* Json.stringify(prodPackageJson);

	yield* Effect.log(`Writing '${prodPackageJsonPath}'`);
	//yield* fs.makeDirectory(prodPath, { recursive: true });
	yield* prettier.save(prodPackageJsonPath, stringifiedProdPackageJson);

	yield* Effect.log(`Writing '${prodProjectPackageJsonPath}'`);
	// We add a sideEffects key to the prodProjectPackageJson only if the prodPackageJson has one
	const prodProjectPackageJson = yield* pipe(
		prodPackageJson,
		Record.filter((_, k) => k === 'sideEffects'),
		Record.set('type', 'module'),
		Json.stringify
	);
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
