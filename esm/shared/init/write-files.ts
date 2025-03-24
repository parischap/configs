import { writeFileSync } from 'node:fs';
import configStarter from '../configStarter.js';
import * as constants from '../constants.js';

try {
	// eslint-disable-next-line functional/no-expression-statements
	writeFileSync(
		constants.packageJsonFileName,
		JSON.stringify(configStarter[constants.packageJsonFileName])
	);
	// eslint-disable-next-line functional/no-expression-statements
	writeFileSync(constants.gitIgnoreFileName, configStarter[constants.gitIgnoreFileName]);
} catch (e) {
	// eslint-disable-next-line functional/no-expression-statements
	console.log(e);
	process.exit(1);
}
