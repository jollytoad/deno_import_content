# deno_import_content

Import arbitrary file content in Deno using module resolution algorithms.

This includes resolving via an import map, authentication using
`DENO_AUTH_TOKENS`, and use of the Deno cache.

The idea is that `importText()` should act as similar to dynamic `import()` as
possible, but just returning the raw text content instead of an evaluated JS or
TS module.

## Permissions

This module makes use of [`deno_cache`](https://deno.land/x/deno_cache) to
perform fetching, and therefore requires all permissions that it requires. See
those [docs](https://deno.land/x/deno_cache#permissions) for full details.

## Example

```ts
import { importText } from "https://deno.land/x/deno_import_content/mod.ts";

// Fetch the text content of a remote file
const remoteReadme = await importText(
  "https://deno.land/x/deno_import_content/README.md",
);

// Fetch the text content of a local file
const localReadme = await importText("./README.md");

// Fetch the text content of a file, relying on an import map to resolve to a valid URL
const mappedReadme = await importText("bare/README.md");
```

## Known Bugs

Authentication via `DENO_AUTH_TOKENS` currently doesn't work due to a bug in
`deno_cache`. There is a [PR](https://github.com/denoland/deno_cache/pull/18) to
fix this, currently awaiting review.
