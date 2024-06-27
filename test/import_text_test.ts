import { importText } from "../import_text.ts";
import { __reset__ } from "../file_fetcher.ts";
import { assertEquals, assertRejects } from "@std/assert";
import { ulid as randomString } from "@std/ulid";
import { withServer } from "./with_server.ts";

Deno.env.set(
  "DENO_AUTH_TOKENS",
  `token1@localhost:8911;user1:pw1@localhost:8912`,
);

const CONTENT = "Remote plain text content!";

// NOTE: It's important that these tests are NOT in the same folder as the importText module
// itself, otherwise we can't be sure that the relative import tests are correct.

Deno.test("import resolved local text content", async () => {
  __reset__();
  const content = await importText(import.meta.resolve("./content.txt"));
  assertEquals(content, "Local plain text content!");
});

Deno.test("import relative specifier fails", async () => {
  __reset__();
  await assertRejects(() => {
    return importText("./content.txt");
  }, TypeError);
});

Deno.test({
  name: "import remote text content",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async (url) => {
      __reset__();
      const content = await importText(`${url}/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote text content with no write permission",
  permissions: {
    env: true,
    net: true,
    read: true,
    write: false,
  },
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async (url) => {
      __reset__();
      const content = await importText(`${url}/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote text content resolved via import map",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async () => {
      __reset__();
      const content = await importText(`$test/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote text content using bearer token",
  fn: withServer(respondWithAuthorization, {
    port: 8911,
  }, async (url) => {
    __reset__();
    const content = await importText(`${url}/${randomString()}`);
    assertEquals(content, "Authorization: Bearer token1");
  }),
});

Deno.test({
  name: "import remote text content using basic auth",
  fn: withServer(respondWithAuthorization, {
    port: 8912,
  }, async (url) => {
    __reset__();
    const content = await importText(`${url}/${randomString()}`);
    assertEquals(content, "Authorization: Basic dXNlcjE6cHcx");
  }),
});

function respondWithContent() {
  return new Response(CONTENT, {
    status: 200,
  });
}

function respondWithAuthorization(req: Request) {
  return new Response("Authorization: " + req.headers.get("Authorization"), {
    status: 200,
  });
}
