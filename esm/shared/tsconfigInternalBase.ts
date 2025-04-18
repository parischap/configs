export default {
	$schema: 'https://json.schemastore.org/tsconfig',
	_version: '20.1.0',
	extends: ['@tsconfig/strictest/tsconfig.json', '@tsconfig/node20/tsconfig.json'],
	compilerOptions: {
		allowJs: false,
		checkJs: false,
		moduleDetection: 'force',
		composite: true,
		resolveJsonModule: true,
		esModuleInterop: false,
		declaration: true,
		skipLibCheck: true,
		emitDecoratorMetadata: true,
		experimentalDecorators: true,
		moduleResolution: 'NodeNext',
		isolatedModules: true,
		sourceMap: true,
		declarationMap: true,
		noEmitOnError: false,
		noErrorTruncation: true,
		target: 'ES2022',
		module: 'NodeNext',
		incremental: true,
		removeComments: false,
		lib: [],
		// Do not use types (in particular node types) unless included explicitely
		types: [],
		plugins: [
			{
				name: '@effect/language-service'
			}
		]
	}
};
