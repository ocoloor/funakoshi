import { createMentionCommandTester } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../../dispatchers.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";
import fixtureResponse from "./fixture_response.json" assert { type: "json" };

mf.install();

const { createContext } = createMentionCommandTester();
Deno.test("book", async () => {
  const calls: Request[] = [];
  mf.mock("GET@/books/v1/volumes", (req) => {
    calls.push(req);
    return new Response(JSON.stringify(fixtureResponse));
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> book 修造"),
  );

  assert(res.type === "message");
  assertMatch(res.text, /^https:\/\/www\.amazon\.co\.jp\/dp\/\w{10}/);
  assertEquals(calls.length, 1);
  assertEquals(
    calls[0].url,
    // encoded q & langRestrict
    "https://www.googleapis.com/books/v1/volumes?q=%E4%BF%AE%E9%80%A0&langRestrict=ja",
  );
});
