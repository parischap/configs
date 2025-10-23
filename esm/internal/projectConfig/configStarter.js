/**
 * This config implements what is necessary for the configs package. It must be used by this package
 * only.
 */
// This file must not import anything external
import { basename, resolve } from 'node:path/posix';
import configInternalBase from './configInternalBase.js';
import configInternalPackage from './configInternalPackage.js';
import configInternalTop from './configInternalTop.js';
import { binariesFolderName, prodFolderName, projectFolderName, tsExecuter } from './constants.js';
import { deepMerge } from './utils.js';
/**
 * @import {Config} from "./types.d.ts"
 */

const packageName = basename(resolve());
const binPath = `./${projectFolderName}/${binariesFolderName}/`;
const prodBinPath = `./${prodFolderName}/${binariesFolderName}/`;

/**
 * @type Config
 */
export default deepMerge(
  configInternalBase({
    packageName,
    environment: 'Node',
  }),
  configInternalTop,
  // Put configInternalPackage after configInternalBase so @parischap-dev/configs gets imported locally
  configInternalPackage({
    packageName,
    repoName: packageName,
    description: 'Utility to generate configuration files in a repository',
    dependencies: {
      minimatch: '^10.0.3',
      effect: '^3.18.1',
      '@effect/platform': '^0.92.1',
      '@effect/platform-node': '^0.98.3',
      '@effect/cluster': '^0.50.3',
      '@effect/rpc': '^0.71.0',
      '@effect/sql': '^0.46.0',
      '@effect/workflow': '^0.11.3',
      'ts-deepmerge': '^7.0.3',
    },
    devDependencies: {
      '@eslint/core': '^0.16.0',
      '@types/eslint': '^9.6.1',
      '@types/eslint-config-prettier': '^6.11.3',
    },
    internalPeerDependencies: {},
    externalPeerDependencies: {},
    examples: [],
    scripts: {
      bundle: `${tsExecuter} ${binPath}bundle-files.ts`,
      prodify: `node ${prodBinPath}prodify.js`,
      'update-config-files': `node ${prodBinPath}update-config-files.js`,
      'pre-build': 'pnpm i',
      'post-build': 'pnpm update-config-files',
    },
    bundled: true,
    visibility: 'Private',
    hasDocGen: false,
    keywords: [],
  }),
);
