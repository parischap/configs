/**
 * Module that serves as a base for all no source Package types (see README.md and Package.ts). This
 * module does not define a constructor as no object implementing this interface will exist
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import * as PackageBase from './Base.js';

/**
 * Type of a Base
 *
 * @category Models
 */
// This object is not marked because it is not meant to be built
export interface Type extends PackageBase.Type {
  /** Description of the package */
  readonly description: string;
}
