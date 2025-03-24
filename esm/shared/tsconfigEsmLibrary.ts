import tsConfigEsm from './tsconfigEsm.js';

export default {
	...tsConfigEsm,
	compilerOptions: {
		...tsConfigEsm.compilerOptions,
		lib: ['ESNext']
	}
};
