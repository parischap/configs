import { writeFileSync } from 'node:fs';
import * as constants from '../esm/shared/constants.js';
import gitIgnoreTemplate from '../esm/shared/gitignore.template.js';
import packageStarter from '../esm/shared/package.starter.js';

try {
	// eslint-disable-next-line functional/no-expression-statements
	writeFileSync(constants.packageJsonFileName, JSON.stringify(packageStarter));
	// eslint-disable-next-line functional/no-expression-statements
	writeFileSync(constants.gitIgnoreFileName, gitIgnoreTemplate);
} catch (e) {
	// eslint-disable-next-line functional/no-expression-statements
	console.log(e);
	process.exit(1);
}
