import { createMessageCommandTester } from "gbas/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import { messageCommandDispatcher } from "../dispatchers.ts";
import { nullpo } from "./nullpo.ts";

const { createContext } = createMessageCommandTester(nullpo);

Deno.test("nullpo", async () => {
  const res = await messageCommandDispatcher.dispatch(createContext("ぬるぽ"));
  assert(res.type === "message");
  assertEquals(res.text, "ｶﾞｯ");
});
