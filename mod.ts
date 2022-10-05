import { DenoDir, FileFetcher } from "./deps.ts";

let fileFetcher: FileFetcher;

/**
 * Import an arbitrary text file via a Deno module specifier, as similar to a dynamic `import()`
 * as possible, but just returns the plain text (UTF-8) content rather than evaluating it as a JS/TS module.
 *
 * @param specifier An absolute URL, or bare module specifier, but not a relative URL, use import.meta.resolve(),
 *  to first resolve those to an absolute URL. Can be to any file, not just JS/TS,
 * @returns The content of the file decoded as UTF-8 text.
 */
export async function importText(specifier: string): Promise<string> {
  if (!fileFetcher) {
    const denoDir = new DenoDir();
    fileFetcher = new FileFetcher(denoDir.deps);
  }

  if (isRelative(specifier)) {
    throw new TypeError(
      `Cannot import a relative module "${specifier}", use import.meta.resolve() to first resolve to an absolute URL.`,
    );
  }

  const resolved = import.meta.resolve(specifier);
  const response = await fileFetcher.fetch(new URL(resolved));

  if (response?.kind === "module") {
    return response.content;
  } else {
    throw new TypeError(`Module content not found "${specifier.toString()}".`);
  }
}

// TODO: Consider adding importBlob to support binary imports

function isRelative(specifier: string) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}
