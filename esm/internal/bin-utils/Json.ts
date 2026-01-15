import { Effect } from "effect";
import { prettyStringify } from "../shared-utils/utils.js";
import * as PortError from "./PortError.js";

/** Port of Json stringify */
export const stringify = (value: unknown) =>
  Effect.try({
    catch: (e: unknown) =>
      PortError.make({
        originalError: e,
        originalFunctionName: "JSON.stringify",
      }),
    try: () => prettyStringify(value),
  });

/** Port of Json parse */
export const parse = (text: string) =>
  Effect.try({
    catch: (e: unknown) =>
      PortError.make({
        originalError: e,
        originalFunctionName: "JSON.parse",
      }),
    try: () => JSON.parse(text) as unknown,
  });
