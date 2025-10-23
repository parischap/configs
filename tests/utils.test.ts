import { pipe } from 'effect';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('utils', () => {
  describe('getExtension', () => {
    it('With no extension', () => {
      expect(Configs.utils.getExtension('foo')).toBe('');
    });
    it('With extension', () => {
      expect(Configs.utils.getExtension('foo.baz')).toBe('.baz');
    });
  });

  it('fromOsPathToPosixPath', () => {
    expect(Configs.utils.fromOsPathToPosixPath(`foo${path.sep}bar${path.sep}baz`)).toBe(
      'foo/bar/baz',
    );
  });

  /*it('fromPosixPathToOsPath', () => {
		expect(Configs.utils.fromPosixPathToOsPath('foo/bar/baz')).toBe(
			`foo${path.sep}bar${path.sep}baz`
		);
	});*/

  it('expandify', () => {
    expect(Configs.utils.expandify(['.js', '.ts'])).toBe('{.js,.ts}');
  });

  describe('isSubPathOf', () => {
    it('Subpath', () => {
      expect(pipe('/home/foo/bar', Configs.utils.isSubPathOf('/home/foo'))).toBe(true);
    });
    it('Same path', () => {
      expect(pipe('/home/foo', Configs.utils.isSubPathOf('/home/foo'))).toBe(true);
    });
    it('Parent path', () => {
      expect(pipe('/home', Configs.utils.isSubPathOf('/home/foo'))).toBe(false);
    });
    it('Completely different path', () => {
      expect(pipe('/home/baz', Configs.utils.isSubPathOf('/home/foo'))).toBe(false);
    });
  });
});
