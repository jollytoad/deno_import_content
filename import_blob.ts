import { fetchFile } from "./file_fetcher.ts";

/**
 * Import an arbitrary binary file via a Deno module specifier, as similar to a dynamic `import()`
 * as possible, but just returns the binary content rather than evaluating it as a JS/TS module.
 *
 * @param specifier An absolute URL, or bare module specifier, but not a relative URL, use import.meta.resolve(),
 *  to first resolve those to an absolute URL. Can be to any file, not just JS/TS,
 * @returns The content of the file as a Blob.
 */
export async function importBlob(specifier: string): Promise<Blob> {
  return new Blob([await fetchFile(specifier)]);
}
