/**
 * This config implements what is necessary in a package that needs building. It should not be used
 * directly. It is included by config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// Whatever external package this file uses must be added as peerDependency
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
} from "./constants.js";
import docgen from "./docgen.js";
import madge from "./madge.js";
import tsconfigDocgen from "./tsconfigDocgen.js";
import { deepMerge, devWorkspaceLink } from "./utils.js";
/**
 * @import {Visibility, Config, ReadonlyRecord, ReadonlyStringRecord} from "./types.d.ts"
 */

/**
 * @param {string} repoName
 * @param {string} packageName
 * @returns {ReadonlyRecord}
 */
const repository = (repoName, packageName) => ({
  type: "git",
  url: `git+https://github.com/${owner}/${repoName}.git`,
  ...(packageName === repoName
    ? {}
    : {
        directory: `packages/${packageName}`,
      }),
});

/**
 * @type Config
 */
const bundledConfig = {
  [packageJsonFileName]: {
    module: `./${projectFolderName}/main.js`,
    dependencies: {
      "@effect/experimental": "^0.56.0",
    },
    scripts: {
      bundle: "bundle-files",
      compile: `pnpm bundle && pnpm prodify`,
    },
  },
};

/**
 * @type Config
 */
const transpiledConfig = {
  [packageJsonFileName]: {
    module: `./${projectFolderName}/index.js`,
    sideEffects: [],
    publishConfig: {
      main: `./${commonJsFolderName}/index.js`,
      types: `./${typesFolderName}/index.d.ts`,
      exports: {
        ".": {
          types: `./${typesFolderName}/index.d.ts`,
          default: `./${commonJsFolderName}/index.js`,
        },
      },
    },
    scripts: {
      // transpile-esm builds but also generate types
      "transpile-esm": `tsc -b ${projectTsConfigFileName} --force`,
      "transpile-cjs": `babel ${prodFolderName}/${projectFolderName} --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir ${prodFolderName}/${commonJsFolderName} --source-maps`,
      "transpile-annotate": `babel ${prodFolderName} --plugins annotate-pure-calls --out-dir ${prodFolderName} --source-maps`,
      compile:
        "pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate && pnpm prodify",
    },
  },
};

/**
 * @type
 * ({ repoName, visibility, keywords }: { readonly repoName: string; readonly visibility:
 *   Visibility; readonly keywords: ReadonlyArray<string>; })=> Config
 */
const visibilityConfig = ({ repoName, visibility, keywords }) =>
  visibility === "Private"
    ? {
        [packageJsonFileName]: {
          private: true,
          scripts: {
            // Do not use an empty string because it gets wiped out by prodify
            "build-and-publish": 'echo "private package cannot be published"',
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
              type: "ko-fi",
              url: "https://ko-fi.com/parischap",
            },
          ],
          // Put specific keywords in first position so important keywords come out first
          keywords: [
            ...keywords,
            "effect",
            "typescript",
            "functional-programming",
          ],
          scripts: {
            // Checks have to be carried out after build for the configs repo
            "build-and-publish":
              "pnpm build && pnpm checks && pnpm publish-to-npm",
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
      docgen: "docgen",
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

  const prodInternalPeerDependencies = {
    // Put npm version of internal peerDependencies
    ...Object.fromEntries(
      Object.entries(internalPeerDependencies).map(([depName, depVersion]) => [
        slashedScope + depName,
        depVersion,
      ])
    ),
  };

  return deepMerge(
    {
      [madgeConfigFileName]: madge,
      [packageJsonFileName]: {
        description,
        ...(Object.keys(dependencies).length === 0 ? {} : { dependencies }),
        exports: {
          ".": {
            import: `./${projectFolderName}/index.js`,
          },
        },
        devDependencies: {
          /** Include self for tests. `link:` is better than `file:` so we don't need to run `pnpm i` whenever we make a modification */
          [`${slashedScope}${packageName}`]: "link:.",
          ...devDependencies,
        },
        ...(Object.keys(internalPeerDependencies).length === 0 &&
        Object.keys(externalPeerDependencies).length === 0
          ? {}
          : {
              peerDependencies: {
                // Put workspace version of internal peerDependencies
                ...Object.fromEntries(
                  Object.keys(internalPeerDependencies).map((depName) => [
                    slashedScope + depName,
                    devWorkspaceLink(depName),
                  ])
                ),
                ...externalPeerDependencies,
              },
            }),
        publishConfig: {
          ...(Object.keys(prodInternalPeerDependencies).length === 0
            ? {}
            : { peerDependencies: prodInternalPeerDependencies }),
        },
        scripts: {
          circular: `madge --extensions ts --circular --no-color --no-spinner ${projectFolderName}`,
          checks: "pnpm circular && pnpm lint && pnpm tscheck && pnpm test",
          test: "vitest run",
          "clean-prod": `shx rm -rf ${prodFolderName} && shx mkdir -p ${prodFolderName}`,
          // npm publish ./dist --access=public does not work
          "publish-to-npm": `cd ${prodFolderName} && npm publish --access=public && cd ..`,
          "install-prod": `cd ${prodFolderName} && pnpm i && cd ..`,
          build:
            "pnpm clean-prod && pnpm --if-present pre-build && pnpm compile && pnpm --if-present post-build && pnpm install-prod",
          prodify: "prodify",
          examples: examples
            .map(
              (exampleName) =>
                `${tsExecuter} ${examplesFolderName}/${exampleName}`
            )
            .join("&&"),

          ...scripts,
        },
        // Must be present even for private packages as it can be used for other purposes
        repository: repository(repoName, packageName),
        // Must be present even for private packages as it can be used for instance by docgen
        homepage:
          `https://github.com/${owner}/${repoName}` +
          (packageName === repoName
            ? ""
            : `/tree/master/packages/${packageName}`),
        devEngines: {
          runtime: {
            name: "node",
            onFail: "error",
          },
          packageManager: {
            name: "pnpm",
            onFail: "error",
          },
        },
      },
    },
    // Put transpiledConfig after general config because `default` exports needs to be last in publishConfig exports
    bundled ? bundledConfig : transpiledConfig,
    visibilityConfig({ repoName, visibility, keywords }),
    hasDocGen ? docGenConfig : withoutDocGenConfig
    //hasStaticFolder ? staticFolderConfig : withoutStaticFolderConfig,
  );
};
