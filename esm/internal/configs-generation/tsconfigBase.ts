// This module must not import any external dependency. It must be runnable without a package.json
import { tsBuildInfoFolderName } from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

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
    // This will be used only when transpiling libraries which might get used in older browsers
    target: 'ES2022',
    module: 'NodeNext',
    incremental: true,
    removeComments: false,
    stripInternal: true,
    lib: ['ESNext'],
    types: ['node'],
    allowJs: true,
    checkJs: true,
    noEmit: true,
    plugins: [
      {
        name: '@effect/language-service',
      },
    ],
    tsBuildInfoFile: `${tsBuildInfoFolderName}/project.tsbuildinfo`,
  },
} satisfies ReadonlyRecord;
