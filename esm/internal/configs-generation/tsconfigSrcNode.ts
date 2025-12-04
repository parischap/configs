// This module must not import any external dependency. It must be runnable without a package.json
import type { ReadonlyRecord } from '../shared-utils/types.js';
import tsConfigSrc from './tsconfigSrc.js';

export default tsConfigSrc satisfies ReadonlyRecord;
