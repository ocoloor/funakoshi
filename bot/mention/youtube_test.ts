import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";

mf.install();

const DUMMY_SUCCESS_RESPONSE = {
  kind: "youtube#searchListResponse",
  etag: "dummy_etag",
  nextPageToken: "CA8QAA",
  regionCode: "JP",
  pageInfo: { totalResults: 1000000, resultsPerPage: 15 },
  items: [
    {
      kind: "youtube#searchResult",
      etag: "dummy_etag2",
      id: { kind: "youtube#video", videoId: "dummy_video_id1" },
      snippet: {
        publishedAt: "2023-03-26T10:02:23Z",
        channelId: "dummy_channel_id1",
        title: "DUMMY TITLE 1",
        description: "DUMMY DESCRIPTION 1",
        thumbnails: [],
        channelTitle: "あさごはん",
        liveBroadcastContent: "none",
        publishTime: "2023-03-26T10:02:23Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "dummy_etag3",
      id: { kind: "youtube#video", videoId: "dummy_video_id2" },
      snippet: {
        publishedAt: "2023-03-24T11:00:55Z",
        channelId: "dummy_channel_id2",
        title: "DUMMY TITLE 2",
        description: "DUMMY DESCRIPTION 2",
        thumbnails: [],
        channelTitle: "ひるごはん",
        liveBroadcastContent: "none",
        publishTime: "2023-03-24T11:00:55Z",
      },
    },
  ],
};

const setup = () => {
  const apiCalls: Array<Record<string, unknown>> = [];
  mf.mock("GET@/youtube/v3/search", (req) => {
    const url = new URL(req.url);
    const params: Record<string, unknown> = {};
    for (const [key, val] of url.searchParams.entries()) {
      params[key] = val;
    }
    apiCalls.push(params);
    return new Response(JSON.stringify(DUMMY_SUCCESS_RESPONSE));
  });
  return { apiCalls };
};

const { createContext } = createMentionCommandTester();

Deno.test("youtube", async () => {
  const { apiCalls } = setup();
  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> youtube ごはん", {
      env: { YOUTUBE_API_KEY: "dummy-api-token" },
    }),
  );
  assert(res.type === "message");
  assertMatch(
    res.text,
    /^https:\/\/www\.youtube\.com\/watch\?v=dummy_video_id/,
  );
  assertEquals(apiCalls, [{
    key: "dummy-api-token",
    maxResults: "15",
    order: "relevance",
    part: "snippet",
    q: "ごはん",
    regionCode: "JP",
    type: "video",
  }]);
});
