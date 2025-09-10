#!/usr/bin/env node
/**
 * Copies `esm/README.md` if there is one to `dist`. Generates the `LICENSE` file directly under
 * `dist`. Copies `esm/package.json` to `dist` but spreads the `publishConfig` key so that any key
 * present in `publishConfig` will override the key with the same name. Also adds a `bin` key with
 * all the bin executables present under `esm/bin/` and removes keys with empty objects, empty
 * arrays or empty strings as value. Result is prettified using prettier. Creates a `package.json`
 * file under `dist/esm/` so that files in this directory can import one another. It is not
 * necessary to create one under `dist/cjs/` for transpiled packages as `type: 'commonjs'` is the
 * default. Creates a directory with a `package.json` in `dist/` for each file directly under `esm/`
 * except `index.ts`.
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
	Equal,
	Exit,
	Function,
	Layer,
	Option,
	Predicate,
	Record,
	String,
	Tuple,
	flow,
	pipe
} from 'effect';
import * as Json from '../internal/Json.js';
import * as Prettier from '../internal/Prettier.js';
import * as constants from '../internal/constants.js';
import licenseTemplate from '../internal/licenseTemplate.js';
import * as utils from '../internal/utils.js';

const PlatformNodePathService = PlatformPath.Path;

const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const importRegExp = /import\s*{([^}]*)}\s*from\s*["']([^"']+)["']((?:\s*;)?)/g;
const asRegExp = /\s+as\s+/;

const program = Effect.gen(function* () {
	const path = yield* PlatformNodePathService;
	const fs = yield* PlatformNodeFsService;
	const prettier = yield* Prettier.Service;

	const rootPath = path.resolve();

	const srcPackageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const prodPath = path.join(rootPath, constants.prodFolderName);
	const prodProjectPath = path.join(prodPath, constants.projectFolderName);

	const prodPackageJsonPath = path.join(prodPath, constants.packageJsonFileName);

	const prodProjectPackageJsonPath = path.join(prodProjectPath, constants.packageJsonFileName);

	const binPath = path.join(prodPath, constants.binariesFolderName);

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
		Array.map(flow(utils.fromOsPathToPosixPath, String.slice(0, -3))),
		Record.fromIterableWith((fileName) =>
			Tuple.make(fileName, path.join(constants.binariesFolderName, fileName + '.js'))
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
	const baseProdPackageJson = Record.filter(prodPackageJson, (_, k) => k === 'sideEffects');
	const prodProjectPackageJson = yield* pipe(
		baseProdPackageJson,
		Record.set('type', 'module'),
		Json.stringify
	);
	yield* prettier.save(prodProjectPackageJsonPath, prodProjectPackageJson);

	yield* Effect.log('Creating default export directories for exported files');
	const topProjectContents = yield* fs.readDirectory(prodProjectPath);
	const projectVisibleFiles = Array.filterMap(
		topProjectContents,
		flow(
			Option.liftPredicate(
				Predicate.and(String.endsWith('.js'), Predicate.not(Equal.equals('index.js')))
			),
			Option.map((name) => String.takeLeft(name.length - 3)(name))
		)
	);
	const directoriesToCreate = Array.map(projectVisibleFiles, (name) => path.join(prodPath, name));
	yield* pipe(
		directoriesToCreate,
		Array.map((dirPath) => fs.makeDirectory(dirPath)),
		Effect.all
	);
	const directoriesToCreateContent = yield* pipe(
		projectVisibleFiles,
		Array.map((name) =>
			pipe(
				baseProdPackageJson,
				Record.set('main', `../${constants.commonJsFolderName}/${name}.js`),
				Record.set('module', `../${constants.projectFolderName}/${name}.js`),
				Record.set('types', `../${constants.typesFolderName}/${name}.d.ts`),
				Json.stringify
			)
		),
		Effect.all
	);

	yield* pipe(
		Array.zip(directoriesToCreate, directoriesToCreateContent),
		Array.map(([dirPath, content]) =>
			prettier.save(path.join(dirPath, constants.packageJsonFileName), content)
		),
		Effect.all
	);

	yield* Effect.log('Transforming named imports to default imports');
	const projectContents = yield* fs.readDirectory(prodProjectPath, { recursive: true });
	yield* pipe(
		projectContents,
		Array.filterMap(
			flow(
				Option.liftPredicate(
					Predicate.every(
						Array.make(
							String.endsWith('.js'),
							Predicate.not(Equal.equals('index.js')),
							Predicate.not(utils.isSubPathOf(constants.internalFolderName)),
							Predicate.not(utils.isSubPathOf(constants.binariesFolderName))
						)
					)
				),
				Option.map((filename) => {
					const filePath = path.join(prodProjectPath, utils.fromOsPathToPosixPath(filename));
					return Effect.flatMap(fs.readFileString(filePath, 'utf-8'), (content) =>
						pipe(
							content.replace(
								importRegExp,
								(_, namedImports: string, importFilename: string, eol: string) =>
									pipe(
										namedImports,
										String.split(','),
										Array.map(
											flow(
												String.trim,
												Either.liftPredicate(
													Predicate.or(Equal.equals('pipe'), Equal.equals('flow')),
													flow(
														String.split(asRegExp),
														([importName, asImportName]) =>
															`import * as ${asImportName ?? importName} from '${importFilename}/${importName}'${eol}`
													)
												),
												Either.map((fName) => `import {${fName}} from 'effect'${eol}`),
												Either.merge
											)
										),
										Array.join('\n')
									)
							),
							(content) => fs.writeFileString(filePath, content)
						)
					);
				})
			)
		),
		Effect.all
	);

	return 0 as never;
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
