Goal of this package is to allow simple and fast setup and modification of all other packages. To make a package work, we need:

- to install at its root and in its dist a package.json. The package.json at the root is the one that is called when the package is used inside a pnpm workspace. There the package can be consumed directly as typescript package without prior compilation with tools like vite. The package.json in the dist folder is the one that is used when the package is distributed, e.g on npm.
- to install at its root some files for versioning et deployment: .gitignore
- to install some files at its root for formatting and linting: tsconfig.json, eslint.config.js, prettier.config.js, .prettierignore
- to install at its root some files to produce the dist folder: vite-builder.ts, tsconfig.json
- and sometimes some other stuff

The package.json file can be created by merging several imported json files.
The tsconfig.json file can be created by copying several files that imports one of three configs: library, node or browser. Same for eslint.config.js.
The prettier.config.js can be created by copying a file that imports a config.
The .gitignore and .prettierignore files can be created by copying a file.
The vite.config.js file can be created by copying a file and merging some modifications into the exported object.

What config-manager must do:

- it must offer a static folder containing .json and .js files to import. To prevent bad things from happening, meaningful filenames in this folder (like package.json, tsconfig.json,...) are suffixed with .template.
- it must be able to create the configs files at the root of each package (create-config-files). To achieve this, each package will need to have a project.config.js file at its root that will import the necessary files from static, merge them, bring any necessary modifications, and export them in the form of a default object whose keys will be the name of the target file and the value a js object. create-config-files must import the default object exported by project.config.js. For each key of that object that ends in .js, it must create at the root of the package a file with that key as a name that imports the given key from project.config.js and re-exports it as default. For any other key, it must create at the root of the package a file with that key as name and fill it with the stringified value associated with this key.
- it must offer a tool that copies package.json from the root directory of the package to its dist directory after bringing some modifications (in particular in the exports and imports fields).

config-manager needs some config files to work... The first time, run `node init/main.mjs`. Github actions and in particular pnpm and node setup require a package.json and an up-to-date pnpm-lock.yaml. Also run `pnpm build` to build the config files and in particular the github workflows and actions which are used by github. Then, push the repo to github. In github:

- make sure to have read and write permissions under workflow in Settings/Actions/General.
- make sure to add the NPM_PUBLISH_TOKEN under Repository secrets in Settings/Secrets and variables/Actions
- make sure to have Github Actions for Build And Deployment in Settings/Pages.

When using in a new folder, it may be necessary to run `pnpm exec update-config-files` if the package.json does not yet contain the 'update-config-files' script.

About tsconfig:

- if the include directive does not match any ts file, it is considered that there is no include directive. It then falls back to the default which is all files in all subdirectories. In particular, if it finds only .js files and even if allowJs and checkJs are activated, it will revert to the default.
- typescript looks for the nearest tsconfig. If the file is not covered by that tsconfig, it does not look any further. It considers this files is not covered by a tsconfig. It will not try to see if there is another tsconfig up the directory tree that covers this file.
  I need 3 tsconfigs:

- one to build
- one to lint in vsCode
- one to provide to eslint. This one does not need to include any library because eslint as its own library management. So it can be put at monorepo level

About npm:

NPM is free for public packages. But we can publish a minified transpiled package to npm without the source code or maps.
NPM error messages are misleading. It can for instance indicate an authentification error when the issue is that the package is marked as private in package.json.
To use granular tokens to publish to npm, the package to publish must already exist! So the first time, use vscode, cd to the dist folder of the package to publish and hit `npm publish --access=public`. If there is an authentification error, try hitting `npm adduser` first. Once the repo is created on npm, go to its settings and choose 'Require two-factor authentication or an automation or granular access token' for publishing access.

About the build processes:

We offer two different build processes:

- transpile: for packages meant to be used as libraries. The files are only transpiled into cjs and esm formats and .d.ts files are created. The publi, esm/bin and esm/shared directories have no special meaning. The library can use dependencies and peerDependencies which are then present in the prodified package.json
- bundle: for packages meant to be used as executables. All the files in the esm directory and subdirectories are bundled into executables, except those in the 'shared' sub-directory. Files in the shared sub-directory are simply bundled into all the executables as are all dependencies (but not peerDependencies). No cjs version is created because these executables are not meant to be imported or required. Only esm and dts sub-directories are created. Inside the esm subdirectory, a package.json file is added with the "type":"module" key. It is not necessary to create one in the cjs sub-directory as "type":"commonjs" is the default. If there is a special esm/bin directory, all the files inside are bundled but the resulting bin directory is moved directly under the dist directory. If there is a 'public' directory at the same level as the package.json file, its contents are copied without any transformation under the dist directory. dependencies in the package.json file are removed in the prodified package.json file because they have been bundled. It does not make sense for a file meant to be used as an executable to have peerDependencies.

About package.json:
Dependencies imported at the top of a monorepo and bin executables defined there are available in all sub packages. Only devDependencies should be added in that manner as each package must have the list of its real dependencies.
