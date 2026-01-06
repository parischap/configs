import { extname } from 'path';
import { type PluginOption } from 'vite';
import { javaScriptExtensions, slashedScope } from '../shared-utils/constants.js';
import { partitionArray } from '../shared-utils/utils.js';

const importRegExp =
  /import\s*{\s*(?<namedImports>[^}]*?)\s*}\s*from\s*(?<mark>["'])(?<importFilename>[^"']+)\k<mark>(?<eol>(?:\s*;)?)/g;
const commaRegExp = /\s*,\s*/;
const asRegExp = /\s+as\s+/;
const effectSlashedScope = '@effect/';
const importsFromEffectFunction = ['absurd', 'flow', 'hole', 'identity', 'pipe', 'unsafeCoerce'];

export default {
  name: 'transform-named-imports-to-namespace-imports',
  transform(code, id) {
    // Only process JavaScript/TypeScript files
    if (!javaScriptExtensions.includes(extname(id))) return;

    // Use a regex to match named imports and rewrite them
    const transformedCode = code.replace(
      importRegExp,
      (match, _c1, _c2, _c3, _c4, _offset, _string, groups) => {
        const { namedImports, importFilename, eol } = groups as {
          readonly namedImports: string;
          readonly importFilename: string;
          readonly eol: string;
        };
        const isEffect = importFilename === 'effect';
        if (
          !isEffect
          && (!importFilename.startsWith(effectSlashedScope)
            || importFilename.lastIndexOf('/') > effectSlashedScope.length - 1)
          && (!importFilename.startsWith(slashedScope)
            || importFilename.lastIndexOf('/') > slashedScope.length - 1)
        )
          return match;

        if (namedImports === '') return '';
        type Entry = [importName: string, importAlias: string | undefined];
        type Entries = ReadonlyArray<Entry>;
        const namedImportsAsEntries: Entries = namedImports
          .split(commaRegExp)
          .map((namedImport) => namedImport.split(asRegExp) as Entry);

        const [functionImports, nonFunctionImports] =
          isEffect ?
            partitionArray(namedImportsAsEntries, ([importName]) =>
              importsFromEffectFunction.includes(importName),
            )
          : [[], namedImportsAsEntries];

        return (
          (functionImports.length !== 0 ?
            'import {'
            + functionImports
              .map(
                ([importName, importAlias]) =>
                  importName + (importAlias !== undefined ? ` as ${importAlias}` : ''),
              )
              .join(', ')
            + `} from 'effect/Function'${eol}`
          : '')
          + nonFunctionImports
            .map(
              ([importName, importAlias]) =>
                `import * as ${importAlias ?? importName} from '${importFilename}/${importName}'${eol}`,
            )
            .join('')
        );
      },
    );

    // If lengths are equal, no transformation happened
    return transformedCode.length === code.length ? null : { code: transformedCode };
  },
} satisfies PluginOption;
