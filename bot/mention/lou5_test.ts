import { createMentionCommandTester } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";

mf.install();

const { createContext } = createMentionCommandTester();

Deno.test("lou5", async () => {
  const calls: Request[] = [];
  mf.mock("POST@/api", (req) => {
    calls.push(req);
    return new Response("寝耳にウォーター");
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> lou5 寝耳に水"),
  );

  assert(res.type === "message");
  assertEquals(res.text, "寝耳にウォーター");
  assertEquals(calls.length, 1);
  assertEquals(await calls[0].text(), `text=${encodeURIComponent("寝耳に水")}`);
});
