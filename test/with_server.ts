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
  opts: Pick<Deno.ServeOptions, "hostname" | "port">,
  test: (url: string, t: Deno.TestContext) => void | Promise<void>,
) =>
async (t: Deno.TestContext) => {
  const controller = new AbortController();

  let caught: unknown;

  await Deno.serve({
    handler,
    ...opts,
    signal: controller.signal,
    onListen: ({ hostname, port }) => {
      queueMicrotask(async () => {
        try {
          await test(`http://${hostname}:${port}`, t);
        } catch (e) {
          caught = e;
        } finally {
          controller.abort();
        }
      });
    },
  }).finished;

  if (caught) {
    throw caught;
  }
};
