import { importText } from "../mod.ts";
import { assertRejects, assertStringIncludes } from "./deps.ts";
import { HOSTNAME, PORT, withServer } from "./with_server.ts";

Deno.env.set("DENO_AUTH_TOKENS", `token1@${HOSTNAME}:${PORT}`);

// NOTE: It's important that these tests are NOT in the same folder as the importText module
// itself, otherwise we can't be sure that the relative import tests are correct.

Deno.test("import resolved local text content", async () => {
  const content = await importText(import.meta.resolve("./content.txt"));
  assertStringIncludes(content, "Here I am!");
});

Deno.test("import relative specifier fails", async () => {
  await assertRejects(() => {
    return importText("./content.txt");
  }, TypeError);
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

Deno.test({
  // NOTE: This is disabled until the bug in deno_cache AuthTokens is fixed
  name: "import remote text content using token",
  fn: withServer(respondWithAuthorization, async (url) => {
    const content = await importText(`${url}/something`);
    assertStringIncludes(content, "Bearer token1");
  }),
});

function respondWithAuthorization(req: Request) {
  console.log("req", req);
  return new Response("Authorization: " + req.headers.get("Authorization"), {
    status: 200,
  });
}
