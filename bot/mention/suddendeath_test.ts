import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

const { createContext } = createMentionCommandTester();

Deno.test("suddendeath", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> >< 突然の死"),
  );
  assert(res.type === "message");
  assertEquals(
    res.text,
    `＿人人人人人人＿
＞　突然の死　＜
￣Y^Y^Y^Y^Y￣`,
  );
});

Deno.test("suddendeath no message", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> ><  "),
  );
  assert(res.type === "message");
  assertEquals(res.text, "メッセージを指定してください");
});
