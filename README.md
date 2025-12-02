<!-- LTeX: language=en-US -->

Goal of this package is to generate all the necessary configuration files (`eslint.config.ts`, `prettier.config.ts`, ...) of a monorepo or package.

/\*\*

- A library is a set of exported modules that are made separately available to a client.
-
- All modules in a library need not be exported. The modules not to be exported must be put away
- under `esm/internal/`.
-
- Any exported module must be made available to the client either as named import `import { MArray
- } from "@parischap/effect-lib";`and default import`import \* as MArray from
- "@parischap/effect-lib/MArray";`.
-
- A `index.ts` file in `esm/` must reexport all modules under `esm/` and not under `esm/internal`.
- This file could be generated during the build. However, it is very convenient to enable
- auto-completion of imports in vscode and this only works with named imports reexported in the
- `index.ts` file. So this file must be generated on the fly, either manually or by using vscode
- `TypeScript Barrel Generator` plugin.
-
- A library can be public or private. A private library can be installed directly from github and
- does not need to be built: it is directly consumed in its Typescript version.
-
- For public libraries, the build phase must:
-
- - transpile all modules from Typescript to a widely natively understandable javascript.
- Transpilation is performed by `tsc` for `esm` output and by `babel` for `cjs` output. Type
- files get also generated for `esm` output.
- - Transform named imports after transpilation: Vscode will generate named imports during editing,
- but tree-shaking will the fail. So they must be changed to default imports during the build.
- - Copy `esm/README.md` if there is one to `dist`.
- - Generate a `LICENSE` file directly under `dist`.
- - Copy `esm/package.json` to `dist`, change the package name to prod name, spread the
- `publishConfig`, remove specific keys (`scripts`, `devDependencies`, `publishConfig`,
- `packageManager`, `pnpm`, `devEngine`), remove keys with undefined values.
- - Generate a `package.json` file under `dist/cjs` with a `commonjs` type.
- - for each file under `esm/` and not under `esm/internal/` except `index.ts`, create a folder with
- a `package.json` for default imports and update the `exports` field of `package.json`
- accordingly.
-
- Each module in a library except those under `esm/internal` must be documented.
-
- Documentation and type do not get generated for any value commented with tsdoc `@internal`.
- `@internal` should be used for any value exported in a module under `esm/internal`. It should
- also be used for any value exported only for test purposes (clients using typescript will be
- informed that this value should not be used).
-
- Each module in a library must be tested.
-
- A library must import itself as `devDependency` for test purposes.
-
- If several libraries are interdependent, they can be grouped in a monorepo. In that case, if one
- of the libraries in the monorepo uses another library of the monorepo, it must import the dev
- version of that library in development (so any modification in the dependencies is immediately
- taken into account for tests) and the prod version of that library (the one in the `npm` registry
- if it's a public library, or the one in the `dist/` directory if it's a private library) in
- production.
  \*/

# Project organization

There are three levels:

- top: this is the level at which vscode is opened. It gives access to all my Effect repos which are under the packages folder. We have created a vscode workspace , otherwise vscode's source control does not detect the git subrepos. At this level, we must install all the dependencies needed by vscode and its plugins (eslint, prettier, typescript, vitest...). This level is synchronized with a private github repository. However it does not cover the `packages` folder. We do not have a pnpm workspace at this level because it would allow us to import packages of a repo in another repo. That would work locally because all repos see the top level where the workspace would be defined but not in github where repos have no access to the top level. If we need to use a private repo in another repo, the only solution is to use a github link.
- repo: this is the level at which all my repos are, be they monorepos or one-package repos. Each repo at this level is synchronized with a public or private github repository that includes the repo and its sub-repos (when there are some). All the processes (build, checks,...) must work locally but also in github where repos have no access to the top level. So we need to have at this level all the dependencies necessary for the build and checks processes (eslint, prettier, typescript, vitest...) as well as the config files necessary for these processes (vitest config file, vite config files if necessary...). We have a pnpm workspace at the level of each monorepo because importing a dependency from github only works for dependencies and devDependencies (not for peerDependencies). If a package in a monorepo needs a peerDependency, it must fetch it from npm (if it is a public dependency) or it must fetch it from within itself using the workspace syntax. Fetching a dependency from github would have the advantage of forcing me to commit after each change. Using the workspace syntax has the advantage of being very fast. Documentation pages are available at the level of each github repo. At repo level, we have a binary that
- subrepo:

# 1 - Use cases

This package is meant to be used in the following situations:

## 1.1 - Libraries

## 1.2 Standalone executable

A standalone executable is simply a program that can be run by node. It does not need anything: all its dependencies must be bundled inside the executable and no `package.json` must be generated. For node to know it's an `esm` program without having to try compiling it as a `cjs` program first, a standalone executable must have a `.mjs` extension.

The code of the executable can be split in several modules all under the `esm/` directory, but the entry module must bear the name `index.ts`. This `index.ts` can export functions for test purposes.

A standalone executable can be private or public.

For public libraries, the build phase must:

- transpile all modules from Typescript to a widely natively understandable javascript. Transpilation is performed by `tsc` for `esm` output and by `babel` for `cjs` output. Type files get also generated for `esm` output.

Each module in a library except those under `esm/internal` must be documented.

Documentation and type do not get generated for any value commented with tsdoc `@internal`. `@internal` should be used for any value exported in a module under `esm/internal`. It should also be used for any value exported only for test purposes (clients using typescript will be informed that this value should not be used).

Each module in a library must be tested.

A library must import itself as `devDependency` for test purposes.

## 1.3 Standalone command

## 1.4 Buildless project

## 1.5 App server

