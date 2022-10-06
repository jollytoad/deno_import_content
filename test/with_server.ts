import { type Handler, serve } from "https://deno.land/std@0.158.0/http/mod.ts";

export const HOSTNAME = "localhost";
export const PORT = 8910;

export const withServer = (
  handler: Handler,
  test: (url: string, t: Deno.TestContext) => void | Promise<void>,
) =>
async (t: Deno.TestContext) => {
  const controller = new AbortController();

  await serve(handler, {
    hostname: HOSTNAME,
    port: PORT,
    signal: controller.signal,
    onListen: ({ hostname, port }) => {
      const url = `http://${hostname}:${port}`;
      setTimeout(() => {
        try {
          test(url, t);
        } finally {
          controller.abort();
        }
      }, 1);
    },
  });
};
