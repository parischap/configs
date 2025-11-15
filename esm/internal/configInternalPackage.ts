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
  docGenDependencies,
  effectDependencies,
  examplesFolderName,
  madgeConfigFilename,
  owner,
  packageDevDependencies,
  packageJsonFilename,
  prodFolderName,
  projectFolderName,
  slashedScope,
  testUtilsPackageName,
  tsConfigDocGenFilename,
  tsConfigProjectFilename,
  tsExecuter,
  versionControlService,
  viteConfigFilename,
} from '../constants.js';
import type { BuildMethod, ReadonlyStringRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import docgenConfig from './docgenConfig.js';
import madgeConfig from './madgeConfig.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import viteConfig from './viteConfig.js';

const repository = (repoName: string, packageName: string) => ({
  type: 'git',
  url: `git+https://${versionControlService}/${owner}/${repoName}.git`,
  ...(packageName === repoName ?
    {}
  : {
      directory: `packages/${packageName}`,
    }),
});

const buildConfig = ({
  buildMethod,
  isPublished,
}: {
  readonly buildMethod: BuildMethod;
  readonly isPublished: boolean;
}) =>
  buildMethod === 'Transpile' ?
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
      [viteConfigFilename]: viteConfig(buildMethod),
    };

const visibilityConfig = ({
  repoName,
  isPublished,
  keywords,
}: {
  readonly repoName: string;
  readonly isPublished: boolean;
  readonly keywords: ReadonlyArray<string>;
}) =>
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
          // Called by the publish github action defined in configInternalRepo.ts/
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

const docGenConfig = (hasDocGen: boolean) =>
  hasDocGen ?
    {
      [packageJsonFilename]: {
        scripts: {
          docgen: 'docgen',
        },
        devDependencies: docGenDependencies,
      },
      [tsConfigDocGenFilename]: tsconfigDocgen,
      [docgenConfigFilename]: docgenConfig,
    }
  : {};

export default ({
  repoName,
  packageName,
  dependencies,
  devDependencies,
  peerDependencies,
  examples,
  buildMethod,
  isPublished,
  hasDocGen,
  keywords,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly dependencies: ReadonlyStringRecord;
  readonly devDependencies: ReadonlyStringRecord;
  readonly peerDependencies: ReadonlyStringRecord;
  readonly examples: ReadonlyArray<string>;
  readonly buildMethod: BuildMethod;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
}) =>
  deepMerge(
    {
      // Used by the circular script
      [madgeConfigFilename]: madgeConfig,
      [packageJsonFilename]: {
        module: `./${projectFolderName}/index.js`,
        exports: {
          '.': {
            // import .js so it does not need to be changed after build
            import: `./${projectFolderName}/index.js`,
          },
          './tests': {
            import: `./${projectFolderName}/index.tests.js`,
          },
        },
        dependencies: {
          ...effectDependencies,
          ...dependencies,
        },
        devDependencies: {
          // Include self for tests. Use link: not file: so changes get immediately reflected
          [`${slashedScope}${packageName}`]: 'SELF',
          /**
           * Include test-utils to handle tests except
           *
           * - in the configs package because the first time I build configs test-utils does not exist
           *   yet
           * - in the test-utils package because it already includes itself for tests
           */
          ...(packageName === configsPackageName || packageName === testUtilsPackageName ?
            {}
          : {
              [`${slashedScope}${testUtilsPackageName}`]:
                "sourceInProd='GITHUB'&versionInProd=''&parent=''&buildTypeInProd='DEV'&buildTypeInDev='DEV'",
            }),
          ...packageDevDependencies,
          ...devDependencies,
        },
        peerDependencies,
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
          `https://${versionControlService}/${owner}/${repoName}`
          + (packageName === repoName ? '' : `/tree/master/packages/${packageName}`),
      },
    },
    buildConfig({ buildMethod, isPublished }),
    visibilityConfig({ repoName, isPublished, keywords }),
    docGenConfig(hasDocGen),
  );
