import { tsBuildInfoFolderName } from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

export default {
  $schema: 'https://json.schemastore.org/tsconfig',
  _version: '20.1.0',
  compilerOptions: {
    moduleDetection: 'force',
    // Allow project references
    composite: true,
    incremental: true,
    resolveJsonModule: true,
    declaration: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    moduleResolution: 'NodeNext',
    sourceMap: true,
    noEmitOnError: false,
    noErrorTruncation: true,
    target: 'ESNext',
    module: 'NodeNext',
    removeComments: false,
    stripInternal: true,
    // Enabling dts generation on a per-file basis
    isolatedDeclarations: true,
    lib: ['ESNext'],
    types: ['node'],
    noEmit: true,
    plugins: [
      {
        name: '@effect/language-service',
      },
    ],
    tsBuildInfoFile: `.${tsBuildInfoFolderName}/project.${tsBuildInfoFolderName}`,
  },
  extends: ['@tsconfig/strictest/tsconfig.json'],
} satisfies ReadonlyRecord;
