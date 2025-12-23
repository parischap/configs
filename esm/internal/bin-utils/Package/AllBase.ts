/**
 * Module that serves as a base for all PackageAll types (see README.md and Package.ts). This module
 * does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { Data } from '../../shared-utils/types.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as PackageBase from './Base.js';

/**
 * Type of a PackageAllBase
 *
 * @category Models
 */
export abstract class Type extends PackageBase.Type {
  /** Package description */
  readonly description: string;

  /** Class constructor */
  protected constructor(params: Data<Type>) {
    super(params);
    this.description = params.description;
  }

  /** Generates the configuration files of `self` */
  _generateConfigFiles(this: Type): Promise<ConfigFiles.Type> {
    return Promise.resolve(ConfigFiles.anyPackage(this));
  }
}

/**
 * Generates the ConfigFiles for `self`
 *
 * @categrory Destructors
 */
export const generateConfigFiles = (self: Type): Promise<ConfigFiles.Type> =>
  self._generateConfigFiles();
