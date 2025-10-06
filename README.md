# 1 - Doc

This package is meant to be used in the following situations:

- creation of a library (as a single package or as a monorepo): in that configuration, the exported files constituting the library are under `esm/` and files used internally are under `esm/internal/`. An `index.ts` file in `esm/` must reexport all visible exports (so as to enable named imports for users). All files are transpiled by tsc for ESM output and by Babel for cjs output. In the `dist/` directory, a directory is created for each exported file (so as to enable default imports for users). During the build, imports of all files (exported or not) are automatically changed from named imports to default imports (for tree-shaking). Functions of files under the `esm/internal/` directory should be tagged with `@internal` so no types and no doc get generated for them. Moreover, doc is alltogether skipped for files in `esm/internal`.
- creation of development tools (as a package): in that configuration, the binaries that will be installed by npm need to be under `esm/bin/`. The package must also export an `index.ts` files whose exports can be imported by users. All files necessary for the binaries and the exports must be under the `esm/internal/` directory. The binaries and `index.ts` get bundled during the build. The binaries are moved directly under the `dist/` directory during the build and types get generated for all internal files (this is important because some of them may get reexported by `index.ts` and `index.dts` only contains a rexport of the types) but not for the binaries. The `configs` package is an example of this configuration.
- creation of a standalone executable: the executable must be located under the `esm/` directory and be called `index.ts`. It will get bundled during the build and types will be generated for them (although this is not necessary). All files necessary for the executable must be under the `esm/internal/` directory.

In all three cases, the `README.md` file present at the top of the package is copied to the `dist/` directory a license file gets automatically generated in the `dist/` directory.

Goal of this package is to install all the necessary configuration files of a monorepo or package (eslint.config.js, prettier.config.js,...). If a configuration file needs changing, we only need to modify it in this package and all the repos/packages that use the `configs` package will be updated automatically.

The `configs` package must be installed as devDependency of the target package. In a monorepo, it must be installed as devDependency at the root.

Each target repo/package must contain a `project.config.js `file that exports an object whose keys are the names of the configuration files to create for that package and values the contents of these files.

To create a starter `package.json` and `project.config.js` file in a monorepo, you can type:

```sh
initialize-monorepo
```

in your favorite shell or:

```sh
.\node_modules\.bin\initialize-monorepo
```

if .\node_modules\.bin\ has not been added to the path.

Likewise, to create a starter `package.json` and `project.config.js` file in a subrepo, you can type:

```sh
initialize-subrepo
```

Following is a list of some parameters to provide to the `configSubRepo` and `configOnePackageRepo` functions:

- **environment**: specifies where the package will run: `Environment.Type.Node` for execution under node context, `Environment.Type.Browser` for execution in a browser and `Environment.Type.Library` for a library that may run both in node and a browser.
- **bundled**: if set to true, all ts files under `esm/` (except those under the `internal/` directory) become standalone executables in which are bundled all used files in the `internal/` directory and all dependencies (but not the peerDependencies). Type files are created for each executable. If a bin directory is present under esm/, it will be built directly under dist and not under dist/esm. If bundled is set to false, all files under `esm/`and subfolders are simply transpiled in js, cjs and d.ts files. We can also create an `internal/` directory in that case: files in this directory will not be documented.
- **visibility**: `Visibility.Type.Public` if the package is to be published to the NPM registry, `Visibility.Type.PublicByForce` if the package should be private but is published to NPM out of technical reasons and `Visibility.Type.Private` is the package is not to be published.
- **hasStaticFolder**: specifies if the package has a static folder which is to be copied unchanged under `dist/` (usually for websites) - Works only for bundled packages.
- **hasDocGen**: specifies if doc must be generated and published to github for this package.
- **keywords**: a list of keywords for packages published to npm.

The `configs` package uses itself to generate its configuration files. To that extent, the following procedure must be followed for that package only:

- run `node esm/internal/init/main.mjs`: this exe will simply remove tsconfig.json and create a package.json and .git. It does not need to be run if package.json needs not be modified.
- run `pnpm build`

For other packages, the procedure to follow is:

- run `pnpm update-config-files` at the target package root. Alternatively, in a monorepo, you can run `pnpm update-all-config-files` at the root of the monorepo.
- run `pnpm build`

When a package is built, you can push it to github. Upon creating a new release, the `publish` github workflow will automatically publish the package to npm if this is a public package (see github.workflows.publish.template.ts).

