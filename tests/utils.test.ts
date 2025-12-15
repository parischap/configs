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
