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
  Option,
  Predicate,
  Record,
  Stream,
  String,
  Tuple,
  flow,
  pipe,
} from 'effect';
import * as Json from '../internal/Json.js';
import * as Prettier from '../internal/Prettier.js';
import {
  binariesFolderName,
  commonJsFolderName,
  internalFolderName,
  licenseFileName,
  packageJsonFileName,
  prodFolderName,
  projectFolderName,
  readMeFileName,
  slashedDevScope,
  slashedScope,
  typesFolderName,
} from '../internal/projectConfig/constants.js';
import license from '../internal/projectConfig/license.js';
import { fromOsPathToPosixPath, isSubPathOf } from '../internal/projectConfig/utils.js';

const PlatformNodePathService = PlatformPath.Path;

const PlatformNodePathLive = PlatformNodePath.layerPosix;
const PlatformNodeFsService = PlatformFs.FileSystem;
const PlatformNodeFsLive = PlatformNodeFs.layer;

const live = pipe(PlatformNodePathLive, Layer.merge(PlatformNodeFsLive));

const importRegExp = /import\s*{([^}]*)}\s*from\s*["']([^"']+)["']((?:\s*;)?)/g;
const exportRegExp = /export\s+\*\s+as\s+([^\s]+)\s+from\s*["']\.\/(.+)\.js["']/g;
const asRegExp = /\s+as\s+/;

const program = Effect.gen(function* () {
  const path = yield* PlatformNodePathService;
  const fs = yield* PlatformNodeFsService;
  const prettier = yield* Prettier.Service;

  const rootPath = path.resolve();

  const srcPackageJsonPath = path.join(rootPath, packageJsonFileName);
  const prodPath = path.join(rootPath, prodFolderName);
  const projectPath = path.join(rootPath, projectFolderName);
  const prodProjectPath = path.join(prodPath, projectFolderName);

  const prodPackageJsonPath = path.join(prodPath, packageJsonFileName);

  const prodProjectPackageJsonPath = path.join(prodProjectPath, packageJsonFileName);

  const binPath = path.join(prodPath, binariesFolderName);

  yield* Effect.log(`Copying ${readMeFileName} to '${prodPath}'`);
  const readMePath = path.join(rootPath, readMeFileName);
  const hasReadMe = yield* fs.exists(readMePath);
  if (hasReadMe) yield* fs.copyFile(readMePath, path.join(prodPath, readMeFileName));

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

  yield* Effect.log(`Writing ${licenseFileName} to '${prodPath}'`);
  yield* fs.writeFileString(path.join(prodPath, licenseFileName), license);

  yield* Effect.log('Determining list of bin files');
  const binContents = yield* pipe(
    fs.readDirectory(binPath),
    Effect.catchTag('SystemError', (error) =>
      error.reason === 'NotFound' ? Effect.succeed(Array.empty<string>()) : Effect.fail(error),
    ),
  );
  const binFiles = pipe(
    binContents,
    Array.filter(String.endsWith('.js')),
    Array.map(flow(fromOsPathToPosixPath, String.slice(0, -3))),
    Record.fromIterableWith((fileName) =>
      Tuple.make(fileName, path.join(binariesFolderName, fileName + '.js')),
    ),
  );

  yield* Effect.log(`Reading '${srcPackageJsonPath}'`);

  const pkgContents = yield* fs.readFileString(srcPackageJsonPath, 'utf-8');

  const pkg = yield* Json.parse(pkgContents);

  if (!Predicate.isRecord(pkg)) {
    return yield* Effect.fail(new Error(`File '${srcPackageJsonPath}' is invalid`));
  }

  const publishConfig = pipe(
    pkg,
    Record.get('publishConfig'),
    Option.filter(Predicate.isRecord),
    Option.getOrElse(() => Record.empty<string | symbol, unknown>()),
  );

  const packageName = yield* pipe(
    pkg,
    Record.get('name'),
    Option.filter(Predicate.isString),
    Option.filter(String.startsWith(slashedDevScope)),
    Option.map(String.substring(slashedDevScope.length)),
    Either.fromOption(
      () =>
        new Error(
          `Field 'name' of ${srcPackageJsonPath} must be a string starting with '${slashedDevScope}'`,
        ),
    ),
  );

  const prodPackageName = slashedScope + packageName;

  const prodPackageJson = pipe(
    {
      ...pkg,
      ...publishConfig,
    },
    Record.set('name', prodPackageName),
    Record.isEmptyRecord(binFiles) ? Function.identity : Record.set('bin', binFiles),
    // Remove empty arrays, records and strings and undefined values
    // Except sideEffects for which an empty array is a meaningful value
    Record.filter(
      (v, key) =>
        v !== undefined
        && (!Predicate.isRecord(v) || !Record.isEmptyRecord(v))
        && (!Array.isArray(v) || !Array.isEmptyArray(v) || key === 'sideEffect')
        && (!Predicate.isString(v) || !String.isEmpty(v)),
    ),
  );

  // We add a sideEffects key to the prodProjectPackageJson only if the prodPackageJson has one
  const baseProdPackageJson = Record.filter(prodPackageJson, (_, k) => k === 'sideEffects');

  yield* Effect.log('Determining list of exported files');
  const indexContents = yield* fs.readFileString(path.join(projectPath, 'index.ts'), 'utf-8');

  const exports = Array.unfold(
    indexContents,
    flow(
      RegExp.prototype.exec.bind(exportRegExp),
      Option.fromNullable,
      Option.map(
        flow(Array.take(3), Array.drop(1), Tuple.make, Tuple.appendElement(indexContents)),
      ),
    ),
  ) as unknown as ReadonlyArray<readonly [namedExport: string, exportFileName: string]>;

  yield* Effect.log('Creating a directory for each exported files');
  const directoriesToCreate = Array.map(exports, ([namedExport]) =>
    path.join(prodPath, namedExport),
  );
  yield* pipe(
    directoriesToCreate,
    Array.map((dirPath) => fs.makeDirectory(dirPath)),
    Effect.all,
  );
  const directoriesToCreateContent = yield* pipe(
    exports,
    Array.map(([_, exportFileName]) =>
      pipe(
        baseProdPackageJson,
        Record.set('main', `../${commonJsFolderName}/${exportFileName}.js`),
        Record.set('module', `../${projectFolderName}/${exportFileName}.js`),
        Record.set('types', `../${typesFolderName}/${exportFileName}.d.ts`),
        Json.stringify,
      ),
    ),
    Effect.all,
  );

  yield* pipe(
    Array.zip(directoriesToCreate, directoriesToCreateContent),
    Array.map(([dirPath, content]) =>
      prettier.save(path.join(dirPath, packageJsonFileName), content),
    ),
    Effect.all,
  );

  yield* Effect.log(`Writing '${prodPackageJsonPath}'`);

  const newExports = yield* pipe(
    prodPackageJson,
    Record.get('exports'),
    Option.filter(Predicate.isRecord),
    Option.map(
      flow(
        Record.toEntries,
        Array.appendAll(
          Array.map(
            exports,
            Tuple.mapBoth({
              onFirst: (namedExport) => `./${namedExport}`,
              onSecond: (exportFileName) => ({
                types: `./dts/${exportFileName}.d.ts`,
                import: `./esm/${exportFileName}.js`,
                default: `./cjs/${exportFileName}.js`,
              }),
            }),
          ),
        ),
        Record.fromEntries,
      ),
    ),
    Either.fromOption(
      () => new Error(`File '${srcPackageJsonPath}' should contain a record 'exports' key`),
    ),
  );

  const stringifiedProdPackageJsonWithExports = yield* pipe(
    prodPackageJson,
    Record.set('exports', newExports),
    Json.stringify,
  );

  yield* prettier.save(prodPackageJsonPath, stringifiedProdPackageJsonWithExports);

  yield* Effect.log(`Writing '${prodProjectPackageJsonPath}'`);
  const prodProjectPackageJson = yield* pipe(
    baseProdPackageJson,
    Record.set('type', 'module'),
    Json.stringify,
  );
  yield* prettier.save(prodProjectPackageJsonPath, prodProjectPackageJson);

  yield* Effect.log('Transforming named imports to default imports');
  const projectContents = yield* fs.readDirectory(prodProjectPath, { recursive: true });
  return yield* pipe(
    projectContents,
    Array.filterMap(
      flow(
        fromOsPathToPosixPath,
        Option.liftPredicate(
          Predicate.every(
            Array.make(
              String.endsWith('.js'),
              Predicate.not(Equal.equals('index.js')),
              Predicate.not(isSubPathOf(internalFolderName)),
              Predicate.not(isSubPathOf(binariesFolderName)),
            ),
          ),
        ),
        Option.map((filename) => path.join(prodProjectPath, filename)),
      ),
    ),
    Stream.fromIterable,
    Stream.mapEffect((filePath) =>
      Effect.gen(function* () {
        const content = yield* fs.readFileString(filePath, 'utf-8');
        const newContent = content.replace(
          importRegExp,
          (match, namedImports: string, importFilename: string, eol: string) => {
            if (
              importFilename !== 'effect'
              && !String.startsWith('@effect/')(importFilename)
              && !String.startsWith(slashedScope)(importFilename)
            )
              return match;
            return pipe(
              namedImports,
              String.split(','),
              Array.map((namedImport) => {
                const cleanName = String.trim(namedImport);
                if (
                  (cleanName === 'absurd'
                    || cleanName === 'flow'
                    || cleanName === 'hole'
                    || cleanName === 'identity'
                    || cleanName === 'pipe'
                    || cleanName === 'unsafeCoerce')
                  && importFilename === 'effect'
                )
                  return `import {${cleanName}} from 'effect/Function'${eol}`;
                const [importName, asImportName] = String.split(asRegExp)(cleanName);
                return `import * as ${asImportName ?? importName} from '${importFilename}/${importName}'${eol}`;
              }),
              Array.join('\n'),
            );
          },
        );
        return yield* fs.writeFileString(filePath, newContent);
      }),
    ),
    Stream.runCollect,
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
  onSuccess: () => console.log(`${packageJsonFileName} prodified successfully`),
});
