export default {
	packageManager: 'pnpm@9.11.0',
	devDependencies: {
		'@tsconfig/node20': 'latest',
		'@tsconfig/strictest': 'latest',
		shx: 'latest',
		deepmerge: 'latest',
		'@eslint/eslintrc': 'latest',
		'@eslint/js': 'latest',
		'@html-eslint/eslint-plugin': 'latest',
		'@html-eslint/parser': 'latest',
		'@types/eslint': 'latest',
		'@types/eslint-config-prettier': 'latest',
		//'@types/eslint-plugin-markdown': 'latest',
		'@types/eslint__eslintrc': 'latest',
		'@types/eslint__js': 'latest',
		'@types/node': 'latest',
		'cross-env': 'latest',
		eslint: 'latest',
		'eslint-config-prettier': 'latest',
		'eslint-plugin-functional': 'latest',
		//'eslint-plugin-markdown': 'latest',
		'eslint-plugin-yml': 'latest',
		prettier: 'latest',
		typescript: 'latest',
		'typescript-eslint': 'latest',
		vite: 'latest',
		'vite-node': 'latest',
		vitest: 'latest',
		madge: 'latest',
		terser: 'latest',
		'@babel/core': 'latest',
		'@babel/plugin-transform-export-namespace-from': 'latest',
		'@babel/plugin-transform-modules-commonjs': 'latest',
		'babel-plugin-annotate-pure-calls': 'latest',
		'@babel/cli': 'latest',
		'@effect/docgen': 'https://github.com/parischap/docgenbuilt',
		'prettier-plugin-jsdoc': 'latest',
		tsx: 'latest'
		//'eslint-plugin-import': 'latest',
		//'@typescript-eslint/parser': 'latest',
		//'eslint-import-resolver-typescript': 'latest'
	},
	pnpm: {
		patchedDependencies: {},
		overrides: {
			'tsconfig-paths': '^4.0.0'
		}
	},
	scripts: {
		docgen: 'pnpm --recursive --parallel docgen && compile-docs'
	}
};
