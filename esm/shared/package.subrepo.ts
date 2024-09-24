import * as constants from './constants.js';

export default {
	module: `./${constants.projectFolderName}/index.js`,
	exports: {
		'.': {
			import: `./${constants.projectFolderName}/index.ts`
		}
	},
	publishConfig: {
		main: `./${constants.commonJsFolderName}/index.js`,
		types: `./${constants.typesFolderName}/index.d.ts`,
		scripts: {},
		exports: {
			'.': {
				types: `./${constants.typesFolderName}/index.d.ts`,
				import: `./${constants.projectFolderName}/index.js`,
				default: `./${constants.commonJsFolderName}/index.js`
			}
		}
	},
	scripts: {
		circular: `madge --extensions ts --circular --no-color --no-spinner ${constants.projectFolderName}`,
		checks: 'pnpm circular && pnpm lint && pnpm tscheck && pnpm test',
		'lint-fix': 'pnpm lint --fix',
		'lint-rules': 'pnpx @eslint/config-inspector',
		test: 'vitest run',
		'generate-types': `tsc -b ${constants.projectTsConfigFileName} --emitDeclarationOnly`,
		'clean-prod': `shx rm -rf dist && shx rm -rf ${constants.tsBuildInfoFolderName} && shx mkdir -p ${constants.prodFolderName}`,
		prodify: 'prodify',
		// npm publish ./dist --access=public does not work
		'publish-to-npm': `cd ${constants.prodFolderName} && npm publish --access=public && cd ..`,
		'install-prod': `cd ${constants.prodFolderName} && pnpm i && cd ..`,
		docgen: 'docgen'
	}
};
