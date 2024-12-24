import * as constants from './constants.js';
export default {
	publishConfig: {
		main: `./${constants.commonJsFolderName}/index.js`,
		types: `./${constants.typesFolderName}/index.d.ts`,
		exports: {
			'.': {
				types: `./${constants.typesFolderName}/index.d.ts`,
				import: `./${constants.projectFolderName}/index.js`,
				default: `./${constants.commonJsFolderName}/index.js`
			}
		}
	},
	scripts: {
		'transpile-esm': `tsc -b ${constants.projectTsConfigFileName}`,
		'transpile-cjs': `babel ${constants.prodFolderName}/${constants.projectFolderName} --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir ${constants.prodFolderName}/${constants.commonJsFolderName} --source-maps`,
		'transpile-annotate': `babel ${constants.prodFolderName} --plugins annotate-pure-calls --out-dir ${constants.prodFolderName} --source-maps`,
		build: `pnpm clean-prod && pnpm transpile-esm && pnpm transpile-cjs && pnpm transpile-annotate && cross-env IS_LIBRARY=true prodify && pnpm install-prod`,
		'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm'
	}
};