To make the documentation of the package available, manually run the `Pages` github workflow.
For this to work, make sure in github:

- to have read and write permissions under workflow in Settings/Actions/General.
- to add the NPM_PUBLISH_TOKEN under Repository secrets in Settings/Secrets and variables/Actions
- to have Github Actions for Build And Deployment in Settings/Pages.

Notes:

- there is no reason to create releases for a private package. So normally the `publish.yml` action should not get launched. However, in case it does, the package will not get published because there is the `private` key in package.json and the `build-and-publish` script has been deactivated.
- `publish.yml` can be started manually. In that case, it uses has release number the last issued release. It can be useful if the publish action has failed and no modification to the code is necessary. If a modification to the code is necessary, a new release will have to be issued.
- `pages.yml` creates the documentation for the package. In all cases, it must be started manually.

# 2 - About tsconfig:

`tsconfig.json` is used by several tools with diverse purposes:

- it is used by Visual Studio Code to report type errors while editing or by tsc used with the noEmit flag to report type errors in the build phase
- it is used by tsc to transform Typescript code into Javascript code or to emit type declaration files. Some `tsconfig.json` options are specific to that use like the target, rootDir, outDir, declarationDir options. However, even for a package bundled with Vite that defines its own target and ignores the `tsconfig.json` target option, it can make sense to set that option because it changes the default value of other options that are not specific to transpiling.
- it can be used by Eslint to report type errors.
- it can be partially used by some bundlers like vite.

When typechecking a file, Typescript looks for the nearest `tsconfig.json` file going up in the directory tree. If the file is not covered by that tsconfig, it does not look any further. It considers this files is not covered by a `tsconfig.json` file. It will not try to see if there is another `tsconfig.json` file upper in the directory tree that covers this file.

If the include directive of a `tsconfig.json` does not match any ts file, it is considered that there is no include directive. It then falls back to the default which is all files with supported extensions in all subdirectories. In particular, if it finds only .js files and even if allowJs and checkJs are activated, it will revert to the default.

In each package, the `tsconfig.json` calls two sub projects: the `tsconfig.others.json`, that covers the whole directory except `node_modules`, `dist` and `esm`, allows js files and defines the node library, and the `tsconfig.esm.json` that covers only the `esm` subdirectory, allows js files, defines a library according to the parameters in `project.config.js` and defines the output files and directories for the build phase.

There is also a `tsconfig.docgen.json` project, that is used during doc generation by docgen, which covers only the `esm` subdirectory, does not allow js files and defines the node library (because examples are written in nodejs).

# 3 - About npm:

NPM is free for public packages. I did not find a way to publish to npm a package that is private under github. As a minor security measure, we can publish the code minified and bundled without the source code or maps. But users can always see the code on github. So this solution can be used for non sensitive stuff. A solution could be to have a private github repo with the source code and a public github repo with the compiled code...Maybe by using git submodules (see https://git-scm.com/book/en/v2/Git-Tools-Submodules)
NPM error messages are misleading. It can for instance indicate an authentification error when the issue is that the package is marked as private in package.json.
To publish a package for the first time, just proceed as usual by publishing a new release in GitHub (This needs no longer be done: cd to the dist folder of the package to publish and hit `npm publish --access=public`. If there is an authentification error, try hitting `npm adduser` first). Once the repo is created on npm, go to its settings and choose 'Require two-factor authentication or an automation or granular access token' for publishing access.

# 4 - About package.json:

Dependencies imported at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies and bin executables should be added in that manner as each package must have the list of its real dependencies.
DevDependencies defined with 'latest' don't update to latest systematically. From time to time, cut the devDependencies key in package.json, run `pnpm i` to uninstall, paste the devDependencies, and run `pnpm i`.

# 5 - About vitest:

Creating a workspace is useful if we need to run all test files with the vitest cli from the monorepo level. But we run tests in each package seperately. So do not use this feature. In settings.json, add `"vitest.maximumConfigs": 15` so the vitest vscode extension can load all extensions.

# 6 - About paths

Posix paths are understood in all environments (including Windows). And configuration files (like package.json, `tsconfig.json`,...) only understand Posix paths. For that reason, this package works only with Posix paths. Only issue is when reading a directory with the `{recursive:true}` option, we get some local-system paths that we must therefore convert with the `utils.fromOsPathToPosixPath` function
