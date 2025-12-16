/**
 * Module that represents an object whose keys are the allowed parameter names of a configuration
 * file and whose values are the corresponding ParamDescriptor's (expected type and optional default
 * value)
 */

import { ReadonlyRecord } from '../shared-utils/types.js';
import * as ParamDescriptor from './ParamDescriptor.js';

export type Type = ReadonlyRecord<string, ParamDescriptor.Any>;
