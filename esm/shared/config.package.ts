import merge from 'deepmerge';
import * as constants from './constants.js';
import docgenConfig from './docgenConfig.js';
import madgercTemplate from './madge.template.js';
import tsconfigDocgen from './tsconfig.docgen.js';

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

const repository = ({
	repoName,
	packageName
}: {
	readonly repoName: string;
	readonly packageName: string;
}) =>
	packageName === repoName ?
		gitRepo(repoName)
	:	{
			...gitRepo(repoName),
			directory: `packages/${packageName}`
		};

const homepage = ({
	repoName,
	packageName
}: {
	readonly repoName: string;
	readonly packageName: string;
}) =>
	`https://github.com/${constants.owner}/${repoName}` +
	(packageName === repoName ? '' : `/tree/master/packages/${packageName}`);

const bundledConfig = {
	[constants.packageJsonFileName]: {
		dependencies: {
			'@effect/experimental': constants.effectExperimentalVersion
		},
		scripts: {
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
			'generate-types': '',
			compile: 'pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate'
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
	packageName,
	visibility,
	keywords
}: {
	readonly repoName: string;
	readonly packageName: string;
	readonly visibility: Visibility.Type;
	readonly keywords: ReadonlyArray<string>;
}) =>
	visibility === Visibility.Type.Private ?
		{
			[constants.packageJsonFileName]: { private: true }
		}
	: visibility === Visibility.Type.Public ?
		{
			[constants.packageJsonFileName]: {
				bugs: {
					url: `https://github.com/${constants.owner}/${repoName}/issues`
				},
				repository: repository({ repoName, packageName }),
				homepage: homepage({ repoName, packageName }),
				funding: [
					{
						type: 'ko-fi',
						url: 'https://ko-fi.com/parischap'
					}
				],
				// Put specific keywords in first position so important keywords come out first
				keywords: [...keywords, 'effect', 'typescript', 'functional-programming']
			}
		}
	: visibility === Visibility.Type.PublicByForce ?
		{
			[constants.packageJsonFileName]: {
				//repository: repository({ repoName, packageName }),
				//homepage: homepage({ repoName, packageName }),
				publishConfig: {
					// Do not publish maps of this package because it should be private
					files: ['*', '!*.map']
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
			docgen: ''
		}
	}
};

export default ({
	repoName,
	packageName,
	bundled,
	visibility,
	hasStaticFolder,
	hasDocGen,
	keywords
}: {
	readonly repoName: string;
	readonly packageName: string;
	readonly bundled: boolean;
	readonly visibility: Visibility.Type;
	readonly hasStaticFolder: boolean;
	readonly hasDocGen: boolean;
	readonly keywords: ReadonlyArray<string>;
}) =>
	merge.all([
		{
			[constants.madgeConfigFileName]: madgercTemplate,
			[constants.packageJsonFileName]: {
				module: `./${constants.projectFolderName}/index.js`,
				exports: {
					'.': {
						import: `./${constants.projectFolderName}/index.ts`
					}
				},
				publishConfig: {
					// Remove scripts in prod
					scripts: {},
					// Remove devDependencies in prod
					devDependencies: {},
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
						'pnpm clean-prod && pnpm pre-build && pnpm compile && pnpm post-build && pnpm generate-types && pnpm install-prod',
					// Checks have to be carried out after build for the configs repo
					'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm'
				}
			}
		},
		bundled ? bundledConfig : transpiledConfig,
		visibilityConfig({ repoName, packageName, visibility, keywords }),
		hasDocGen ? docGenConfig : withoutDocGenConfig,
		hasStaticFolder ? staticFolderConfig : withoutStaticFolderConfig
	]);
