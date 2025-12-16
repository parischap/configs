/**
 * Module that describes the types and optional default values of the parameters of a configuration
 * file
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Record } from '../shared-utils/types.js';
import * as ConfigFileDescriptor from './ConfigFileDescriptor.js';
import * as ParamDescriptor from './ParamDescriptor.js';
import * as ParamDescriptors from './ParamDescriptors.js';

export type Type<P extends ParamDescriptors.Type> = ({
  configurationFileObject,
  packageName,
}: {
  readonly configurationFileObject: Record;
  readonly packageName: string;
}) => {
  [k in keyof P]: ParamDescriptor.ExpectedType<P[k]>;
};

export const noSourcePackage = ConfigFileDescriptor.toDecoder(ConfigFileDescriptor.noSourcePackage);
export const sourcePackage = ConfigFileDescriptor.toDecoder(ConfigFileDescriptor.sourcePackage);
