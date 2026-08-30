import type { RequestHandler } from "express";
import * as helmetModule from "helmet";

/**
 * helmet 8's `package.json` `exports` map has no `types` condition, so some
 * module resolvers (seen on Linux CI, not on local Windows) fail to pick up its
 * `.d.mts`/`.d.cts` and bind the default import to a non-callable namespace.
 *
 * Resolving through a namespace import and selecting the callable ourselves
 * sidesteps that: `helmetModule.default` under ESM, or the module object itself
 * when it was loaded as CommonJS.
 */
type HelmetFactory = () => RequestHandler;

const helmet: HelmetFactory =
  (helmetModule as unknown as { default?: HelmetFactory }).default ??
  (helmetModule as unknown as HelmetFactory);

/** Preconfigured security-header middleware (helmet defaults). */
export const securityHeaders: RequestHandler = helmet();
