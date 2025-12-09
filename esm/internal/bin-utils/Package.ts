/* This module must not import any external dependency. It must be runnable without a package.json */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { configFilename } from '../shared-utils/constants.js';
import { isRecord, Record } from '../shared-utils/types.js';
import * as Config from './Config.js';

/**
 * Module tag
 *
 * @category Module markers
 */
const _moduleTag = '@parischap/configs/Package/';
const _TypeId: unique symbol = Symbol.for(_moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

interface Base {
  readonly name: string;
  readonly absolutePath: string;
}

interface InternalBase {
  readonly tag: string;
  toConfig(): Promise<Config.Type>;
}

export type Type = TopPackage.Type | MonoRepo.Type | OnePackageRepo.Type | SubPackage.Type;

const readConfigFile = async (self: Type): Promise<Record> => {
  console.log(`${self.tag}reading configuration file`);

  const contents = await readFile(join(self.absolutePath, configFilename), 'utf8');

  const configFile: unknown = JSON.parse(contents);

  if (!isRecord(configFile))
    throw new Error(
      `${self.tag}'${configFilename}' must contain the json representation of a non-null object`,
    );
  return configFile;
};

export namespace TopPackage {
  const _namespaceTag = _moduleTag + 'TopPackage/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  export interface Type extends Base, InternalBase {
    /** @internal */
    readonly [_TypeId]: _TypeId;
  }

  /**
   * Type guard
   *
   * @category Guards
   */
  export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

  /** Prototype */
  const proto = {
    [_TypeId]: _TypeId,
    async toConfig(this: Type): Promise<Config.Type> {
      return 0 as never;
    },
  };

  export const make = (data: Base): Type =>
    Object.assign(Object.create(proto), { ...data, tag: `'${data.name}': ` });
}

export namespace MonoRepo {
  const _namespaceTag = _moduleTag + 'MonoRepo/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  export interface Type extends Base, InternalBase {
    /** @internal */
    readonly [_TypeId]: _TypeId;
  }

  /**
   * Type guard
   *
   * @category Guards
   */
  export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

  /** Prototype */
  const proto = {
    [_TypeId]: _TypeId,
  };

  export const make = (data: Base): Type =>
    Object.assign(Object.create(proto), { ...data, tag: `'  ${data.name}': ` });
}

export namespace OnePackageRepo {
  const _namespaceTag = _moduleTag + 'OnePackageRepo/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  export interface Type extends Base, InternalBase {
    readonly isConfigsPackage: boolean;
    /** @internal */
    readonly [_TypeId]: _TypeId;
  }

  /**
   * Type guard
   *
   * @category Guards
   */
  export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

  /** Prototype */
  const proto = {
    [_TypeId]: _TypeId,
  };

  export const make = (data: Base & { readonly isConfigsPackage: boolean }): Type =>
    Object.assign(Object.create(proto), { ...data, tag: `'  ${data.name}': ` });
}

export namespace SubPackage {
  const _namespaceTag = _moduleTag + 'SubPackage/';
  const _TypeId: unique symbol = Symbol.for(_namespaceTag) as _TypeId;
  type _TypeId = typeof _TypeId;

  export interface Type extends Base, InternalBase {
    readonly parentName: string;
    /** @internal */
    readonly [_TypeId]: _TypeId;
  }

  /**
   * Type guard
   *
   * @category Guards
   */
  export const has = (u: unknown): u is Type => typeof u === 'object' && u !== null && _TypeId in u;

  /** Prototype */
  const proto = {
    [_TypeId]: _TypeId,
  };

  export const make = (data: Base & { readonly parentName: string }): Type =>
    Object.assign(Object.create(proto), { ...data, tag: `'    ${data.name}': ` });
}
