import { Effect } from 'effect';
import * as PortError from './PortError.js';

/** Port of Json stringify */
export const stringify = (value: unknown) =>
  Effect.try({
    try: () => JSON.stringify(value, null, 2),
    catch: (e) =>
      PortError.make({
        originalError: e,
        originalFunctionName: 'JSON.stringify',
      }),
  });

/** Port of Json parse */
export const parse = (text: string) =>
  Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: (e) =>
      PortError.make({
        originalError: e,
        originalFunctionName: 'JSON.parse',
      }),
  });
