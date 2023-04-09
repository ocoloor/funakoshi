import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

const GOOGLE_CSE_ID = "DUMMY_GOOGLE_CSE_ID";
const GOOGLE_CSE_KEY = "DUMMY_GOOGLE_CSE_KEY";

const { createContext } = createMentionCommandTester();

mf.install();

const setup = ({ items }: { items: Array<{ link: string }> }) => {
  const apiCalls: Record<string, unknown>[] = [];
  mf.mock("GET@/customsearch/v1", (req) => {
    const url = new URL(req.url);
    const params: Record<string, unknown> = {};
    for (const [key, val] of url.searchParams.entries()) {
      params[key] = val;
    }
    apiCalls.push(params);
    return new Response(JSON.stringify({ items }));
  });
  return { apiCalls };
};

Deno.test("google_image: image not found", async () => {
  setup({ items: [] });
  const context = createContext("<@BOT> image とまんないんすよ", {
    env: { GOOGLE_CSE_ID, GOOGLE_CSE_KEY },
  });
  const res = await mentionCommandDispatcher.dispatch(context);
  assert(res.type === "message", res.type);
  assertEquals(res.text, "画像が見つからなかったぞ");
});

Deno.test("google_image: image found", async () => {
  const imageUrl = "https://example.com/image.png";
  const { apiCalls } = setup({
    items: [{ link: imageUrl }],
  });
  const context = createContext(
    "<@BOT> image とまんないんすよ ほんと",
    {
      env: { GOOGLE_CSE_ID, GOOGLE_CSE_KEY },
    },
  );
  const res = await mentionCommandDispatcher.dispatch(context);
  assert(res.type === "message", res.type);
  assertEquals(res.text, imageUrl);
  assertEquals(apiCalls, [{
    cx: GOOGLE_CSE_ID,
    fields: "items(link)",
    gl: "jp",
    hl: "ja",
    key: GOOGLE_CSE_KEY,
    safe: "off",
    searchType: "image",
    q: "とまんないんすよ ほんと",
  }]);
});

Deno.test("google_animaated_image: image not found", async () => {
  setup({ items: [] });
  const context = createContext(
    "<@BOT> animate とまんないんすよ",
    {
      env: { GOOGLE_CSE_ID, GOOGLE_CSE_KEY },
    },
  );
  const res = await mentionCommandDispatcher.dispatch(context);
  assert(res.type === "message", res.type);
  assertEquals(res.text, "画像が見つからなかったぞ");
});

Deno.test("google_animated_image: image found", async () => {
  const imageUrl = "https://example.com/image.png";
  const { apiCalls } = setup({
    items: [{ link: imageUrl }],
  });
  const context = createContext(
    "<@BOT> animate とまんないんすよ ほんと",
    {
      env: { GOOGLE_CSE_ID, GOOGLE_CSE_KEY },
    },
  );
  const res = await mentionCommandDispatcher.dispatch(context);
  assert(res.type === "message", res.type);
  assertEquals(res.text, imageUrl);
  assertEquals(apiCalls, [{
    cx: GOOGLE_CSE_ID,
    fields: "items(link)",
    fileType: "gif",
    gl: "jp",
    hl: "ja",
    hq: "animated",
    key: GOOGLE_CSE_KEY,
    q: "とまんないんすよ ほんと",
    safe: "off",
    searchType: "image",
    tbs: "itp:animated",
  }]);
});
