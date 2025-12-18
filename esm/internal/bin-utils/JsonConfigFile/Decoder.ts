/**
 * Module that implements a JsonConfigFileDecoder, i.e. a function that checks the parameters of a
 * project configuration file (presence and type of mandatory parameters, injection of the default
 * values of optional parameters, absence of unexpected parameters )
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { projectConfigFilename } from '../../../constants.js';
import { isStringArray, isStringRecord, Record } from '../../shared-utils/types.js';
import * as JsonConfigFileFormat from './Format.js';
import * as JsonConfigFileParameter from './Parameter.js';
import * as JsonConfigFileParameters from './Parameters.js';

// We do not create a marked object because this module has nothing but a constructor and instances
export interface Type<P extends JsonConfigFileParameters.Type> {
  ({
    configurationFileObject,
    packageName,
  }: {
    /** Object representing the JSON value of a project configuration file */
    readonly configurationFileObject: Record;
    /** Name of the package that contains the project configuration files */
    readonly packageName: string;
  }): {
    [k in keyof P]: JsonConfigFileParameter.ExpectedType<P[k]>;
  };
}

/**
 * Constructor from a ConfigFileDescriptor
 *
 * @category Constructors
 */
export const make =
  <P extends JsonConfigFileParameters.Type>({
    configFileDescriptor,
  }: {
    readonly configFileDescriptor: JsonConfigFileFormat.Type<P>;
  }): Type<P> =>
  ({ configurationFileObject, packageName }) => {
    const paramDescriptors = configFileDescriptor.paramDescriptors;
    const extraKeys = Object.keys(configurationFileObject).filter(
      (key) => !(key in paramDescriptors),
    );
    for (const extraKey of extraKeys)
      console.log(
        `Package '${packageName}': parameter '${extraKey}' was unexpectedly found in '${projectConfigFilename}' (WARNING)`,
      );
    return Object.fromEntries(
      Object.entries(paramDescriptors).map(([key, descriptor]) => {
        const value: unknown = configurationFileObject[key];

        const { defaultValue, expectedType } = descriptor;
        if (defaultValue !== undefined && value === undefined) return [key, defaultValue];
        const valueType = typeof value;
        if (
          (expectedType === 'string' && valueType !== 'string')
          || (expectedType === 'stringOrUndefined'
            && valueType !== 'string'
            && valueType !== 'undefined')
          || (expectedType === 'boolean' && valueType !== 'boolean')
          || (expectedType === 'record' && !isStringRecord(value))
          || (expectedType === 'array' && !isStringArray(value))
        )
          throw new Error(
            `Parameter '${key}' of '${projectConfigFilename}' should be of type '${expectedType}'. Actual: ${typeof value}`,
          );
        return [key, value];
      }),
    ) as never;
  };

/**
 * Instance of a JsonConfigFileDecoder adapted to no source packages
 *
 * @category instances
 */
export const noSourcePackage = make({
  configFileDescriptor: JsonConfigFileFormat.noSourcePackage,
});

/**
 * Instance of a JsonConfigFileDecoder adapted to source packages
 *
 * @category instances
 */
export const sourcePackage = make({
  configFileDescriptor: JsonConfigFileFormat.sourcePackage,
});
