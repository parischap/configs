/**
 * This config implements what is necessary in a package that needs building. It should not be used
 * directly. It is included by config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This file must not import anything external
import {
  commonJsFolderName,
  docgenConfigFileName,
  docgenTsConfigFileName,
  examplesFolderName,
  madgeConfigFileName,
  owner,
  packageJsonFileName,
  prodFolderName,
  projectFolderName,
  projectTsConfigFileName,
  slashedScope,
  tsExecuter,
  typesFolderName,
} from './constants.js';
import docgen from './docgen.js';
import madge from './madge.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import { deepMerge, devWorkspaceLink } from './utils.js';
/**
 * @import {Visibility, Config, ReadonlyRecord, ReadonlyStringRecord} from "./types.d.ts"
 */

/**
 * @type (repoName: string)=> ReadonlyRecord
 */
const gitRepo = (repoName) => ({
  type: 'git',
  url: `git+https://github.com/${owner}/${repoName}.git`,
});

/**
 * @type Config
 */
const bundledConfig = {
  [packageJsonFileName]: {
    dependencies: {
      '@effect/experimental': '^0.56.0',
    },
    scripts: {
      bundle: 'bundle-files',
      // generate types even when bundling because they can be useful as in the Configs package
      compile: `pnpm bundle && pnpm prodify && tsc -b ${projectTsConfigFileName} --emitDeclarationOnly --force`,
    },
    publishConfig: {
      exports: {
        '.': {
          types: `./${typesFolderName}/index.d.ts`,
        },
      },
      // Remove dependencies in prod because they have been bundled
      dependencies: {},
      // Unset sideEffects in prod
      sideEffects: undefined,
    },
  },
};

/**
 * @type Config
 */
const transpiledConfig = {
  [packageJsonFileName]: {
    scripts: {
      // transpile-esm builds but also generate types
      'transpile-esm': `tsc -b ${projectTsConfigFileName} --force`,
      'transpile-cjs': `babel ${prodFolderName}/${projectFolderName} --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir ${prodFolderName}/${commonJsFolderName} --source-maps`,
      'transpile-annotate': `babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`,
      compile:
        'pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate && pnpm prodify',
    },
    publishConfig: {
      main: `./${commonJsFolderName}/index.js`,
      types: `./${typesFolderName}/index.d.ts`,
      exports: {
        '.': {
          default: `./${commonJsFolderName}/index.js`,
        },
      },
      // Do not unset sideEffects for libraries as the consumers of these libraries might bundle
    },
  },
};

/**
 * @type ({ repoName, visibility, keywords, }: { readonly repoName: string; readonly visibility:
 *   Visibility; readonly keywords: ReadonlyArray<string>; })=> Config
 */
const visibilityConfig = ({ repoName, visibility, keywords }) =>
  visibility === 'Private' ?
    {
      [packageJsonFileName]: {
        private: true,
        scripts: {
          // Do not use an empty string because it gets wiped out by prodify
          'build-and-publish': 'echo "private package cannot be published"',
        },
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
        },
      },
    };

/*
const staticFolderConfig:Types.Config.Type = {
  [constants.packageJsonFileName]: {
    exports: {
      [`./${constants.staticFolderName}/*`]: {
        require: `./${constants.staticFolderName}/*`,
      },
    },
    publishConfig: {
			exports: {
				[`./${constants.staticFolderName}/*`]: {
					require: `./${constants.staticFolderName}/*`
				}
			}
		}
  },
};

const withoutStaticFolderConfig = {};*/

/**
 * @type Config
 */
const docGenConfig = {
  [packageJsonFileName]: {
    scripts: {
      docgen: 'docgen',
    },
  },
  [docgenTsConfigFileName]: tsconfigDocgen,
  [docgenConfigFileName]: docgen,
};

/**
 * @type Config
 */
const withoutDocGenConfig = {
  [packageJsonFileName]: {
    scripts: {
      docgen: 'echo "docgen not activated for this package"',
    },
  },
};

