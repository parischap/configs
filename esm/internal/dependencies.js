// This file must not use any typescript specific grammar bacause it needs to be executed by node

export const devDependencies = {
	'ts-deepmerge': '^7.0.3',
	globals: '^16.4.0',
	'@tsconfig/strictest': '^2.0.6',
	shx: '^0.4.0',
	'@parischap/configs': 'latest',
	'@parischap/test-utils': '^0.10.0',
	'@types/node': '^24.7.0',
	eslint: '^9.37.0',
	'@eslint/eslintrc': '^3.3.1',
	'@eslint/js': '^9.37.0',
	'eslint-config-prettier': '^10.1.8',
	'eslint-plugin-functional': '^9.0.2',
	'eslint-plugin-yml': '^1.19.0',
	'@eslint/markdown': '^7.3.0',
	'@html-eslint/eslint-plugin': '^0.47.0',
	'@html-eslint/parser': '^0.47.0',
	'@eslint/json': '^0.13.2',
	prettier: '^3.6.2',
	typescript: '^5.9.3',
	// tsx must be installed because it is used by docgen and not requested as a dev-dependency
	tsx: '^4.20.6',
	'typescript-eslint': '^8.45.0',
	// vite and vite-node are included by vitest and vite is included by vite-node. Make sure that vitest an
	vitest: '^3.2.4',
	vite: '^7.1.9',
	'vite-node': '^3.2.4',
	madge: '^8.0.0',
	'@babel/core': '^7.28.4',
	'@babel/plugin-transform-export-namespace-from': '^7.27.1',
	'@babel/plugin-transform-modules-commonjs': '^7.27.1',
	'babel-plugin-annotate-pure-calls': '^0.5.0',
	'@babel/cli': '^7.28.3',
	'@effect/docgen': '^0.5.2',
	'prettier-plugin-jsdoc': '^1.3.3'
	//'eslint-plugin-import': 'latest',
	//'@typescript-eslint/parser': 'latest',
	//'eslint-import-resolver-typescript': 'latest',
};

export const configStarterDevDependencies = {
	'@eslint/core': '^0.16.0',
	'@types/eslint': '^9.6.1',
	'@types/eslint-config-prettier': '^6.11.3'
};

export const configStarterDependencies = {
	minimatch: '^10.0.3',
	effect: '^3.18.1',
	'@effect/platform': '^0.92.1',
	'@effect/platform-node': '^0.98.3',
	'ts-deepmerge': '^7.0.3'
};
