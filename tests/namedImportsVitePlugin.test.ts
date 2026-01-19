import { NamedImportsVitePlugin } from '@parischap/configs/tests';
import { describe, expect, it } from 'vitest';

describe('NamedImportsVitePlugin', () => {
  const transform = (code: string, id: string): string | undefined => {
    const result = NamedImportsVitePlugin.transform.bind(undefined as never)(code, id);
    return result?.code;
  };

  it('File without any targetted imports', () => {
    const testFile = `console.log('Hello, world!');
`;
    expect(transform(testFile, '/test.ts')).toStrictEqual(undefined);
  });

  it('File with all sorts of imports', () => {
    const testFile = `import {
  Array,
  Boolean,
  Either as E,
  Equal,
  Equivalence,
  Function,
  flow as f,
  Option,
  Order,
  Predicate,
  Record,
  Tuple,
  pipe,
} from 'effect';
import * as MMatch from './Match.js';
import { NamedImportsVitePlugin } from '@parischap/configs/tests';
import { MArray, flow as f, MBoolean as B, MPredicate } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

console.log('Hello, world!');
`;
    expect(transform(testFile, '/test.ts'))
      .toStrictEqual(`import {flow as f, pipe} from 'effect/Function';
import * as Array from 'effect/Array';
import * as Boolean from 'effect/Boolean';
import * as E from 'effect/Either';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import * as Function from 'effect/Function';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import * as Tuple from 'effect/Tuple';
import * as  from 'effect/';
import * as MMatch from './Match.js';
import { NamedImportsVitePlugin } from '@parischap/configs/tests';
import * as MArray from '@parischap/effect-lib/MArray';
import * as f from '@parischap/effect-lib/flow';
import * as B from '@parischap/effect-lib/MBoolean';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import { describe, expect, it } from 'vitest';

console.log('Hello, world!');
`);
  });
});
