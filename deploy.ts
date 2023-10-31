import { importText } from "./mod.ts";

/**
 * Example for Deno Deploy
 */
Deno.serve(async (_req: Request) => {
  const remoteReadme = await importText(import.meta.resolve("./README.md"));
  return new Response(remoteReadme);
});
