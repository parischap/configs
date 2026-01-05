/**
 * Module that serves as a base for all PackageAll types (see README.md and Package.ts). This module
 * does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import { type Data } from "../../shared-utils/utils.js";
import * as ConfigFiles from "../Config/Files.js";
import * as PackageBase from "./Base.js";

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = "@parischap/configs/internal/bin-utils/Package/AllBase/";
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

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

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Generates the ConfigFiles for `self`
 *
 * @categrory Destructors
 */
export const generateConfigFiles = (self: Type): Promise<ConfigFiles.Type> =>
  self._generateConfigFiles();
