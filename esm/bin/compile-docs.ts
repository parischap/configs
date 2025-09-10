#!/usr/bin/env node
/**
 * See https://github.com/Effect-TS/docgen?tab=readme-ov-file
 *
 * This executable is run after docgen has been run in all subrepos at the root of which it has
 * created a `docs/modules/` directory. There is also a `docs/` directory at the root of the
 * monorepo which contains an index.md file with general documentation related to the whole repo and
 * a _config.yml file which contains several configuration parameters such as the theme. This
 * executable:
 *
 * - Removes all directories under the top `docs/` directory because this is where the previous runs
 *   have stored their results.
 * - For each package of the monorepo in which there is a `docs/modules/` directory, copies the
 *   contents of that directory under a `docs/packagename/` directory at the root of the
 *   monorepo(during this copy, the string `parent: Modules` in each copied file is replaced by
 *   parent: "${name}" where name is the name of the package) and adds into that `docs/packagename/`
 *   directory an `index.md` file.
 */

import * as constants from '../internal/constants.js';

import {
	Error as PlatformError,
	FileSystem as PlatformFs,
	Path as PlatformPath
} from '@effect/platform';
import {
	NodeFileSystem as PlatformNodeFs,
	NodePath as PlatformNodePath
} from '@effect/platform-node';

import {
	Array,
	Cause,
	Effect,
	Exit,
	flow,
	Layer,
	Option,
	pipe,
	String,
	Struct,
	Tuple
} from 'effect';

const parentRegExp = /^parent: Modules$/m;
const PlatformNodePathService = PlatformPath.Path;
const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const program = Effect.gen(function* () {
	const path = yield* PlatformNodePathService;
	const fs = yield* PlatformNodeFsService;

	const rootPath = path.resolve();
	//const packageJsonPath = path.join(rootPath, constants.packageJsonFileName);
	const packagesPath = path.join(rootPath, constants.packagesFolderName);
	const docsPath = path.join(rootPath, constants.docsFolderName);

	yield* Effect.log(`Removing all folders in '${docsPath}'`);

	yield* pipe(
		fs.readDirectory(docsPath),
		Effect.flatMap(
			flow(
				Array.map((name) =>
					Effect.gen(function* () {
						const p = path.join(docsPath, name);
						const stat = yield* fs.stat(p);
						return {
							path: p,
							stat
						};
					})
				),
				Effect.all
			)
		),
		Effect.flatMap(
			flow(
				Array.filter(({ stat: { type } }) => type === 'Directory'),
				Array.map(({ path }) =>
					Effect.zipRight(
						Effect.log(`Removing ${path}`),
						fs.remove(path, { recursive: true, force: true })
					)
				),
				Effect.all
			)
		)
	);

	yield* Effect.log('Copying docs from packages');

	yield* pipe(
		fs.readDirectory(packagesPath),
		Effect.flatMap(
			flow(
				Array.map((name) =>
					Effect.gen(function* () {
						const p = path.join(packagesPath, name);
						const stat = yield* fs.stat(p);
						return {
							name,
							path: p,
							stat
						};
					})
				),
				Effect.all
			)
		),
		Effect.flatMap(
			flow(
				Array.filterMap(
					flow(
						Option.liftPredicate(({ stat: { type } }) => type === 'Directory'),
						Option.map(({ name, path: folderPath }) =>
							Effect.gen(function* () {
								const p = path.join(
									folderPath,
									constants.docsFolderName,
									constants.docgenFolderName
								);
								const exists = yield* fs.exists(p);
								return {
									name: name,
									path: p,
									exists
								};
							})
						)
					)
				),
				Effect.all
			)
		),
		Effect.flatMap(
			flow(
				Array.filter(Struct.get('exists')),
				Array.map(({ name, path: docgenPath }, order) =>
					Effect.gen(function* () {
						yield* Effect.log(`path: ${docgenPath}`);
						yield* Effect.log(`name: ${name}`);

						const targetPath = path.join(docsPath, name);

						const copy = (
							p: string
						): Effect.Effect<[void[], void[]], PlatformError.PlatformError, never> =>
							pipe(
								path.join(docgenPath, p),
								fs.readDirectory,
								Effect.flatMap(
									flow(
										Array.map((name) =>
											Effect.gen(function* () {
												const relPath = path.join(p, name);
												const destPath = path.join(targetPath, relPath);
												const srcPath = path.join(docgenPath, relPath);
												const stat = yield* fs.stat(srcPath);
												yield* Effect.log(
													`relPath: ${relPath} destPath: ${destPath} srcPath: ${srcPath} type: ${stat.type}`
												);
												return {
													relPath,
													destPath,
													srcPath,
													stat
												};
											})
										),
										Effect.all
									)
								),
								Effect.flatMap(
									flow(
										Array.partition(({ stat: { type } }) => type === 'Directory'),
										Tuple.mapBoth({
											onFirst: flow(
												Array.map(({ srcPath, destPath }) =>
													Effect.gen(function* () {
														yield* Effect.log(`Copying ${srcPath} to ${destPath}`);
														const contents = yield* fs.readFileString(srcPath, 'utf-8');
														yield* fs.writeFileString(
															destPath,
															String.replace(parentRegExp, `parent: "${name}"`)(contents)
														);
													})
												),
												Effect.all
											),
											onSecond: flow(
												Array.map(({ relPath, destPath }) =>
													Effect.zipLeft(fs.makeDirectory(destPath), copy(relPath))
												),
												Effect.all
											)
										}),
										Effect.all
									)
								)
							);

						yield* fs.makeDirectory(targetPath);
						yield* copy('.');
						const indexContent = `---
title: "${name}"
has_children: true
permalink: /${constants.docsFolderName}/${name}
nav_order: ${order + 2}
---
`;
						yield* fs.writeFileString(path.join(targetPath, 'index.md'), indexContent);
					})
				),
				Effect.all
			)
		)
	);
});

const result = await Effect.runPromiseExit(pipe(program, Effect.provide(live)));
Exit.match(result, {
	onFailure: (cause) => {
		// eslint-disable-next-line functional/no-expression-statements
		console.error(Cause.pretty(cause));
		process.exit(1);
	},
	onSuccess: () => console.log('Successfully built docs')
});
