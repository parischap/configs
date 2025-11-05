import { Effect } from 'effect';
import * as PortError from './PortError.js';
import { prettyStringify } from './utils.js';

/** Port of Json stringify */
export const stringify = (value: unknown) =>
  Effect.try({
    try: () => prettyStringify(value),
    catch: (e:unknown) =>
      PortError.make({
        originalError: e,
        originalFunctionName: 'JSON.stringify',
      }),
  });

/** Port of Json parse */
export const parse = (text: string) =>
  Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: (e:unknown) =>
      PortError.make({
        originalError: e,
        originalFunctionName: 'JSON.parse',
      }),
  });
