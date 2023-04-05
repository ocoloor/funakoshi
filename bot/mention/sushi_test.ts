import { createMentionCommandTester } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";
import {
  assert,
  assertEquals,
  assertExists,
  assertMatch,
} from "std/testing/asserts.ts";

const { createContext } = createMentionCommandTester();
Deno.test("sushi", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> 寿司"),
  );
  assert(res.type === "message");
  assertMatch(res.text, /^:palm_down_hand:\s\s:\w+:/);
  assertExists(res.iconEmoji);
  assertEquals(res.username, "大将");
});
