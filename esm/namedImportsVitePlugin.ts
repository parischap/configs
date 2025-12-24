import { allJavaScriptExtensions, slashedScope } from '@parischap/configs/Constants';
import { partitionArray } from '@parischap/configs/Utils';
import { extname } from 'path';
import { PluginOption } from 'vite';

const importRegExp = /import\s*{\s*([^}]*?)\s*}\s*from\s*(["'])([^"']+)\2((?:\s*;)?)/g;
const commaRegExp = /\s*,\s*/;
const asRegExp = /\s+as\s+/;
const effectSlashedScope = '@effect/';
const importsFromEffectFunction = ['absurd', 'flow', 'hole', 'identity', 'pipe', 'unsafeCoerce'];

export default {
  name: 'transform-named-imports-to-namespace-imports',
  transform(code, id) {
    // Only process JavaScript/TypeScript files
    if (!allJavaScriptExtensions.includes(extname(id))) return;

    // Use a regex to match named imports and rewrite them
    const transformedCode = code.replace(
      importRegExp,
      (
        match,
        namedImports: string,
        _quotationMarks: string,
        importFilename: string,
        eol: string,
      ) => {
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

        return [
          ...(functionImports.length !== 0 ?
            [
              'import {'
                + functionImports
                  .map(
                    ([importName, importAlias]) =>
                      importName + (importAlias !== undefined ? ` as ${importAlias}` : ''),
                  )
                  .join(', ')
                + `} from 'effect/Function'${eol}`,
            ]
          : []),
          ...nonFunctionImports.map(
            ([importName, importAlias]) =>
              `import * as ${importAlias ?? importName} from '${importFilename}/${importName}'${eol}`,
          ),
        ].join('\n');
      },
    );

    // If lengths are equal, no transformation happened
    return transformedCode.length != code.length ? { code: transformedCode } : null;
  },
} satisfies PluginOption;