/**
 * @param {{
 *   readonly repoName: string;
 *   readonly packageName: string;
 *   readonly description: string;
 *   readonly dependencies: ReadonlyStringRecord;
 *   readonly devDependencies: ReadonlyStringRecord;
 *   readonly internalPeerDependencies: ReadonlyStringRecord;
 *   readonly externalPeerDependencies: ReadonlyStringRecord;
 *   readonly examples: ReadonlyArray<string>;
 *   readonly scripts: ReadonlyStringRecord;
 *   readonly bundled: boolean;
 *   readonly visibility: Visibility;
 *   readonly hasDocGen: boolean;
 *   readonly keywords: ReadonlyArray<string>;
 * }} params
 * @returns {Config}
 */
export default (params) => {
  const {
    repoName,
    packageName,
    description,
    dependencies,
    devDependencies,
    internalPeerDependencies,
    externalPeerDependencies,
    examples,
    scripts,
    bundled,
    visibility,
    hasDocGen,
    keywords,
  } = params;
  return deepMerge(
    bundled ? bundledConfig : transpiledConfig,
    visibilityConfig({ repoName, visibility, keywords }),
    hasDocGen ? docGenConfig : withoutDocGenConfig,
    //hasStaticFolder ? staticFolderConfig : withoutStaticFolderConfig,
    {
      [madgeConfigFileName]: madge,
      [packageJsonFileName]: {
        description,
        module: `./${projectFolderName}/index.js`,
        exports: {
          '.': {
            import: `./${projectFolderName}/index.ts`,
          },
        },
        sideEffects: [],
        dependencies,
        devDependencies: {
          // Include self for tests. Use `file:` not `link:` so binaries get installed
          [`${slashedScope}${packageName}`]: 'link:.',
          ...devDependencies,
        },
        peerDependencies: {
          // Put workspace version of internal peerDependencies
          ...Object.fromEntries(
            Object.keys(internalPeerDependencies).map((depName) => [
              slashedScope + depName,
              devWorkspaceLink(depName),
            ]),
          ),
          ...externalPeerDependencies,
        },
        publishConfig: {
          // Remove scripts in prod
          scripts: {},
          // Remove devDependencies in prod
          devDependencies: {},
          peerDependencies: {
            // Put npm version of internal peerDependencies
            ...Object.fromEntries(
              Object.entries(internalPeerDependencies).map(([depName, depVersion]) => [
                slashedScope + depName,
                depVersion,
              ]),
            ),
            ...externalPeerDependencies,
          },
          // Remove publishConfig in prod
          publishConfig: {},
          // Unset packageManager in prod
          packageManager: '',
          // Remove pnpm in prod
          pnpm: {},
          // Unset type in prod
          type: '',
          exports: {
            '.': {
              import: `./${projectFolderName}/index.js`,
              types: `./${typesFolderName}/index.d.ts`,
            },
          },
        },
        scripts: {
          circular: `madge --extensions ts --circular --no-color --no-spinner ${projectFolderName}`,
          checks: 'pnpm circular && pnpm lint && pnpm tscheck && pnpm test',
          test: 'vitest run',
          'clean-prod': `shx rm -rf ${prodFolderName} && shx mkdir -p ${prodFolderName}`,
          // npm publish ./dist --access=public does not work
          'publish-to-npm': `cd ${prodFolderName} && npm publish --access=public && cd ..`,
          'install-prod': `cd ${prodFolderName} && pnpm i && cd ..`,
          build:
            'pnpm clean-prod && pnpm --if-present pre-build && pnpm compile && pnpm --if-present post-build && pnpm install-prod',
          prodify: 'prodify',
          examples: examples
            .map((exampleName) => `${tsExecuter} ${examplesFolderName}/${exampleName}`)
            .join('&&'),

          ...scripts,
        },
        // Must be present even for private packages as it can be used for other purposes
        repository:
          packageName === repoName ?
            gitRepo(repoName)
          : {
              ...gitRepo(repoName),
              directory: `packages/${packageName}`,
            },
        // Must be present even for private packages as it can be used for instance by docgen
        homepage:
          `https://github.com/${owner}/${repoName}`
          + (packageName === repoName ? '' : `/tree/master/packages/${packageName}`),
      },
    },
  );
};
