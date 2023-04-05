import { createMentionCommandTester } from "gbas/mod.ts";
import * as mf from "mock_fetch/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

mf.install();

const { createContext } = createMentionCommandTester();

const DUMMY_SUCCESS_RESPONSE = {
  data: [
    { contentId: "sm1111111" },
    { contentId: "sm2222222" },
    { contentId: "sm3333333" },
  ],
  meta: {
    id: "xxxxxxxxx",
    totalCount: 1000,
    status: 200,
  },
};

const setup = ({ response = DUMMY_SUCCESS_RESPONSE } = {}) => {
  const apiCalls: Array<Record<string, unknown>> = [];
  mf.mock("GET@/api/v2/snapshot/video/contents/search", (req) => {
    const url = new URL(req.url);
    let params = {};
    for (const [key, val] of url.searchParams.entries()) {
      params = { ...params, [key]: val };
    }
    apiCalls.push(params);
    return new Response(JSON.stringify(response));
  });
  return { apiCalls };
};

Deno.test("niconico", async () => {
  const { apiCalls } = setup();
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> niconico hello"),
  );
  assert(res.type === "message");
  assertMatch(res.text, /^https:\/\/nico.ms\/(sm1111111|sm2222222|sm3333333)/);
  assertEquals(apiCalls, [{
    _context: "slack-bot",
    _limit: "20",
    _sort: "-viewCounter",
    fields: "contentId",
    q: "hello",
    targets: "title,description,tags",
  }]);
});

Deno.test("niconico not found", async () => {
  setup({ response: { ...DUMMY_SUCCESS_RESPONSE, data: [] } });
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> niconico not found query"),
  );
  assert(res.type === "message");
  assertEquals(res.text, "動画が見つからなかったぞ: `not found query`");
});
