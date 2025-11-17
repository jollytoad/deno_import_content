import { getServerUrl } from "@http/host-deno-local/server-url";

/**
 * Create a basic HTTP server to run a test against.
 *
 * @param handler request handler
 * @param opts allows hostname and port to be overridden
 * @param test the test function to execute, the server URL is passed as the first param
 * @returns a test function that can be passed directly to `Deno.test`
 */
export const withServer = (
  handler: Deno.ServeHandler,
  opts: Pick<Deno.ServeTcpOptions, "port">,
  test: (url: string, t: Deno.TestContext) => void | Promise<void>,
) =>
async (t: Deno.TestContext) => {
  const server = Deno.serve({
    ...opts,
    handler,
    hostname: "::",
  });

  try {
    await test(getServerUrl(server.addr.hostname, server.addr.port), t);
  } finally {
    await server.shutdown();
  }
};
