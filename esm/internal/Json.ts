import { Effect } from 'effect';
import * as PortError from './PortError.js';

/** Port of Json stringify */
export const stringify = (
	value: unknown,
	/* eslint-disable-next-line functional/prefer-immutable-types*/
	replacer?: Parameters<typeof JSON.stringify>[1]
) =>
	Effect.try({
		try: () => JSON.stringify(value, replacer),
		catch: (e) =>
			PortError.make({
				originalError: e,
				originalFunctionName: 'JSON.stringify'
			})
	});

/** Port of Json parse */
export const parse = (text: string, reviver?: Parameters<typeof JSON.parse>[1]) =>
	Effect.try({
		try: () => JSON.parse(text, reviver) as unknown,
		catch: (e) =>
			PortError.make({
				originalError: e,
				originalFunctionName: 'JSON.parse'
			})
	});
