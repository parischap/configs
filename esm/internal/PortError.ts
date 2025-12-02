import { Data } from 'effect';

class Type extends Data.TaggedError('PortError')<{
  readonly message: string;
}> {}

export { type Type };

export const make = ({
  originalError,
  originalFunctionName,
}: {
  readonly originalError: unknown;
  readonly originalFunctionName: string;
}) =>
  new Type({
    message:
      `Ported funtion '${originalFunctionName}' gave the following error: `
      + ((
        originalError !== null
        && typeof originalError === 'object'
        && 'message' in originalError
        && typeof originalError.message === 'string'
      ) ?
        originalError.message
      : 'no error message provided'),
  });