## 1.6 App client

This program must in any case ship with a `package.json` file so node knows

- creation of a standalone executable: the executable must be located under the `esm/` directory and be called `main.ts`. All files used by it must be under the `esm/internal/` directory. The executable will get bundled during the build and will be added as binary in `package.json` so clients can call it with `pnpm main`. The package can also include an `index.js` file that can be used to reexport stuff.

In both cases, the `README.md` file present at the top of the package is copied to the `dist/` directory a license file gets automatically generated in the `dist/` directory.

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

- **environment**: specifies where the package will run: `Environment.Type.Node` for execution under node context, `Environment.Type.Browser` for execution in a browser and `Environment.Type.ESNext` for a library that may run both in node and a browser.
- **bundled**: if set to true, all ts files under `esm/` (except those under the `internal/` directory) become standalone executables in which are bundled all used files in the `internal/` directory and all dependencies (but not the peerDependencies). Type files are created for each executable. If a bin directory is present under esm/, it will be built directly under dist and not under dist/esm. If bundled is set to false, all files under `esm/`and subfolders are simply transpiled in js, cjs and d.ts files. We can also create an `internal/` directory in that case: files in this directory will not be documented.
- **visibility**: `Visibility.Type.Public` if the package is to be published to the NPM registry, `Visibility.Type.PublicByForce` if the package should be private but is published to NPM out of technical reasons and `Visibility.Type.Private` is the package is not to be published.
- **hasStaticFolder**: specifies if the package has a static folder which is to be copied unchanged under `dist/` (usually for websites) - Works only for bundled packages.
- **hasDocGen**: specifies if doc must be generated and published to github for this package.
- **keywords**: a list of keywords for packages published to npm.

The `configs` package uses itself to generate its configuration files. To that extent, the following procedure must be followed for that package only if no `package.json` is present:

```bash
pnpx vite-node esm/bin/update-config-files.ts
pnpm i
```

`update-config-files` reads the keys and values of a default object exported by the file named`project.config.ts` located in the current path. It creates a file for each key of that object with the key as name. If the key ends with .json, the value is converted from an object to a json string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. `update-config-files` will also check that there are no unexpected config files present in the package, i.e. config files which are not created by itself.

When `update-config-files` is executed at the top package level, it does not read a `project.config.ts` file, which must not be present. A default configuration stored in `update-config-files` is used instead.

When `update-config-files` is executed at the configs package level, it does not read a`project.config.ts` file, which must not be present. A default configuration stored in `update-config-files` is used instead. Moreover, in that case only:

- it will install configuration files for the top package and all repos and sub-repos ;
- if there is no `project.config.ts` in one of the repos or sub-repos, or if this file exists but contains errors, a default configuration stored in `update-config-files` is used instead.
- the `update-config-files` binary used is the one present locally on that machine. However, it imports the `project.config.ts` files present in each repo and sub-repo and these files import themselves the configs package that is included in the `package.json` file of that package if there is one. Which means it will import the configurations as they are stored on github!
- an error may be encountered if a `tsconfig.json` file exists in the configs package and the `node_modules` directory has not been populated yet. That's because, before doing anything, vite-node tries to load `tsconfig.json` which indirectly uses the `@tsconfig/strictest` dependency (which has not been installed yet). In that case, the best solution is to delete the `tsconfig.json` file.
  For other packages, the procedure to follow is:

- run `pnpm update-config-files` at the target package root. Alternatively, in a monorepo, you can run `pnpm update-all-config-files` at the root of the monorepo.
- run `pnpm build`

Compared to vscode, jiti has the advantage of not reading `tsconfig.json`

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
To publish a package for the first time, just proceed as usual by publishing a new release in GitHub (This needs no longer be done: cd to the dist folder of the package to publish and hit `npm publish --access=public`. If there is an authentification error, try hitting `npm adduser` first). Once the repo is created on npm, go to its settings and choose 'Require two-factor authentication or an automation or granular access token' for publishing access

# 4 - About package.json:

## Dependencies

Dependencies imported in a `package.json` and bin executables defined in it are available in all subdirectories (scripts are only available in the directory where the `package.json` is defined). Only `devDependencies` and bin executables should be added in that manner as each package must have the list of its real dependencies.

When including a dependency with `link:`, a symlink is created in node_modules to the target package. This implies that this package does not need to exist, that any modification to the package are immediately reflected but also that bin executables are not installed. Inversely, when including a dependency with `file:`, the target package is copied into node_modules. Changes will only take effect after `pnpm i` est called and bin executables will be installed.
When including a dependency with the `workspace:` protocol, a symlink is created in node_modules to the target package.

We can include a dependency from github or another version service using: `git+https://versionService/owner/repo#version&path:subpath`. The part starting at `#` is optional. An example of sub-path is `packages/effect-lib` in the effect-libs repo. Version can be a github release, e.g. `effect-lib@0.11.0` or a semver in the form `semver:^2.0.0`.

# 5 - About paths

In all configuration files (`package.json`, `tsconfig.json`, `eslint.config.ts`...), paths are written POSIX style. That's to make sure these files can be used on all platforms. We make the same choice for `project.config.ts`. For this reason, all paths in `constants.ts` are written POSIX style.

However, when using file system functions, it's best to use directly paths understandable by the operating system. For instance, `path.posix.resolve()` skips the initial `C:\` for Windows paths and this leads to issues when using path.relative.

# 6 - Vite and Vitest

Although it is possible to have the vitest configuration inside the vite configuration files, this is not a good idea in our case because we do not have a vite configuration in all repos whereas all repos need a testing configuration. So it's good to keep matters separate.
