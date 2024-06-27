import { DenoDir, FileFetcher } from "@deno/cache-dir";

let fileFetcher: FileFetcher | undefined;

/**
 * INTERNAL: For test usage only
 * @private
 * @deprecated
 */
export function __reset__() {
  fileFetcher = undefined;
}

/**
 * Get a cached instance of the FileFetcher
 */
async function getFileFetcher() {
  if (!fileFetcher) {
    const denoDir = new DenoDir();
    const writeGranted =
      (await Deno.permissions.query({ name: "write", path: denoDir.root }))
        .state === "granted";
    fileFetcher = new FileFetcher(() =>
      denoDir.createHttpCache({ readOnly: !writeGranted })
    );
  }
  return fileFetcher;
}

/**
 * Fetch the file using the FileFetcher
 */
export async function fetchFile(
  specifier: string,
): Promise<string | Uint8Array> {
  const fileFetcher = await getFileFetcher();

  if (isRelative(specifier)) {
    throw new TypeError(
      `Cannot import a relative module "${specifier}", use import.meta.resolve() to first resolve to an absolute URL.`,
    );
  }

  const resolved = new URL(import.meta.resolve(specifier));
  const response = await fileFetcher.fetch(resolved);

  if (response?.kind === "module") {
    return response.content;
  } else {
    throw new TypeError(`Module content not found "${specifier.toString()}".`);
  }
}

function isRelative(specifier: string) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}
