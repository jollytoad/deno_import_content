import { fetchFile } from "./file_fetcher.ts";

/**
 * Import an arbitrary text file via a Deno module specifier, as similar to a dynamic `import()`
 * as possible, but just returns the plain text (UTF-8) content rather than evaluating it as a JS/TS module.
 *
 * @param specifier An absolute URL, or bare module specifier, but not a relative URL, use import.meta.resolve(),
 *  to first resolve those to an absolute URL. Can be to any file, not just JS/TS,
 * @returns The content of the file decoded as UTF-8 text.
 */
export async function importText(specifier: string): Promise<string> {
  const content = await fetchFile(specifier);

  return typeof content === "string"
    ? content
    : new TextDecoder().decode(content);
}
