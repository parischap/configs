/**
 * This config implements what is necessary for the configs package. It must be used by this package
 * only.
 */
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './configInternalBase.js';
import configInternalPackage, { Visibility } from './configInternalPackage.js';
import configInternalTop from './configInternalTop.js';
import * as constants from './constants.js';
import { configStarterDependencies, configStarterDevDependencies } from './dependencies.js';

const binPath = `./${constants.projectFolderName}/${constants.binariesFolderName}/`;
const prodBinPath = `./${constants.prodFolderName}/${constants.binariesFolderName}/`;

export default merge(
  configInternalBase({
    packageName: constants.thisPackageName,
    environment: Environment.Type.Node,
  }),
  configInternalTop,
  // Put configInternalPackage after configInternalBase so @parischap-dev/configs gets imported locally
  configInternalPackage({
    packageName: constants.thisPackageName,
    repoName: constants.thisPackageName,
    description: 'Utility to generate configuration files in a repository',
    dependencies: configStarterDependencies,
    devDependencies: configStarterDevDependencies,
    internalPeerDependencies: {},
    externalPeerDependencies: {},
    examples: [],
    scripts: {
      bundle: `vite-node ${binPath}bundle-files.ts`,
      prodify: `node ${prodBinPath}prodify.js`,
      'update-config-files': `node ${prodBinPath}update-config-files.js`,
      'pre-build': 'pnpm i',
      'post-build': 'pnpm update-config-files',
    },
    bundled: true,
    visibility: Visibility.Type.Private,
    hasDocGen: false,
    keywords: [],
  }),
  /*{
    [constants.packageJsonFileName]: {
      publishConfig: {
        // Add type field for configs package. Eslint plugins and prettier plugins need to be installed at the root of each monorepo for vscode intellicode. At the same time, eslint.config.base and prettier.config.base use recommended configs of eslint, prettier and their plugins. The configs and the plugins need to be in the same version. For this reason, we do not import the plugins as dependencies of this package as we should. But as dev dependencies. These devDependencies are removed in the prod version of the Configs package. But as they are also included at the root of the target package, everything will work. However, we need to add type module in the nearest package.json above node_modules.
        type: 'module',
      },
    },
  },*/
);
