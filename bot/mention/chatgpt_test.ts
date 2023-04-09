import { createMentionCommandTester } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";
import { assert, assertEquals, assertMatch } from "std/testing/asserts.ts";
import { assertSpyCalls, spy } from "std/testing/mock.ts";
import * as mf from "mock_fetch/mod.ts";

const FIXTURE_CHAT_COMPLETIONS_RESPONSE = {
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "こんにちはやで",
    },
    "finish_reason": "stop",
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21,
  },
};

mf.install();

const { createContext } = createMentionCommandTester();
Deno.test("chatgpt first reply", async () => {
  const chatCalls: Request[] = [];
  mf.mock("POST@/v1/chat/completions", (req) => {
    chatCalls.push(req);
    return new Response(JSON.stringify(FIXTURE_CHAT_COMPLETIONS_RESPONSE));
  });

  const ctx = createContext("<@BOT> chatgpt こんにちは");
  const spyReplies = spy(ctx.client.conversations, "replies");
  const res = await mentionCommandDispatcher.dispatch(ctx);

  assert(res.type === "message");
  assertEquals(res.text, "こんにちはやで");

  assertEquals(chatCalls.length, 1);
  const body = await chatCalls[0].json();
  assertEquals(body.model, "gpt-3.5-turbo");
  assertEquals(body.messages.length, 2);
  assertEquals(body.messages[0].role, "system");
  assertMatch(body.messages[0].content, /.+/);
  assertEquals(body.messages[1].role, "user");
  assertEquals(body.messages[1].content, "こんにちは");

  assertSpyCalls(spyReplies, 0);
});

Deno.test("chatgpt 2nd reply", async () => {
  const msg = "<@BOT> chatgpt こんにちは";
  const ctx = createContext(msg, {
    event: { threadTs: "123" },
  });
  const chatCalls: Request[] = [];
  const repliesCalls: Request[] = [];
  mf.mock("POST@/v1/chat/completions", (req) => {
    chatCalls.push(req);
    return new Response(JSON.stringify(FIXTURE_CHAT_COMPLETIONS_RESPONSE));
  });
  mf.mock("POST@/api/conversations.replies", (req) => {
    repliesCalls.push(req);
    return new Response(
      JSON.stringify({
        ok: true,
        messages: [
          { user: "DUMMY_USER_ID", text: "<@BOT> chatgpt おはよう" },
          {
            user: ctx.authUserId,
            text: "おはようございます",
          },
          { user: ctx.event.userId, text: msg },
        ],
      }),
    );
  });

  const res = await mentionCommandDispatcher.dispatch(ctx);

  assert(res.type === "message");
  assertEquals(res.text, "こんにちはやで");

  assertEquals(chatCalls.length, 1);
  const body = await chatCalls[0].json();
  assertEquals(body.model, "gpt-3.5-turbo");
  assertEquals(body.messages.length, 4);
  assertEquals(body.messages[0].role, "system");
  assertMatch(body.messages[0].content, /.+/);
  assertEquals(body.messages[1].role, "user");
  assertEquals(body.messages[1].content, "おはよう");
  assertEquals(body.messages[2].role, "assistant");
  assertEquals(body.messages[2].content, "おはようございます");
  assertEquals(body.messages[3].role, "user");
  assertEquals(body.messages[3].content, "こんにちは");
});
