import { utils } from '@parischap/configs/tests';

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

describe('deepMerge', () => {
  it('With one null object', () => {
    expect(utils.deepMerge({}, { a: 1, b: { a: 1, c: 2 } })).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
    expect(utils.deepMerge({ a: 1, b: { a: 1, c: 2 } }, {})).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
  });

  it('Complex merge', () => {
    expect(
      utils.deepMerge(
        { a: 1, b: { a: { a: 1, b: 2 }, c: 2 }, c: { a: 1 } },
        { a: 2, b: { a: { b: 3, c: 3 }, d: ['foo', 'bar'] } },
        { b: { a: { c: 4, d: 5 }, d: ['baz'] }, c: false },
      ),
    ).toStrictEqual({
      a: 2,
      b: { a: { a: 1, b: 3, c: 4, d: 5 }, c: 2, d: ['foo', 'bar', 'baz'] },
      c: false,
    });
  });
});
