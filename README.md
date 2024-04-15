# Deno Import Content

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

This module makes use of [`@deno/cache-dir`](https://jsr.io/@deno/cache-dir) to
perform fetching, and therefore requires all permissions that it requires.

Although, `--allow-write` permission for the cache dir is optional. If it is
granted, then remote content will be cached, otherwise it will be fetched every
time if the content isn't already present in the cache.

## Example

```ts
import { importText } from "jsr:@jollytoad/import-content";

// Fetch the text content of a remote file
const remoteReadme = await importText(
  "https://deno.land/x/import_content/README.md",
);

// Fetch the text content of a local file
const localReadme = await importText(import.meta.resolve("./README.md"));

// Fetch the text content of a file, relying on an import map to resolve to a valid URL
const mappedReadme = await importText("bare/README.md");
```

## Planned Obsolescence

Hopefully this entire package will become completely obsolete once Deno fully
supports importing of arbitrary files via import attributes...

```ts
const remoteReadme = await import(
  "https://deno.land/x/import_content/README.md",
  { with: { type: "text" } }
);

const localReadme = await import("./README.md", { with: { type: "text" } });

const mappedReadme = await import("bare/README.md", { with: { type: "text" } });
```
