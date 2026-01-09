/**
 * Module that serves as a base for all source Package types (see README.md and Package.ts). This
 * module does not export a constructor: abstract class equivalent
 */
/* This module must not import any external dependency. It must be runnable without a package.json because it is used by the generate-config-files.ts bin */

import {
  type Data,
  type ReadonlyStringRecord,
  type StringArray,
} from '../../shared-utils/utils.js';
import * as ConfigFiles from '../ConfigFiles.js';
import * as SchemaFormat from '../Schema/Format.js';
import * as SchemaParameterDescriptor from '../Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../Schema/ParameterType.js';
import * as PackageBase from './Base.js';
import * as PackageLoadedBase from './LoadedBase.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/configs/internal/bin-utils/Package/LoadedSource/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

const BuildMethod = SchemaParameterType.union(
  SchemaParameterType.literal('NoBundling'),
  SchemaParameterType.literal('LightBundling'),
  SchemaParameterType.literal('DeepBundling'),
);

/**
 * BuildMethod type
 *
 * @category Models
 */
export type BuildMethod = SchemaParameterType.RealType<typeof BuildMethod>;

const Environment = SchemaParameterType.union(
  SchemaParameterType.literal('Browser'),
  SchemaParameterType.literal('Node'),
  SchemaParameterType.literal('Plain'),
);

/**
 * Environment type
 *
 * @category Models
 */
export type Environment = SchemaParameterType.RealType<typeof Environment>;

const sourcePackageFormat = SchemaFormat.make({
  descriptors: {
    description: SchemaParameterDescriptor.make({ expectedType: SchemaParameterType.string }),
    dependencies: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringRecord,
      defaultValue: {},
    }),
    devDependencies: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringRecord,
      defaultValue: {},
    }),
    peerDependencies: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringRecord,
      defaultValue: {},
    }),
    examples: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringArray,
      defaultValue: [],
    }),
    scripts: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringRecord,
      defaultValue: {},
    }),
    environment: SchemaParameterDescriptor.make({
      expectedType: Environment,
    }),
    buildMethod: SchemaParameterDescriptor.make({
      expectedType: BuildMethod,
    }),
    isPublished: SchemaParameterDescriptor.make({ expectedType: SchemaParameterType.boolean }),
    hasDocGen: SchemaParameterDescriptor.make({ expectedType: SchemaParameterType.boolean }),
    keywords: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.readonlyStringArray,
      defaultValue: [],
    }),
    useEffectAsPeerDependency: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.boolean,
    }),
    useEffectPlatform: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.boolean,
      defaultValue: false,
    }),
    packagePrefix: SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.stringOrUndefined,
      defaultValue: undefined,
    }),
  },
});

type LoadedParameters = SchemaFormat.RealType<typeof sourcePackageFormat>;

/**
 * Type of a PackageLoadedSource
 *
 * @category Models
 */
