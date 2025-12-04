/**
 * This config implements what is necessary in a package that has code (an esm directory). A package
 * is always composed of a configInternalBase and either of a configInternalProject or a
 * configInternalNoProject. It should not be used directly. It is included by configSubRepo.ts and
 * configOnePackageRepo.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  binariesPath,
  commonJsFolderName,
  docgenConfigFilename,
  docGenDependencies,
  effectDependencies,
  effectPlatformDependencies,
  eslintConfigFilename,
  examplesFolderName,
  madgeConfigFilename,
  owner,
  packageJsonFilename,
  packagesFolderName,
  prodFolderName,
  projectDevDependencies,
  sourceFolderName,
  tsConfigDocGenFilename,
  tsConfigExamplesFilename,
  tsConfigFilename,
  tsConfigOthersFilename,
  tsConfigSrcFilename,
  tsConfigTestsFilename,
  tsExecuter,
  versionControlService,
  viteConfigFilename,
  vitestConfigFilename,
} from '../shared-utils/constants.js';

import type { ReadonlyStringRecord } from '../shared-utils/types.js';
import { deepMerge } from '../shared-utils/utils.js';
import docgenConfig from './docgenConfig.js';
import eslintConfigSrcBrowser from './eslintConfigSrcBrowser.js';
import eslintConfigSrcNode from './eslintConfigSrcNode.js';
import eslintConfigSrcPlain from './eslintConfigSrcPlain.js';
import madgeConfig from './madgeConfig.js';
import projectVitestConfig from './projectVitestConfig.js';
import tsConfig from './tsconfig.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import tsConfigExamples from './tsconfigExamples.js';
import tsConfigOthers from './tsconfigOthers.js';
import tsConfigEsmBrowser from './tsconfigSrcBrowser.js';
import tsConfigEsmNode from './tsconfigSrcNode.js';
import tsConfigEsmPlain from './tsconfigSrcPlain.js';
import tsConfigTests from './tsconfigTests.js';
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
      [viteConfigFilename]: viteConfig(buildMethod),
      [packageJsonFilename]: {
        sideEffects: [],
        scripts: {
          compile:
            // tsc builds but also generate types. All my packages ship with the sideEffects-free key in package.json. And this is perfectly well understood by vite and rollup. So annotate-pure-calls is only necessary for published packages that might be used by clients who use old bundlers. As far as I am concerned, I do not need cjs code. Likewise, this is only necessary for published packages.
            `tsc -b ${tsConfigSrcFilename} --force`
            + (isPublished ?
              ` && babel ${prodFolderName}/${sourceFolderName} --out-dir ${prodFolderName}/${commonJsFolderName}`
              + '--plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs  --source-maps'
            : '')
            + ` && babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`
            + ' && pnpm prodify-lib',
        },
      },
    };
  if (buildMethod === 'Bundle')
    return {
      [viteConfigFilename]: viteConfig(buildMethod),
      [packageJsonFilename]: {
        module: `./${sourceFolderName}/main.js`,
        scripts: {
          bundle: 'bundle-files',
          compile: `pnpm bundle && pnpm prodify-bundle`,
        },
      },
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

const environmentConfig = ({
  packageName,
  environment,
  isConfigsPackage
}: {
  readonly packageName: string;
  readonly environment: string;
  readonly isConfigsPackage:boolean
}) => {
  const base = {
    // Used by the tscheck script
    [tsConfigFilename]: tsConfig,
    // Used by the tsConfig file
    [tsConfigOthersFilename]: tsConfigOthers({isConfigsPackage}),
    // Used by the tsConfig file
    [tsConfigExamplesFilename]: tsConfigExamples,
    // Used by the tsConfig file
    [tsConfigTestsFilename]: tsConfigTests,
  };

  if (environment === 'Browser')
    return {
      ...base,
      // Used by the checks script
      [tsConfigSrcFilename]: tsConfigEsmBrowser,
      // Used by the checks script
      // We don't use any dom specifities because it must run on the server. It's all hidden away in preact
      [eslintConfigFilename]: eslintConfigSrcBrowser,
    };

  if (environment === 'Node')
    return {
      ...base,
      // Used by the checks script
      [tsConfigSrcFilename]: tsConfigEsmNode,
      // Used by the checks script
      [eslintConfigFilename]: eslintConfigSrcNode,
    };

  if (environment === 'Plain')
    return {
      ...base,
      // Used by the checks script
      [tsConfigSrcFilename]: tsConfigEsmPlain,
      // Used by the checks script
      [eslintConfigFilename]: eslintConfigSrcPlain,
    };

  throw new Error(
    `'${packageName}': disallowed value for 'environment' parameter. Actual: '${environment}'`,
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
  environment,
  isPublished,
  hasDocGen,
  keywords,
  useEffectAsPeerDependency,
  useEffectPlatform,
  prefixForAutogeneratedIndex,
  isConfigsPackage,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly dependencies: ReadonlyStringRecord;
  readonly devDependencies: ReadonlyStringRecord;
  readonly peerDependencies: ReadonlyStringRecord;
  readonly examples: ReadonlyArray<string>;
  readonly buildMethod: string;
  readonly environment: string;
  readonly isPublished: boolean;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
  readonly useEffectAsPeerDependency: boolean;
  readonly useEffectPlatform: string;
  readonly prefixForAutogeneratedIndex: string;
  readonly isConfigsPackage: boolean;
}) => {
  const [finalDependencies, finalPeerDependencies] =
    useEffectAsPeerDependency ?
      [dependencies, { ...peerDependencies, ...effectDependencies }]
    : [{ ...dependencies, ...effectDependencies }, peerDependencies];

  return deepMerge(
    {
      // Used by the circular script
      [madgeConfigFilename]: madgeConfig,
      // Used by the test script
      [vitestConfigFilename]: projectVitestConfig(packageName),
      [packageJsonFilename]: {
        module: `./${sourceFolderName}/index.js`,
        ...(Object.keys(finalDependencies).length === 0 ? {} : { dependencies: finalDependencies }),
        ...(Object.keys(finalPeerDependencies).length === 0 ?
          {}
        : { peerDependencies: finalPeerDependencies }),
        devDependencies: {
          /* Include test-utils for tests except if the package is:
          - test-utils because it does not need to inclue itself
          - configs: to avoid circular dependencies
          */
          ...projectDevDependencies,
          ...devDependencies,
        },
        scripts: {
          circular: `madge --extensions ts --circular --no-color --no-spinner ${sourceFolderName}`,
          'clean-prod': `pnpm rmrf ${prodFolderName} && pnpm mkdirp ${prodFolderName}`,
          checks: 'pnpm circular && pnpm tscheck && pnpm lint && pnpm test',
          build: 'pnpm clean-prod && pnpm compile && cd ${prodFolderName} && pnpm i && cd ..',
          examples: examples
            .map((exampleName) => `${tsExecuter} ${examplesFolderName}/${exampleName}`)
            .join('&&'),
          ...(prefixForAutogeneratedIndex === '' ?
            {}
          : {
              'update-imports': `node ${binariesPath(isConfigsPackage)}/update-imports.ts run ${packageName} \
${prefixForAutogeneratedIndex}`,
              'auto-update-imports': `node ${binariesPath(isConfigsPackage)}/update-imports.ts watch ${packageName} \
${prefixForAutogeneratedIndex}`,
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
    environmentConfig({ packageName, environment, isConfigsPackage }),
  );
};
