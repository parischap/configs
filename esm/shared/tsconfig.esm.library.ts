import tsConfigEsm from './tsconfig.esm.js';

export default {
	...tsConfigEsm,
	compilerOptions: {
		...tsConfigEsm.compilerOptions,
		lib: ['ESNext']
	}
};
