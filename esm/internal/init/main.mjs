import { execSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';

import {
	configStarterDependencies,
	configStarterDevDependencies,
	devDependencies
} from '../dependencies.js';

/* eslint functional/no-expression-statements: off */
try {
	try {
		unlinkSync('tsconfig.json');
	} catch (e) {
		if (typeof e === 'object' && e !== null && 'code' in e && e.code !== 'ENOENT') throw e;
	}

	execSync(
		'pnpm add -D ' +
			Object.entries({
				...devDependencies,
				...configStarterDevDependencies
			})
				.map((entry) => entry.join('@'))
				.join(' ')
	);

	execSync(
		'pnpm add ' +
			Object.entries(configStarterDependencies)
				.map((entry) => entry.join('@'))
				.join(' ') +
			' && pnpm i && pnpm vite-node esm/internal/init/write-files.ts && pnpm i'
	);
} catch (e) {
	console.log(e);
	process.exit(1);
}
