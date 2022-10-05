import { importText } from "./mod.ts";
import { assertStringIncludes, serve } from "./deps_test.ts";

Deno.env.set("DENO_AUTH_TOKENS", "token1@localhost");

Deno.test("import local text content", async () => {
  const content = await importText("./LICENSE");
  assertStringIncludes(content, "Copyright");
});

Deno.test("import remote text content", async () => {
  const content = await importText(
    "https://deno.land/std@0.158.0/README.md",
  );
  assertStringIncludes(content, "Deno Standard Modules");
});

Deno.test("import remote text content resolved via import map", async () => {
  const content = await importText("$std/README.md");
  assertStringIncludes(content, "Deno Standard Modules");
});

Deno.test("import remote text content using token", async () => {
  const [controller, url] = await startTestServer();

  try {
    const content = await importText(`${url}/something`);
    assertStringIncludes(content, "Bearer token1");
  } finally {
    controller.abort();
  }
});

async function startTestServer() {
  const controller = new AbortController();

  const url = await new Promise<string>((resolve) => {
    serve((req) => {
      console.log("req", req);
      return new Response("TOKEN: " + req.headers.get("Authorization"), {
        status: 200,
      });
    }, {
      hostname: "localhost",
      signal: controller.signal,
      onListen: ({ hostname, port }) => {
        resolve(`http://${hostname}:${port}`);
      },
    });
  });

  return [controller, url] as const;
}