export abstract class Type extends PackageLoadedBase.Type implements LoadedParameters {
  /** `dependencies` used by the package except Effect and Effect platform (default value: {}) */
  readonly dependencies: Readonly<ReadonlyStringRecord>;
  /** `devDependencies` used by the package (default value: {}) */
  readonly devDependencies: Readonly<ReadonlyStringRecord>;
  /** `peerDependencies` used by the package except Effect and Effect platform (default value: {}) */
  readonly peerDependencies: Readonly<ReadonlyStringRecord>;
  /**
   * Array of available examples to add as `examples` script under the `package.json` scripts field
   * (default value: [])
   */
  readonly examples: Readonly<StringArray>;
  /** Other scripts to add to `package.json` (default value: {}) */
  readonly scripts: Readonly<ReadonlyStringRecord>;
  /**
   * One of `Browser`, `Node` or `Plain`. Note that, in our case, we do not use the DOM specific
   * variables in the `Browser` environment because the browser code must be runnable on the server
   * for server-side rendering. All the DOM manipulation is hidden away in Preact
   */
  readonly environment: 'Browser' | `Node` | `Plain`;
  /**
   * - NoBundling: all modules in the `esm` directory, except those under the `internal`and `bin`
   *   subdirectories, are simply transpiled to JavaScript. Nothing gets bundled. If the package
   *   uses any dependencies, they must be installed in the prod package as well. This is usually a
   *   good choice for libraries.
   * - LightBundling: all modules in the `esm` directory except those under the `internal`
   *   subdirectory are transpiled to JavaScript and bundled with the modules under the `internal`
   *   subdirectory. If the package uses any dependencies, they must be installed in the prod
   *   package as well. This is usually a good choice for code that does not need to ship as a
   *   standalone package. Not bundling external dependencies allows to keep the package small,
   *   reduce build and start time as all the packages need not be loaded at once. This is usually a
   *   good choice for a web server.
   * - DeepBundling: all modules in the `esm` directory except those under the `internal` subdirectory
   *   are transpiled to JavaScript and bundled with the modules under the `internal` subdirectory
   *   and all installed packages. If the package uses any dependencies, they will not be installed
   *   in the prod package. This is usually a good choice for a standalone command.
   */
  readonly buildMethod: `NoBundling` | `LightBundling` | `DeepBundling`;
  /** Boolean that indicates if the package will be published to NPM */
  readonly isPublished: boolean;
  /**
   * Boolean that indicates if package documentation must be generated by docgen. Note that no
   * documentation will be produced for modules under the `internal` and `bin` directories even if
   * this flag is `true`
   */
  readonly hasDocGen: boolean;
  /**
   * Array of keywords to add to the package. Will be ignored if the package is not published
   * (default: [])
   */
  readonly keywords: Readonly<StringArray>;
  /**
   * Effect is by default added as dependency to all packages. If this flag is set to true, it is
   * added as a peerDependency. Note that Effect is also used by testUtils.ts
   */
  readonly useEffectAsPeerDependency: boolean;
  /**
   * If true, Effect platform and all its peerDependencies are added to the package as dependency or
   * peerDependency depending on the `useEffectAsPeerDependency` flag
   */
  readonly useEffectPlatform: boolean;
  /**
   * string that will be added to automatically generated namespace imports for the package.
   * namespace imports will be automatically generated even if packagePrefix is an empty string. To
   * deactivate it, omit the field. Namespace imports are generated for all JavaScript files except
   * those under the `internal` and `bin` subdirectories.
   */
  readonly packagePrefix: string | undefined;

  /** Class constructor */
  protected constructor(params: Data<Type>) {
    super(params);
    this.dependencies = params.dependencies;
    this.devDependencies = params.devDependencies;
    this.peerDependencies = params.peerDependencies;
    this.examples = params.examples;
    this.scripts = params.scripts;
    this.environment = params.environment;
    this.buildMethod = params.buildMethod;
    this.isPublished = params.isPublished;
    this.hasDocGen = params.hasDocGen;
    this.keywords = params.keywords;
    this.useEffectAsPeerDependency = params.useEffectAsPeerDependency;
    this.useEffectPlatform = params.useEffectPlatform;
    this.packagePrefix = params.packagePrefix;
  }

  /** Generates the configuration files of `self` */
  override async _generateConfigFiles(
    this: Type,
    mode: ConfigFiles.Mode,
  ): Promise<ConfigFiles.Type> {
    return ConfigFiles.merge(
      await super._generateConfigFiles(mode),
      await ConfigFiles.sourcePackage({ packageLoadedSource: this, mode }),
    );
  }

  /** @internal */
  get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Untyped constructor
 *
 * @category Constructors
 */
export const fromPackageBase = async ({
  packageBase,
}: {
  readonly packageBase: PackageBase.Type;
}): Promise<Data<Type>> => {
  const configRecord = await PackageBase.readProjectConfigFile(packageBase);
  const parameters = Object.entries(configRecord);
  return {
    ...(packageBase as Data<PackageBase.Type>),
    ...SchemaFormat.injectDefaultsAndValidate(sourcePackageFormat, {
      errorPrefix: `'${packageBase.name}': `,
    })(parameters),
  };
};
