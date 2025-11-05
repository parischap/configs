/**
 * This config implements what is necessary in a package that needs building. It should not be used
 * directly. It is included by config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  commonJsFolderName,
  configsPackageName,
  docgenConfigFileName,
  examplesFolderName,
  madgeConfigFileName,
  owner,
  packageJsonFileName,
  prodFolderName,
  projectFolderName,
  slashedScope,
  testUtilsPackageName,
  tsConfigDocGenFileName,
  tsConfigProjectFileName,
  tsExecuter,
  typesFolderName,
  viteConfigFileName,
} from '../constants.js';
import { deepMerge } from '../utils.js';
import docgenConfig from './docgenConfig.js';
import madgeConfig from './madgeConfig.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import viteConfig from './viteConfig.js';
/** @import {Visibility, Config, ReadonlyRecord, ReadonlyStringRecord, PackageType} from "../types.js" */

/**
 * @param {string} repoName
 * @param {string} packageName
 * @returns {ReadonlyRecord}
 */
const repository = (repoName, packageName) => ({
  type: 'git',
  url: `git+https://github.com/${owner}/${repoName}.git`,
  ...(packageName === repoName ?
    {}
  : {
      directory: `packages/${packageName}`,
    }),
});  

/**
 * @param {PackageType} packageType
 * @returns {Config}
 */
const buildConfig = (packageType)=> 
  packageType === 'Library' ? {
  [packageJsonFileName]: {
    sideEffects: [],
    publishConfig: {
      main: `./${commonJsFolderName}/index.js`,
      types: `./${typesFolderName}/index.d.ts`,
      exports: {
        '.': {
          types: `./${typesFolderName}/index.d.ts`,
          default: `./${commonJsFolderName}/index.js`,
        },
      },
    },
    scripts: {
      // transpile-esm builds but also generate types
      'transpile-esm': `tsc -b ${tsConfigProjectFileName} --force`,
      'transpile-cjs': `babel ${prodFolderName}/${projectFolderName} --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir ${prodFolderName}/${commonJsFolderName} --source-maps`,
      'transpile-annotate': `babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`,
      compile:
        'pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate && pnpm prodify-lib',
    },
    devDependencies:{
      '@babel/core': '^7.28.4',
      '@babel/plugin-transform-export-namespace-from': '^7.27.1',
      '@babel/plugin-transform-modules-commonjs': '^7.27.1',
      'babel-plugin-annotate-pure-calls': '^0.5.0',
      '@babel/cli': '^7.28.3',
    }
  },
} :
{
  [packageJsonFileName]: {
    module: `./${projectFolderName}/main.js`,
    dependencies: {
      '@effect/experimental': '^0.56.0',
    },
    scripts: {
      bundle: 'bundle-files',
      compile: `pnpm bundle && pnpm prodify-bundle`,
    },
    devDependencies:{
      // At some point, rolldown will be default in vite. But not the case for the moment
      vite: 'npm:rolldown-vite@^7.1.17'
    }
  },
  [viteConfigFileName]: viteConfig(packageType),
};


/**
 * @param {{ readonly repoName: string; readonly visibility:
 *   Visibility; readonly keywords: ReadonlyArray<string>; }} params
 * @returns {Config}
 */
const visibilityConfig = ({ repoName, visibility, keywords }) =>
  visibility === 'Private' ?
    {
      [packageJsonFileName]: {
        private: true
      },
    }
  : {
      [packageJsonFileName]: {
        bugs: {
          url: `https://github.com/${owner}/${repoName}/issues`,
        },
        funding: [
          {
            type: 'ko-fi',
            url: 'https://ko-fi.com/parischap',
          },
        ],
        // Put specific keywords in first position so important keywords come out first
        keywords: [...keywords, 'effect', 'typescript', 'functional-programming'],
        scripts: {
          // Checks have to be carried out after build for the configs repo
          'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm',
          // npm publish ./dist --access=public does not work
          'publish-to-npm': `cd ${prodFolderName} && npm publish --access=public && cd ..`,
        },
      },
    };

/**
 * @param {boolean} hasDocGen
 * @returns {Config}
 */
const docGenConfig = (hasDocGen) => hasDocGen ? {
  [packageJsonFileName]: {
    scripts: {
      docgen: 'docgen',
    },
    devDependencies:{
      '@effect/docgen': '^0.5.2',
      // tsx must be installed because it is used by docgen (strangely, it is not requested as a dev-dependency
      tsx: '^4.20.6',
    }
  },
  [tsConfigDocGenFileName]: tsconfigDocgen,
  [docgenConfigFileName]: docgenConfig,
}:


 {}
