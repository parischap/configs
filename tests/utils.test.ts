import * as utils from '@parischap/configs/Utils';
import { namedImportsVitePlugin } from '@parischap/configs/tests';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('isSubPathOf', () => {
  it('Subpath', () => {
    expect(pipe('/home/foo/bar', utils.isSubPathOf('/home/foo'))).toBe(true);
  });
  it('Same path', () => {
    expect(pipe('/home/foo', utils.isSubPathOf('/home/foo'))).toBe(true);
  });
  it('Parent path', () => {
    expect(pipe('/home', utils.isSubPathOf('/home/foo'))).toBe(false);
  });
  it('Completely different path', () => {
    expect(pipe('/home/baz', utils.isSubPathOf('/home/foo'))).toBe(false);
  });
});

describe('deepMerge2', () => {
  it('With one null object', () => {
    expect(utils.deepMerge2({}, { a: 1, b: { a: 1, c: 2 } })).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
    expect(utils.deepMerge2({ a: 1, b: { a: 1, c: 2 } }, {})).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
  });

  it('Complex merge', () => {
    expect(
      utils.deepMerge2(
        utils.deepMerge2(
          { a: 1, b: { a: { a: 1, b: 2 }, c: 2 }, c: { a: 1 } },
          { a: 2, b: { a: { b: 3, c: 3 }, d: ['foo', 'bar'] } },
        ),
        { b: { a: { c: 4, d: 5 }, d: ['baz'] }, c: false },
      ),
    ).toStrictEqual({
      a: 2,
      b: { a: { a: 1, b: 3, c: 4, d: 5 }, c: 2, d: ['foo', 'bar', 'baz'] },
      c: false,
    });
  });
});

describe('partitionArray', () => {
  it('Partitions array by predicate', () => {
    const [even, odd] = utils.partitionArray([1, 2, 3, 4, 5], (n) => n % 2 === 0);
    expect(even).toStrictEqual([2, 4]);
    expect(odd).toStrictEqual([1, 3, 5]);
  });

  it('All elements match predicate', () => {
    const [matching, nonMatching] = utils.partitionArray([2, 4, 6], (n) => n % 2 === 0);
    expect(matching).toStrictEqual([2, 4, 6]);
    expect(nonMatching).toStrictEqual([]);
  });

  it('No elements match predicate', () => {
    const [matching, nonMatching] = utils.partitionArray([1, 3, 5], (n) => n % 2 === 0);
    expect(matching).toStrictEqual([]);
    expect(nonMatching).toStrictEqual([1, 3, 5]);
  });

  it('Empty array', () => {
    const [matching, nonMatching] = utils.partitionArray([], (n) => n > 0);
    expect(matching).toStrictEqual([]);
    expect(nonMatching).toStrictEqual([]);
  });
});

describe('namedImportsVitePlugin', () => {
  const transform = (code: string, id: string): string | undefined => {
    const result = namedImportsVitePlugin.transform.bind(null as never)(code, id);
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
import { namedImportsVitePlugin } from '@parischap/configs/tests';
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
import { namedImportsVitePlugin } from '@parischap/configs/tests';
import * as MArray from '@parischap/effect-lib/MArray';
import * as f from '@parischap/effect-lib/flow';
import * as B from '@parischap/effect-lib/MBoolean';
import * as MPredicate from '@parischap/effect-lib/MPredicate';
import { describe, expect, it } from 'vitest';

console.log('Hello, world!');
`);
  });
});
