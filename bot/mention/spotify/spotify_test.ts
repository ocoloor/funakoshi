import { createMentionCommandTester } from "gbas/mod.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";
import { mentionCommandDispatcher } from "../../dispatchers.ts";
import fixtureSearchResponse from "./fixture_search_response.json" assert {
  type: "json",
};

mf.install();

const SPOTIFY_CLIENT_ID = "DUMMY_CLIENT_ID";
const SPOTIFY_CLIENT_SECRET = "DUMMY_CLIENT_SECRET";

const { createContext } = createMentionCommandTester();
Deno.test("spotify", async () => {
  const authCalls: Request[] = [];
  const searchCalls: Request[] = [];
  mf.mock("POST@/api/token", (req) => {
    authCalls.push(req);
    return new Response(JSON.stringify({
      access_token: "DUMMY_ACCESS_TOKEN",
      token_type: "Bearer",
      expires_in: 300,
    }));
  });
  mf.mock("GET@/v1/search", (req) => {
    searchCalls.push(req);
    return new Response(JSON.stringify(fixtureSearchResponse));
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> spotify コンピューターおばあちゃん", {
      env: { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET },
    }),
  );

  assert(res.type === "message");
  assertMatch(res.text, /^https:\/\/open\.spotify\.com\/track\//);

  assert(authCalls.length === 1);
  assertEquals(
    authCalls[0].headers.get("content-type"),
    "application/x-www-form-urlencoded",
  );
  assertEquals(
    authCalls[0].headers.get("authorization"),
    // base64 encoded "DUMMY_CLIENT_ID:DUMMY_CLIENT_SECRET"
    "Basic RFVNTVlfQ0xJRU5UX0lEOkRVTU1ZX0NMSUVOVF9TRUNSRVQ=",
  );
  const formData = await authCalls[0].formData();
  assertEquals(formData.get("grant_type"), "client_credentials");

  assert(searchCalls.length === 1);
  assertEquals(
    searchCalls[0].url,
    "https://api.spotify.com/v1/search?q=%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF%E3%83%BC%E3%81%8A%E3%81%B0%E3%81%82%E3%81%A1%E3%82%83%E3%82%93&type=track&limit=5",
  );
});

Deno.test("spotify no results", async () => {
  mf.mock("POST@/api/token", () => {
    return new Response(JSON.stringify({
      access_token: "DUMMY_ACCESS_TOKEN",
      token_type: "Bearer",
      expires_in: 300,
    }));
  });
  mf.mock("GET@/v1/search", () => {
    return new Response(JSON.stringify({ tracks: { href: "", items: [] } }));
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> spotify コンピューターおばあちゃん", {
      env: { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET },
    }),
  );

  assert(res.type === "message");
  assertEquals(
    res.text,
    "曲が見つからなかったぞ: `コンピューターおばあちゃん`",
  );
});

Deno.test("spotify auth failed", async () => {
  mf.mock("POST@/api/token", () => {
    return new Response(JSON.stringify({ invalid: "dummy" }), { status: 400 });
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> spotify コンピューターおばあちゃん", {
      env: { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET },
    }),
  );

  assert(res.type === "message");
  assertEquals(
    res.text,
    '認証に失敗したぞ: `{"invalid":"dummy"}`',
  );
});

Deno.test("spotify search failed", async () => {
  mf.mock("POST@/api/token", () => {
    return new Response(JSON.stringify({
      access_token: "DUMMY_ACCESS_TOKEN",
      token_type: "Bearer",
      expires_in: 300,
    }));
  });
  mf.mock("GET@/v1/search", () => {
    return new Response(JSON.stringify({ invalid: "dummy" }), { status: 400 });
  });

  const res = await mentionCommandDispatcher.dispatch(
    createContext("<@BOT> spotify コンピューターおばあちゃん", {
      env: { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET },
    }),
  );

  assert(res.type === "message");
  assertEquals(
    res.text,
    '検索に失敗したぞ: `{"invalid":"dummy"}`',
  );
});
