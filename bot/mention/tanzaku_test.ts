import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

const { createContext } = createMentionCommandTester();

Deno.test("tanzaku", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> tanzaku 世界平和"),
  );
  assert(res.type === "message");
  assertEquals(
    res.text,
    `┏┷┓
┃　┃
┃世┃
┃界┃
┃平┃
┃和┃
┃　┃
╰̚━┛⁾⁾`,
  );
});
