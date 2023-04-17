import { createMentionCommandTester } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../dispatchers.ts";
import { assert, assertEquals } from "std/testing/asserts.ts";
import * as mf from "mock_fetch/mod.ts";

const FIXTURE_IMAGES_GENERATIONS_RESPONSE = {
  created: 123,
  data: [{ b64_json: "" }],
};
const OPENAI_API_KEY = "DUMMY_OPEN_API_KEY";

mf.install();

const setup = (
  { imageResponse, uploadResponse }: {
    imageResponse: Response;
    uploadResponse: Response;
  },
) => {
  const imageCalls: Request[] = [];
  const uploadCalls: Request[] = [];
  mf.mock("POST@/v1/images/generations", (req) => {
    imageCalls.push(req);
    return imageResponse;
  });
  mf.mock("POST@/api/files.upload", (req) => {
    uploadCalls.push(req);
    return uploadResponse;
  });
  return { imageCalls, uploadCalls };
};

const { createContext } = createMentionCommandTester();
Deno.test("text2image", async () => {
  const { imageCalls, uploadCalls } = setup({
    imageResponse: new Response(
      JSON.stringify(FIXTURE_IMAGES_GENERATIONS_RESPONSE),
    ),
    uploadResponse: new Response(JSON.stringify({/* DUMMY */})),
  });

  const prompt = "cyber punk world";
  const ctx = createContext(`<@BOT> text2image ${prompt}`, {
    env: { OPENAI_API_KEY },
  });
  const res = await mentionCommandDispatcher.dispatch(ctx);

  assert(res.type === "none");

  assertEquals(imageCalls.length, 1);
  const imageBody = await imageCalls[0].json();
  assertEquals(imageBody, {
    prompt,
    n: 1,
    response_format: "b64_json",
    size: "512x512",
  });

  assertEquals(uploadCalls.length, 1);
  const uploadFormData = await uploadCalls[0].formData();
  assertEquals(uploadFormData.getAll("channels"), [ctx.event.channelId]);
  assertEquals(uploadFormData.getAll("thread_ts"), [""]);
  assertEquals(uploadFormData.getAll("filename"), ["text2image.png"]);
  assertEquals(uploadFormData.getAll("filetype"), ["png"]);
  assertEquals(uploadFormData.getAll("title"), [prompt]);
  assertEquals(uploadFormData.has("file"), true);
});

Deno.test("text2image image generation failed", async () => {
  const { imageCalls, uploadCalls } = setup({
    imageResponse: new Response(JSON.stringify({ error: "DUMMY_ERROR" }), {
      status: 400,
    }),
    uploadResponse: new Response(JSON.stringify({/* DUMMY */})),
  });

  const prompt = "cyber punk world";
  const ctx = createContext(`<@BOT> text2image ${prompt}`, {
    env: { OPENAI_API_KEY },
  });
  const res = await mentionCommandDispatcher.dispatch(ctx);

  assert(res.type === "message");
  assertEquals(
    res.text,
    '画像の生成に失敗したぞ\n```\n{"error":"DUMMY_ERROR"}\n```',
  );

  assertEquals(imageCalls.length, 1);
  assertEquals(uploadCalls.length, 0);
});

Deno.test("text2image image upload failed", async () => {
  const { imageCalls, uploadCalls } = setup({
    imageResponse: new Response(
      JSON.stringify(FIXTURE_IMAGES_GENERATIONS_RESPONSE),
    ),
    uploadResponse: new Response(
      JSON.stringify({ error: "DUMMY_ERROR" }),
      { status: 400 },
    ),
  });

  const prompt = "cyber punk world";
  const ctx = createContext(`<@BOT> text2image ${prompt}`, {
    env: { OPENAI_API_KEY },
  });
  const res = await mentionCommandDispatcher.dispatch(ctx);

  assert(res.type === "message");
  assertEquals(
    res.text,
    '画像のアップロードに失敗したぞ\n```\n{"error":"DUMMY_ERROR"}\n```',
  );

  assertEquals(imageCalls.length, 1);
  assertEquals(uploadCalls.length, 1);
});
