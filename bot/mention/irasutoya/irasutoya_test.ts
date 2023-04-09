import { createMentionCommandTester } from "gbas/mod.ts";
import * as mf from "mock_fetch/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import { irasutoya } from "./mod.ts";
import fixtureResponse from "./fixture_response.json" assert { type: "json" };

const { createContext, dispatch } = createMentionCommandTester(irasutoya);

mf.install();

Deno.test("irasutoya", async () => {
  const apiCalls: Record<string, unknown>[] = [];
  mf.mock("GET@/feeds/posts/summary", (req) => {
    const url = new URL(req.url);
    const params: Record<string, unknown> = {};
    for (const [key, val] of url.searchParams.entries()) {
      params[key] = val;
    }
    apiCalls.push(params);
    return new Response(JSON.stringify(fixtureResponse));
  });
  const c = createContext("<@BOT> irasutoya ごはん");
  const res = await dispatch(c);
  assert(res.type === "message");
  assertMatch(
    res.text,
    /(^https:\/\/[0-9a-zA-Z_./-]+\.png$|^https:\/\/blogger\.googleusercontent\.com\/)/,
  );
  assertEquals(apiCalls, [{ alt: "json", "max-results": "100", q: "ごはん" }]);
});
