/* eslint-disable functional/no-expression-statements */
import { Array, Either, Equal, Option, pipe, Predicate, String, Utils } from 'effect';
import * as assert from 'node:assert';

const universalPathSep = /[/\\]/;
// ----------------------------
// Primitives
// ----------------------------

/** Throws an `AssertionError` with the provided error message. */
export function fail(message: string) {
  assert.fail(message);
}

export function deepStrictEqual<A>(actual: A, expected: A, message?: string) {
  assert.deepStrictEqual(actual, expected, message);
}

export function strictEqual<A>(actual: A, expected: A, message?: string) {
  assert.strictEqual(actual, expected, message);
}

/** Asserts that `actual` is equal to `expected` using the `Equal.equals` trait. */
export function assertEquals<A>(actual: A, expected: A, message?: string) {
  if (!Utils.structuralRegion(() => Equal.equals(actual, expected))) {
    // Show diff
    deepStrictEqual(actual, expected, message);
    fail(message ?? 'Expected values to be Equal.equals');
  }
}

/** Asserts that `actual` is not equal to `expected` using the `Equal.equals` trait. */
export function assertNotEquals<A, B>(actual: A, expected: B, message?: string) {
  assertFalse(
    Utils.structuralRegion(() => Equal.equals(actual, expected)),
    message,
  );
}

export function assertTrue(self: boolean, message?: string): asserts self is true {
  strictEqual(self, true, message);
}

export function assertFalse(self: boolean, message?: string): asserts self is false {
  strictEqual(self, false, message);
}

// ----------------------------
// Option
// ----------------------------
export function assertNone<A>(
  option: Option.Option<A>,
  message?: string,
): asserts option is Option.None<never> {
  assertEquals(option, Option.none(), message);
}

export function assertSome<A>(
  option: Option.Option<A>,
  expected?: A,
  message?: string,
): asserts option is Option.Some<A> {
  if (expected === undefined) assertTrue(Option.isSome(option), message);
  else assertEquals(option, Option.some(expected), message);
}

// ----------------------------
// Either
// ----------------------------

export function assertLeft<R, L>(
  either: Either.Either<R, L>,
  expected?: L,
  message?: string,
): asserts either is Either.Left<L, never> {
  if (expected === undefined) assertTrue(Either.isLeft(either), message);
  else assertEquals(either, Either.left(expected), message);
}

export function assertLeftMessage<R, L extends { readonly message: string }>(
  either: Either.Either<R, L>,
  expected: string,
  message?: string,
): asserts either is Either.Left<L, never> {
  assertLeft(either, undefined, message);
  strictEqual(either.left.message, expected, message);
}

export function assertRight<R, L>(
  either: Either.Either<R, L>,
  expected?: R,
  message?: string,
): asserts either is Either.Right<never, R> {
  if (expected === undefined) assertTrue(Either.isRight(either), message);
  else assertEquals(either, Either.right(expected), message);
}

// ----------------------------
// Throwing
// ----------------------------
export function throws(thunk: () => void, error?: Error | ((u: unknown) => undefined)) {
  let throwError = false;
  try {
    thunk();
    throwError = true;
  } catch (e) {
    if (error !== undefined) {
      if (Predicate.isFunction(error)) {
        error(e);
      } else {
        deepStrictEqual(e, error);
      }
    }
  }
  if (throwError) fail('Expected to throw an error');
}

/**
 * Asserts that `thunk` does not throw an error.
 *
 * @since 0.21.0
 */
export function doesNotThrow(thunk: () => void, message?: string) {
  assert.doesNotThrow(thunk, message);
}

/**
 * Function that deduces the module name from the position of a test file. Used to check the
 * moduleTag.
 *
 * @category Utils
 */
export const moduleTagFromTestFilePath = (filePath: string): Option.Option<string> =>
  Option.gen(function* () {
    const pathParts = filePath.split(universalPathSep);
    const pathPartsLength = pathParts.length;
    const packageName = yield* pipe(
      pathParts,
      Array.get(pathPartsLength - 3),
      Option.filter(String.isNonEmpty),
    );
    const testFileName = yield* pipe(pathParts, Array.get(pathPartsLength - 1));
    yield* pipe(
      testFileName,
      String.takeRight(8),
      Option.liftPredicate((s) => s === '.test.ts'),
    );
    const moduleName = yield* pipe(
      testFileName,
      String.takeLeft(testFileName.length - 8),
      Option.liftPredicate(String.isNonEmpty),
    );
    return '@parischap/' + packageName + '/' + moduleName + '/';
  });

/**
 * Function that returns a `true` type if the two type parameters are equal. Returns a `false` type
 * otherwise
 *
 * @category Utils
 */

export function areEqualTypes<A, B>(): [A] extends [B] ?
  [B] extends [A] ?
    true
  : false
: false {
  return false as never;
}

/**
 * Function that asserts a `true` type
 *
 * @category Utils
 */
export function assertTrueType<T extends true>(_t: T): void {}