;

/**
 * @param {{
 *   readonly repoName: string;
 *   readonly packageName: string;
 *   readonly dependencies: ReadonlyStringRecord;
 *   readonly devDependencies: ReadonlyStringRecord;
 *   readonly internalPeerDependencies: ReadonlyStringRecord;
 *   readonly externalPeerDependencies: ReadonlyStringRecord;
 *   readonly examples: ReadonlyArray<string>;
 *   readonly packageType: PackageType;
 *   readonly visibility: Visibility;
 *   readonly hasDocGen: boolean;
 *   readonly keywords: ReadonlyArray<string>;
 * }} params
 * @returns {Config}
 */
export default ({
    repoName,
    packageName,
    dependencies,
    devDependencies,
    internalPeerDependencies,
    externalPeerDependencies,
    examples,
    packageType,
    visibility,
    hasDocGen,
    keywords,
  }) => {

  const prodInternalPeerDependencies = {
    // Put npm version of internal peerDependencies
    ...Object.fromEntries(
      Object.entries(internalPeerDependencies).map(([depName, depVersion]) => [
        slashedScope + depName,
        depVersion,
      ]),
    ),
  };

  return deepMerge(
    {
      [madgeConfigFileName]: madgeConfig,
      [packageJsonFileName]: {
        ...(Object.keys(dependencies).length === 0 ? {} : { dependencies }),
        module: `./${projectFolderName}/index.js`,
        exports: {
          '.': {
            import: `./${projectFolderName}/index.js`,
          },
        },
        devDependencies: {
          // Include self for tests if not already included. 
          ...(packageName === configsPackageName ? {} : {
            // Use `link:` not `file:` so modifications take effect immediately
            [`${slashedScope}${packageName}`]: 'link:.',
          }),
          // Include test utilities. Use `link:` not `file:` so modifications take effect immediately
          [`${slashedScope}${testUtilsPackageName}`]: `link:../${testUtilsPackageName}/.`,
          madge: '^8.0.0',
          vitest: '^3.2.4',
          // vite-node is used to run examples and an AppServer
          ...(examples.length!==0 || packageType === 'AppServer'  ? {'vite-node': '^3.2.4'}:{}),
          ...devDependencies,
        },
        ...((
          Object.keys(internalPeerDependencies).length === 0
          && Object.keys(externalPeerDependencies).length === 0
        ) ?
          {}
        : {
            peerDependencies: {
              // Put dev version of internal peerDependencies
              ...Object.fromEntries(
                Object.keys(internalPeerDependencies).map((depName) => [
                  slashedScope + depName,
                  `../${depName}/.`,
                ]),
              ),
              ...externalPeerDependencies,
            },
          }),
        publishConfig: {
          ...(Object.keys(prodInternalPeerDependencies).length === 0 ?
            {}
          : { peerDependencies: prodInternalPeerDependencies }),
        },
        scripts: {
          circular: `madge --extensions ts --circular --no-color --no-spinner ${projectFolderName}`,
          checks: 'pnpm circular && pnpm lint && pnpm tscheck && pnpm test',
          test: 'vitest run',
          'clean-prod': `shx rm -rf ${prodFolderName} && shx mkdir -p ${prodFolderName}`,
          build:
            'pnpm clean-prod && pnpm --if-present pre-build && pnpm compile && pnpm --if-present post-build && cd ${prodFolderName} && pnpm i && cd ..',
          examples: examples
            .map((exampleName) => `${tsExecuter} ${examplesFolderName}/${exampleName}`)
            .join('&&')
        },
        // Must be present even for private packages as it can be used for other purposes
        repository: repository(repoName, packageName),
        // Must be present even for private packages as it can be used for instance by docgen
        homepage:
          `https://github.com/${owner}/${repoName}`
          + (packageName === repoName ? '' : `/tree/master/packages/${packageName}`),
        devEngines: {
          runtime: {
            name: 'node',
            onFail: 'error',
          },
          packageManager: {
            name: 'pnpm',
            onFail: 'error',
          },
        },
      },
    },
    // Put transpiledConfig after general config because `default` exports needs to be last in publishConfig exports
    bundled ? bundledConfig : transpiledConfig,
    visibilityConfig({ repoName, visibility, keywords }),
    docGenConfig(hasDocGen)
  );
};
