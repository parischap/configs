/**
 * This config implements what is necessary in a package that needs building. It should not be used
 * directly. It is included by config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
import { Array, pipe, Record, Tuple } from 'effect';
import { merge } from 'ts-deepmerge';
import * as constants from './constants.js';
import docgenConfig from './docgenConfig.js';
import madgercTemplate from './madgeTemplate.js';
import tsconfigDocgen from './tsconfigDocgen.js';
import { devWorkspaceLink } from './utils.js';

export namespace Visibility {
	export enum Type {
		Public = 0,
		// This package should be private, but it has to be made public for technical reasons
		PublicByForce = 1,
		Private = 2
	}
}

const gitRepo = (repoName: string) => ({
	type: 'git',
	url: `git+https://github.com/${constants.owner}/${repoName}.git`
});

const bundledConfig = {
	[constants.packageJsonFileName]: {
		dependencies: {
			'@effect/experimental': constants.effectExperimentalVersion
		},
		scripts: {
			bundle: 'bundle-files',
			// generate types even when bundling because they can be useful as in the Configs package
			'generate-types': `tsc -b ${constants.projectTsConfigFileName} --emitDeclarationOnly`,
			compile: 'pnpm bundle && pnpm prodify'
		},
		sideEffects: false,
		publishConfig: {
			exports: {
				'.': {
					types: `./${constants.typesFolderName}/index.d.ts`
				}
			},
			// Remove dependencies in prod because they have been bundled
			dependencies: {},
			// Unset sideEffects in prod
			sideEffects: []
		}
	}
};

const transpiledConfig = {
	[constants.packageJsonFileName]: {
		scripts: {
			'transpile-esm': `tsc -b ${constants.projectTsConfigFileName}`,
			'transpile-cjs': `babel ${constants.prodFolderName}/${constants.projectFolderName} --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir ${constants.prodFolderName}/${constants.commonJsFolderName} --source-maps`,
			'transpile-annotate': `babel ${constants.prodFolderName} --plugins annotate-pure-calls --out-dir ${constants.prodFolderName} --source-maps`,
			compile: 'pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate && pnpm prodify'
		},
		publishConfig: {
			main: `./${constants.commonJsFolderName}/index.js`,
			types: `./${constants.typesFolderName}/index.d.ts`,
			exports: {
				'.': {
					default: `./${constants.commonJsFolderName}/index.js`
				}
			}
			// Do not unset sideEffects for libraries as the consumers of these libraries might use WebPack
		}
	}
};

const visibilityConfig = ({
	repoName,
	visibility,
	keywords
}: {
	readonly repoName: string;
	readonly visibility: Visibility.Type;
	readonly keywords: ReadonlyArray<string>;
}) =>
	visibility === Visibility.Type.Private ?
		{
			[constants.packageJsonFileName]: {
				private: true,
				scripts: {
					// Do not use an empty string because it gets wiped out by prodify
					'build-and-publish': 'echo "private package cannot be published"'
				}
			}
		}
	: visibility === Visibility.Type.Public ?
		{
			[constants.packageJsonFileName]: {
				bugs: {
					url: `https://github.com/${constants.owner}/${repoName}/issues`
				},
				funding: [
					{
						type: 'ko-fi',
						url: 'https://ko-fi.com/parischap'
					}
				],
				// Put specific keywords in first position so important keywords come out first
				keywords: [...keywords, 'effect', 'typescript', 'functional-programming'],
				scripts: {
					// Checks have to be carried out after build for the configs repo
					'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm'
				}
			}
		}
	: visibility === Visibility.Type.PublicByForce ?
		{
			[constants.packageJsonFileName]: {
				publishConfig: {
					// Do not publish maps of this package because it should be private
					files: ['*', '!*.map']
				},
				scripts: {
					// Checks have to be carried out after build for the configs repo
					'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm'
				}
			}
		}
	:	{};

const staticFolderConfig = {
	[constants.packageJsonFileName]: {
		exports: {
			[`./${constants.staticFolderName}/*`]: {
				require: `./${constants.staticFolderName}/*`
			}
		}
		/*publishConfig: {
			exports: {
				[`./${constants.staticFolderName}/*`]: {
					require: `./${constants.staticFolderName}/*`
				}
			}
		}*/
	}
};

