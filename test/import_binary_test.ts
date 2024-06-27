import { __reset__ } from "../file_fetcher.ts";
import { assertEquals } from "@std/assert";
import { ulid as randomString } from "@std/ulid";
import { withServer } from "./with_server.ts";
import { importBinary } from "../import_binary.ts";

const CONTENT = Deno.readFileSync(new URL(import.meta.resolve("./deno.png")));

// NOTE: It's important that these tests are NOT in the same folder as the importBinary module
// itself, otherwise we can't be sure that the relative import tests are correct.

Deno.test("import resolved local binary content", async () => {
  __reset__();
  const content = await importBinary(import.meta.resolve("./deno.png"));
  assertEquals(content, CONTENT);
});

Deno.test({
  name: "import remote binary content",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async (url) => {
      __reset__();
      const content = await importBinary(`${url}/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote binary content with no write permission",
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
      const content = await importBinary(`${url}/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

Deno.test({
  name: "import remote binary content resolved via import map",
  fn: withServer(
    respondWithContent,
    { port: 8910 },
    async () => {
      __reset__();
      const content = await importBinary(`$test/${randomString()}`);
      assertEquals(content, CONTENT);
    },
  ),
});

function respondWithContent() {
  return new Response(CONTENT, {
    status: 200,
  });
}
