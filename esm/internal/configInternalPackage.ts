/**
 * This config implements what is necessary in a package that needs building. It should not be used
 * directly. It is included by config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  commonJsFolderName,
  configsPackageName,
  docgenConfigFilename,
  effectDependencies,
  examplesFolderName,
  madgeConfigFilename,
  owner,
  packageJsonFilename,
  prodFolderName,
  projectFolderName,
  slashedDevScope,
  slashedScope,
  tsConfigDocGenFilename,
  tsConfigProjectFilename,
  tsExecuter,
  viteConfigFilename,
} from '../constants.js';
import type { Config, PackageType, ReadonlyRecord, ReadonlyStringRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import docgenConfig from './docgenConfig.js';
import madgeConfig from './madgeConfig.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import viteConfig from './viteConfig.js';

const repository = (repoName: string, packageName: string): ReadonlyRecord => ({
  type: 'git',
  url: `git+https://github.com/${owner}/${repoName}.git`,
  ...(packageName === repoName ?
    {}
  : {
      directory: `packages/${packageName}`,
    }),
});

const buildConfig = ({
  packageType,
  isPublished,
}: {
  readonly packageType: PackageType;
  readonly isPublished: boolean;
}): Config =>
  packageType === 'Library' ?
    {
      [packageJsonFilename]: {
        sideEffects: [],
        scripts: {
          compile:
            // tsc builds but also generate types
            `tsc -b ${tsConfigProjectFilename} --force`
            + (isPublished ?
              ` && babel ${prodFolderName}/${projectFolderName} --out-dir ${prodFolderName}/${commonJsFolderName}`
              + '--plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs  --source-maps'
            : '')
            + ` && babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`
            + ' && pnpm prodify-lib',
        },
      },
    }
  : {
      [packageJsonFilename]: {
        module: `./${projectFolderName}/main.js`,
        scripts: {
          bundle: 'bundle-files',
          compile: `pnpm bundle && pnpm prodify-bundle`,
        },
      },
      [viteConfigFilename]: viteConfig(packageType),
    };

const visibilityConfig = ({
  repoName,
  isPublished,
  keywords,
}: {
  readonly repoName: string;
  readonly isPublished: boolean;
  readonly keywords: ReadonlyArray<string>;
}): Config =>
  isPublished ?
    {
      [packageJsonFilename]: {
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
    }
  : {
      [packageJsonFilename]: {
        private: true,
      },
    };

const docGenConfig = (hasDocGen: boolean): Config =>
  hasDocGen ?
    {
      [packageJsonFilename]: {
        scripts: {
          docgen: 'docgen',
        },
      },
      [tsConfigDocGenFilename]: tsconfigDocgen,
      [docgenConfigFilename]: docgenConfig,
    }
  : {};
const _default = ({
  repoName,
  packageName,
  dependencies,
  devDependencies,
  internalPeerDependencies,
  externalPeerDependencies,
  examples,
  packageType,
  isPublished,
  hasDocGen,
  keywords,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly dependencies: ReadonlyStringRecord;
  readonly devDependencies: ReadonlyStringRecord;
  readonly internalPeerDependencies: ReadonlyStringRecord;
  readonly externalPeerDependencies: ReadonlyStringRecord;
  readonly examples: ReadonlyArray<string>;
  readonly packageType: PackageType;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
}): Config => {
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
      [madgeConfigFilename]: madgeConfig,
      [packageJsonFilename]: {
        module: `./${projectFolderName}/index.js`,
        exports: {
          '.': {
            import: `./${projectFolderName}/index.ts`,
          },
        },
        dependencies: {
          ...effectDependencies,
          ...dependencies,
        },
        devDependencies: {
          // Include self in dev version for tests if not already included.
          ...(packageName === configsPackageName ?
            {}
          : {
              [`${slashedScope}${packageName}`]: `workspace:${slashedDevScope}${packageName}@*`,
            }),
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
          build: 'pnpm clean-prod && pnpm compile && cd ${prodFolderName} && pnpm i && cd ..',
          examples: examples
            .map((exampleName) => `${tsExecuter} ${examplesFolderName}/${exampleName}`)
            .join('&&'),
        },
        // Must be present even for private packages as it can be used for other purposes
        repository: repository(repoName, packageName),
        // Must be present even for private packages as it can be used for instance by docgen
        homepage:
          `https://github.com/${owner}/${repoName}`
          + (packageName === repoName ? '' : `/tree/master/packages/${packageName}`),
      },
    },
    buildConfig({ packageType, isPublished }),
    visibilityConfig({ repoName, isPublished, keywords }),
    docGenConfig(hasDocGen),
  );
};

export default _default;
