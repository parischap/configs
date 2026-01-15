import { Utils } from '@parischap/configs/tests';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('isSubPathOf', () => {
  it('Subpath', () => {
    expect(pipe('/home/foo/bar', Utils.isSubPathOf('/home/foo'))).toBe(true);
  });
  it('Same path', () => {
    expect(pipe('/home/foo', Utils.isSubPathOf('/home/foo'))).toBe(true);
  });
  it('Parent path', () => {
    expect(pipe('/home', Utils.isSubPathOf('/home/foo'))).toBe(false);
  });
  it('Completely different path', () => {
    expect(pipe('/home/baz', Utils.isSubPathOf('/home/foo'))).toBe(false);
  });
});

describe('deepMerge2', () => {
  it('With one null object', () => {
    expect(Utils.deepMerge2({}, { a: 1, b: { a: 1, c: 2 } })).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
    expect(Utils.deepMerge2({ a: 1, b: { a: 1, c: 2 } }, {})).toStrictEqual({
      a: 1,
      b: { a: 1, c: 2 },
    });
  });

  it('Complex merge', () => {
    expect(
      Utils.deepMerge2(
        Utils.deepMerge2(
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
    const [even, odd] = Utils.partitionArray([1, 2, 3, 4, 5], (n) => n % 2 === 0);
    expect(even).toStrictEqual([2, 4]);
    expect(odd).toStrictEqual([1, 3, 5]);
  });

  it('All elements match predicate', () => {
    const [matching, nonMatching] = Utils.partitionArray([2, 4, 6], (n) => n % 2 === 0);
    expect(matching).toStrictEqual([2, 4, 6]);
    expect(nonMatching).toStrictEqual([]);
  });

  it('No elements match predicate', () => {
    const [matching, nonMatching] = Utils.partitionArray([1, 3, 5], (n) => n % 2 === 0);
    expect(matching).toStrictEqual([]);
    expect(nonMatching).toStrictEqual([1, 3, 5]);
  });

  it('Empty array', () => {
    const [matching, nonMatching] = Utils.partitionArray([], (n) => n > 0);
    expect(matching).toStrictEqual([]);
    expect(nonMatching).toStrictEqual([]);
  });
});

describe('objectToYaml', () => {
  it('String, number, boolean and null values', () => {
    expect(
      Utils.objectToYaml({ value: { active: true, count: 42, name: 'Pascal', remote: null } }).join(
        '\n',
      ),
    ).toStrictEqual(`name: Pascal
count: 42
active: true
remote:`);
  });

  it('Nested object', () => {
    expect(
      Utils.objectToYaml({
        value: { role: ['admin', 'surfer'], user: { name: 'Pascal', fruits: ['banana'] } },
      }).join('\n'),
    ).toStrictEqual(
      `user:
  name: Pascal
  fruits:
    - banana
role:
  - admin
  - surfer`,
    );
  });

  it('Null value', () => {
    expect(Utils.objectToYaml({ value: { data: undefined } }).join('\n')).toStrictEqual('data:');
  });

  it('Empty object', () => {
    expect(Utils.objectToYaml({ value: {} }).join('\n')).toStrictEqual('');
  });
});