const withoutStaticFolderConfig = {};

const docGenConfig = {
	[constants.packageJsonFileName]: {
		scripts: {
			docgen: 'docgen'
		}
	},
	[constants.docgenTsConfigFileName]: tsconfigDocgen,
	[constants.docgenConfigFileName]: docgenConfig
};

const withoutDocGenConfig = {
	[constants.packageJsonFileName]: {
		scripts: {
			docgen: 'echo "docgen not activated for this package"'
		}
	}
};

export default ({
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
	hasStaticFolder,
	hasDocGen,
	keywords
}: {
	readonly repoName: string;
	readonly packageName: string;
	readonly description: string;
	readonly dependencies: Record.ReadonlyRecord<string, string>;
	readonly devDependencies: Record.ReadonlyRecord<string, string>;
	readonly internalPeerDependencies: Record.ReadonlyRecord<string, string>;
	readonly externalPeerDependencies: Record.ReadonlyRecord<string, string>;
	readonly examples: ReadonlyArray<string>;
	readonly scripts: Record.ReadonlyRecord<string, string>;
	readonly bundled: boolean;
	readonly visibility: Visibility.Type;
	readonly hasStaticFolder: boolean;
	readonly hasDocGen: boolean;
	readonly keywords: ReadonlyArray<string>;
}) =>
	merge(
		bundled ? bundledConfig : transpiledConfig,
		visibilityConfig({ repoName, visibility, keywords }),
		hasDocGen ? docGenConfig : withoutDocGenConfig,
		hasStaticFolder ? staticFolderConfig : withoutStaticFolderConfig,
		{
			[constants.madgeConfigFileName]: madgercTemplate,
			[constants.packageJsonFileName]: {
				description,
				module: `./${constants.projectFolderName}/index.js`,
				exports: {
					'.': {
						import: `./${constants.projectFolderName}/index.ts`
					}
				},
				dependencies,
				devDependencies: {
					// Include self for tests
					[`${constants.slashedScope}${packageName}`]: 'link:.',
					...devDependencies
				},
				peerDependencies: {
					...Record.mapEntries(internalPeerDependencies, (_, depName) =>
						Tuple.make(constants.slashedScope + depName, devWorkspaceLink(depName))
					),
					...externalPeerDependencies
				},
				publishConfig: {
					// Remove scripts in prod
					scripts: {},
					// Remove devDependencies in prod
					devDependencies: {},
					// Put version number of internal dependencies
					peerDependencies: {
						...Record.mapKeys(
							internalPeerDependencies,
							(depName) => constants.slashedScope + depName
						),

						...externalPeerDependencies
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
							import: `./${constants.projectFolderName}/index.js`,
							types: `./${constants.typesFolderName}/index.d.ts`
						}
					}
				},
				scripts: {
					circular: `madge --extensions ts --circular --no-color --no-spinner ${constants.projectFolderName}`,
					checks: 'pnpm circular && pnpm lint && pnpm tscheck && pnpm test',
					test: 'vitest run',
					'clean-prod': `shx rm -rf dist && shx rm -rf ${constants.tsBuildInfoFolderName} && shx mkdir -p ${constants.prodFolderName}`,
					// npm publish ./dist --access=public does not work
					'publish-to-npm': `cd ${constants.prodFolderName} && npm publish --access=public && cd ..`,
					'install-prod': `cd ${constants.prodFolderName} && pnpm i && cd ..`,
					build:
						'pnpm clean-prod && pnpm --if-present pre-build && pnpm compile && pnpm --if-present post-build && pnpm --if-present generate-types && pnpm install-prod',
					prodify: 'prodify',
					examples: pipe(
						examples,
						Array.map(
							(exampleName) =>
								`${constants.tsExecuter} ${constants.examplesFolderName}/${exampleName}`
						),
						Array.join('&&')
					),
					...scripts
				},
				// Must be present even for private packages as it can be used for other purposes
				repository:
					packageName === repoName ?
						gitRepo(repoName)
					:	{
							...gitRepo(repoName),
							directory: `packages/${packageName}`
						},
				// Must be present even for private packages as it can be used for instance by docgen
				homepage:
					`https://github.com/${constants.owner}/${repoName}` +
					(packageName === repoName ? '' : `/tree/master/packages/${packageName}`)
			}
		}
	);
