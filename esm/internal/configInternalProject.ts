/**
 * This config implements what is necessary in a package that has code (an esm directory). It should
 * not be used directly. It is included by configSubRepo.ts and configOnePackageRepo.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  commonJsFolderName,
  configsPackageName,
  docgenConfigFilename,
  docGenDependencies,
  effectDependencies,
  effectPlatformDependencies,
  examplesFolderName,
  generateIndexFilename,
  madgeConfigFilename,
  owner,
  packageDevDependencies,
  packageJsonFilename,
  packagesFolderName,
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
import type { ReadonlyStringRecord } from '../types.js';
import { deepMerge } from '../utils.js';
import docgenConfig from './docgenConfig.js';
import generateIndexConfig from './generateIndexConfig.js';
import madgeConfig from './madgeConfig.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import viteConfig from './viteConfig.js';

const buildConfig = ({
  buildMethod,
  isPublished,
  packageName,
}: {
  readonly buildMethod: string;
  readonly isPublished: boolean;
  readonly packageName: string;
}) => {
  if (buildMethod === 'None') return {};

  if (buildMethod === 'Transpile')
    return {
      [packageJsonFilename]: {
        sideEffects: [],
        scripts: {
          compile:
            // tsc builds but also generate types. All my packages ship with the sideEffects-free key in package.json. And this is perfectly well understood by vite and rollup. So annotate-pure-calls is only necessary for published packages that might be used by clients who use old bundlers. As far as I am concerned, I do not need cjs code. Likewise, this is only necessary for published packages.
            `tsc -b ${tsConfigProjectFilename} --force`
            + (isPublished ?
              ` && babel ${prodFolderName}/${projectFolderName} --out-dir ${prodFolderName}/${commonJsFolderName}`
              + '--plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs  --source-maps'
            : '')
            + ` && babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`
            + ' && pnpm prodify-lib',
        },
      },
    };
  if (buildMethod === 'Bundle')
    return {
      [packageJsonFilename]: {
        module: `./${projectFolderName}/main.js`,
        scripts: {
          bundle: 'bundle-files',
          compile: `pnpm bundle && pnpm prodify-bundle`,
        },
      },
      [viteConfigFilename]: viteConfig(buildMethod),
    };

  // 'BundleWithDeps' , 'AppClient'
  throw new Error(
    `'${packageName}': disallowed value for 'buildMethod' parameter. Actual: '${buildMethod}'`,
  );
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

const platformConfig = ({
  packageName,
  useEffectPlatform,
}: {
  readonly packageName: string;
  readonly useEffectPlatform: string;
}) => {
  if (useEffectPlatform === 'No') return {};

  if (useEffectPlatform === 'AsDependency')
    return {
      [packageJsonFilename]: {
        dependencies: effectPlatformDependencies,
      },
    };

  if (useEffectPlatform === 'AsPeerDependency')
    return {
      [packageJsonFilename]: {
        peerDependencies: effectPlatformDependencies,
      },
    };

  throw new Error(
    `'${packageName}': disallowed value for 'useEffectPlatform' parameter. Actual: '${useEffectPlatform}'`,
  );
};

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
  useEffectAsPeerDependency,
  useEffectPlatform,
  prefixForAutogeneratedIndex,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly dependencies: ReadonlyStringRecord;
  readonly devDependencies: ReadonlyStringRecord;
  readonly peerDependencies: ReadonlyStringRecord;
  readonly examples: ReadonlyArray<string>;
  readonly buildMethod: string;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
  readonly useEffectAsPeerDependency: boolean;
  readonly useEffectPlatform: string;
  readonly prefixForAutogeneratedIndex: string;
}) =>
  deepMerge(
    {
      // Used by the generate-index and auto-generate-index scripts
      ...(prefixForAutogeneratedIndex === '' ?
        {}
      : { [generateIndexFilename]: generateIndexConfig(prefixForAutogeneratedIndex) }),
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
          ...(useEffectAsPeerDependency ? {} : effectDependencies),
          ...dependencies,
        },
        devDependencies: {
          // Include self for tests
          [`${slashedScope}${packageName}`]: `sourceInDev=WORKSPACE&buildStageInDev=DEV&parent=${repoName}`,
          /*
           * Include test-utils to handle tests except in the configs package because the first time I build configs test-utils does not exist yet
           */
          ...(packageName === configsPackageName ?
            {}
          : {
              [`${slashedScope}${testUtilsPackageName}`]: 'sourceInDev=AUTO&buildStageInDev=DEV',
            }),
          ...packageDevDependencies,
          ...devDependencies,
        },
        peerDependencies: {
          ...(useEffectAsPeerDependency ? effectDependencies : {}),
          ...peerDependencies,
        },
        scripts: {
          circular: `madge --extensions ts --circular --no-color --no-spinner ${projectFolderName}`,
          test: 'vitest run',
          'clean-prod': `pnpm rmrf ${prodFolderName} && pnpm mkdirp ${prodFolderName}`,
          build: 'pnpm clean-prod && pnpm compile && cd ${prodFolderName} && pnpm i && cd ..',
          examples: examples
            .map((exampleName) => `${tsExecuter} ${examplesFolderName}/${exampleName}`)
            .join('&&'),
          ...(prefixForAutogeneratedIndex === '' ?
            {}
          : {
              'generate-index': 'node --experimental-transform-types generateIndex.ts run',
              'auto-generate-index': 'node --experimental-transform-types generateIndex.ts watch',
            }),
        },
        // Must be present even for private packages as it can be used for other purposes
        repository: {
          type: 'git',
          // Use git+https protocol as specified in npm documentation
          url: `git+https://${versionControlService}/${owner}/${repoName}.git`,
          ...(packageName === repoName ?
            {}
          : {
              directory: `${packagesFolderName}/${packageName}`,
            }),
        },
        // Must be present even for private packages as it can be used for instance by docgen
        homepage:
          // Use https protocol as specified in npm documentation
          `https://${versionControlService}/${owner}/${repoName}`
          + (packageName === repoName ? '' : `/tree/master/${packagesFolderName}/${packageName}`),
      },
    },
    buildConfig({ packageName, buildMethod, isPublished }),
    visibilityConfig({ repoName, isPublished, keywords }),
    docGenConfig(hasDocGen),
    platformConfig({ packageName, useEffectPlatform }),
  );
