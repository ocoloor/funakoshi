import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

const { createContext } = createMentionCommandTester();

Deno.test("ping", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> ping"),
  );
  assert(res.type === "message");
  assertEquals(res.text, "PONG");
});
