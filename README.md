# deno_import_content

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/import_content/mod.ts)

Import arbitrary file content in Deno using module resolution algorithms.

This includes resolving via an import map, authentication using
`DENO_AUTH_TOKENS`, and use of the Deno cache.

The idea is that `importText()` should act as similar to dynamic `import()` as
possible, but just returning the raw text content instead of an evaluated JS or
TS module.

Unfortunately it's not possible for `importText` to resolve a relative specifier
against the calling module, so they will need to be pre-resolved using
`import.meta.resolve()`. (See the example below, and the tests)

If anyone knows how we could get around this, please raise an issue or better
still, a PR.

## Permissions

This module makes use of [`deno_cache`](https://deno.land/x/deno_cache) to
perform fetching, and therefore requires all permissions that it requires. See
those [docs](https://deno.land/x/deno_cache#permissions) for full details.

Although, `--allow-write` permission for the cache dir is optional. If it is
granted, then remote content will be cached, otherwise it will be fetched every
time if the content isn't already present in the cache.

## Example

```ts
import { importText } from "https://deno.land/x/import_content/mod.ts";

// Fetch the text content of a remote file
const remoteReadme = await importText(
  "https://deno.land/x/import_content/README.md",
);

// Fetch the text content of a local file
const localReadme = await importText(import.meta.resolve("./README.md"));

// Fetch the text content of a file, relying on an import map to resolve to a valid URL
const mappedReadme = await importText("bare/README.md");
```

## Fixed Dependencies

Previous versions of this module depended on my patched version of `deno_cache`,
due to bugs in that module. These have since been fixed, so this module now
depends on the official [`deno_cache`](https://deno.land/x/deno_cache@0.6.1).
