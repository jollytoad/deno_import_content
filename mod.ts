import { DenoDir, FileFetcher } from "./deps.ts";

let fileFetcher: FileFetcher;

export async function importText(specifier: string): Promise<string> {
  if (!fileFetcher) {
    const denoDir = new DenoDir();
    fileFetcher = new FileFetcher(denoDir.deps);
  }

  const resolved = import.meta.resolve(specifier);
  const response = await fileFetcher.fetch(new URL(resolved));

  if (response?.kind === "module") {
    return response.content;
  } else {
    throw new TypeError(`Module content not found "${resolved}".`);
  }
}

// TODO: Consider adding importBlob to support binary imports
