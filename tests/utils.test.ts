import { constants, utils } from '@parischap/configs/tests';
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

  describe('toVersionControlSource', () => {
    it('DEV build without subrepo and version -> minimal ssh url', () => {
      expect(
        utils.toVersionControlSource({
          buildStage: 'DEV',
          importRepoName: 'my-repo',
          importSubRepoName: undefined,
        }),
      ).toStrictEqual(`git+ssh://${constants.versionControlService}/${constants.owner}/my-repo`);
    });

    it('PROD build without subrepo but with version -> includes version and prod path', () => {
      expect(
        utils.toVersionControlSource({
          buildStage: 'PROD',
          importRepoName: 'awesome',
          importSubRepoName: undefined,
          version: 'v1.2.3',
        }),
      ).toStrictEqual(
        `git+ssh://${constants.versionControlService}/${constants.owner}/awesome#v1.2.3&path:${constants.prodFolderName}`,
      );
    });

    it('PROD build with subrepo and version -> includes version and packages/subrepo/prodPath', () => {
      expect(
        utils.toVersionControlSource({
          buildStage: 'PROD',
          importRepoName: 'monorepo',
          importSubRepoName: 'subpkg',
          version: 'release-42',
        }),
      ).toStrictEqual(
        `git+ssh://${constants.versionControlService}/${constants.owner}/monorepo#release-42&path:${constants.packagesFolderName}/subpkg/${constants.prodFolderName}`,
      );
    });
  });
});
