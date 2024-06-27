import { __reset__ } from "../file_fetcher.ts";
import { assertEquals } from "@std/assert";
import { ulid as randomString } from "@std/ulid";
import { withServer } from "./with_server.ts";
import { importBlob } from "../import_blob.ts";

const CONTENT = Deno.readFileSync(new URL(import.meta.resolve("./deno.png")));

// NOTE: It's important that these tests are NOT in the same folder as the importBlob module
// itself, otherwise we can't be sure that the relative import tests are correct.

Deno.test("import resolved local blob content", async () => {
  __reset__();
  const blob = await importBlob(import.meta.resolve("./deno.png"));
  const content = new Uint8Array(await blob.arrayBuffer());
  assertEquals(content, CONTENT);
});

Deno.test({
  name: "import remote blob content",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async (url) => {
      __reset__();
      const blob = await importBlob(`${url}/${randomString()}`);
      const content = new Uint8Array(await blob.arrayBuffer());
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote blob content with no write permission",
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
      const blob = await importBlob(`${url}/${randomString()}`);
      const content = new Uint8Array(await blob.arrayBuffer());
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote blob content resolved via import map",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async () => {
      __reset__();
      const blob = await importBlob(`$test/${randomString()}`);
      const content = new Uint8Array(await blob.arrayBuffer());
      assertEquals(content, CONTENT);
    },
  ),
});

function respondWithContent() {
  return new Response(CONTENT, {
    status: 200,
  });
}
