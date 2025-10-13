import * as constants from './constants.js';

export default {
  $schema: 'https://json.schemastore.org/tsconfig',
  _version: '20.1.0',
  extends: ['@tsconfig/strictest/tsconfig.json'],
  compilerOptions: {
    moduleDetection: 'force',
    composite: true,
    resolveJsonModule: true,
    esModuleInterop: false,
    declaration: true,
    skipLibCheck: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    moduleResolution: 'NodeNext',
    isolatedModules: true,
    sourceMap: true,
    declarationMap: true,
    noEmitOnError: false,
    noErrorTruncation: true,
    target: 'ES2022',
    module: 'NodeNext',
    incremental: true,
    removeComments: false,
    stripInternal: true,
    lib: [],
    // Do not use types (in particular node types) unless included explicitely
    types: [],
    plugins: [
      {
        name: '@effect/language-service',
      },
    ],
    tsBuildInfoFile: `${constants.tsBuildInfoFolderName}/project.tsbuildinfo`,
  },
};
