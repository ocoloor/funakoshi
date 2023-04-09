import { createMentionCommandTester } from "gbas/mod.ts";
import * as mf from "mock_fetch/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import { mentionCommandDispatcher } from "../../dispatchers.ts";
import fixtureResponse from "./fixture_response.json" assert { type: "json" };

mf.install();

const { createContext } = createMentionCommandTester();

mf.mock("GET@/horesase-boys/meigens.json", () => {
  return new Response(JSON.stringify(fixtureResponse));
});

Deno.test("misawa", async () => {
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> misawa"),
  );
  assert(res.type === "message");
  assertMatch(
    res.text,
    /https:\/\/livedoor\.blogimg\.jp\/jigokuno_misawa\/imgs\//,
  );
});

Deno.test("misawa <query>", async () => {
  // match body
  let res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> misawa マスカラ"),
  );
  assert(res.type === "message");
  assertEquals(
    res.text,
    "https://livedoor.blogimg.jp/jigokuno_misawa/imgs/9/c/9c5be517.gif",
  );

  // match character
  res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> misawa NAKAYAN"),
  );
  assert(res.type === "message");
  assertEquals(
    res.text,
    "https://livedoor.blogimg.jp/jigokuno_misawa/imgs/5/0/502c8418.gif",
  );

  // match title
  res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> misawa 欧州"),
  );
  assert(res.type === "message");
  assertEquals(
    res.text,
    "https://livedoor.blogimg.jp/jigokuno_misawa/imgs/6/2/62132366.gif",
  );

  // no match
  res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> misawa マッチ売り"),
  );
  assert(res.type === "message");
  assertEquals(res.text, "ミサワが見つからなかったぞ");
});
