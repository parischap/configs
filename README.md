# 1 - Doc

Goal of this package is to install all the necessary configuration files of a repo or package (eslint.config.js, prettier.config.js,...). If a configuration file needs changing, we only need to modify it in this package and all the repos/packages that use the `configs` package will be updated automatically.

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

- run `node esm/internal/init/main.mjs`
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

- if the include directive does not match any ts file, it is considered that there is no include directive. It then falls back to the default which is all files in all subdirectories. In particular, if it finds only .js files and even if allowJs and checkJs are activated, it will revert to the default.
- typescript looks for the nearest tsconfig. If the file is not covered by that tsconfig, it does not look any further. It considers this files is not covered by a tsconfig. It will not try to see if there is another tsconfig up the directory tree that covers this file.
- the eslint tsconfig.json does not need to include any library because eslint as its own library management. So it can be put at monorepo level.

# 3 - About npm:

NPM is free for public packages. I did not find a way to publish to npm a package that is private under github. As a minor security measure, we can publish the code minified and bundled without the source code or maps. But users can always see the code on github. So this solution can be used for non sensitive stuff. A solution could be to have a private github repo with the source code and a public github repo with the compiled code...Maybe by using git submodules (see https://git-scm.com/book/en/v2/Git-Tools-Submodules)
NPM error messages are misleading. It can for instance indicate an authentification error when the issue is that the package is marked as private in package.json.
To publish a package for the first time, just proceed as usual by publishing a new release in GitHub (This needs no longer be done: cd to the dist folder of the package to publish and hit `npm publish --access=public`. If there is an authentification error, try hitting `npm adduser` first). Once the repo is created on npm, go to its settings and choose 'Require two-factor authentication or an automation or granular access token' for publishing access.

# 4 - About package.json:

Dependencies imported at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies and bin executables should be added in that manner as each package must have the list of its real dependencies.
DevDependencies defined with 'latest' don't update to latest systematically. From time to time, cut the devDependencies key in package.json, run `pnpm i` to uninstall, paste the devDependencies, and run `pnpm i`.

# 5 - About vitest:

Creating a workspace is useful if we need to run all test files with the vitest cli from the monorepo level. But we run tests in each package seperately. So do not use this feature. In settings.json, add `"vitest.maximumConfigs": 15` so the vitest vscode extension can load all extensions.
