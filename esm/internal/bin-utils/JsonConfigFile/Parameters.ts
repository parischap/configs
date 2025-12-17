/**
 * Module that represents an object whose keys are the allowed parameter names of a project
 * configuration file and whose values are the corresponding JsonConfigFileParameter's (expected
 * type and optional default value)
 */

import { ReadonlyRecord } from '../../shared-utils/types.js';
import * as JsonConfigFileParameter from './Parameter.js';

export interface Type extends ReadonlyRecord<string, JsonConfigFileParameter.Any> {}
