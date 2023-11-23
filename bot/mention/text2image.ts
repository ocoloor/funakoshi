import { createMentionCommand } from "gbas/mod.ts";

type GenerateImageResponse = {
  ok: true;
  value: {
    created: number;
    data: Array<{ b64_json: string }>;
  };
} | {
  ok: false;
  error: string;
};

const generateImage = async (
  { apiKey, prompt }: { apiKey: string; prompt: string },
): Promise<GenerateImageResponse> => {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: "dall-e-3",
      n: 1,
      response_format: "b64_json",
      size: "1024x1024",
    }),
  });
  if (!res.ok) {
    return { ok: false, error: await res.text() };
  }
  const value = await res.json();
  return { ok: true, value };
};

export const text2image = createMentionCommand({
  name: "text2image",
  examples: ["text2image <text> - 文章から画像を生成する"],
  pattern: /^(?:text2image|t2i)\s+(.+)$/i,
  execute: async (c) => {
    const prompt = c.match[1];
    const message = await c.interrupt.postMessage(
      "画像を生成しているぞ... :art:",
    );
    const res = await generateImage({ apiKey: c.env.OPENAI_API_KEY, prompt });
    await c.interrupt.deleteMessage({
      channelId: message.channelId,
      messageTs: message.messageTs,
    });
    if (!res.ok) {
      return c.res.message(`画像の生成に失敗したぞ
\`\`\`
${res.error}
\`\`\``);
    }

    const base64Image: string = res.value.data[0].b64_json;
    const imageData = Uint8Array.from(
      atob(base64Image),
      (c) => c.charCodeAt(0),
    );
    // client.files.upload は動作しないため、直接APIを叩く
    const formData = new FormData();
    formData.append("channels", c.event.channelId);
    formData.append("thread_ts", c.event.threadTs || "");
    formData.append("filetype", "png");
    formData.append("filename", "text2image.png");
    formData.append("file", new Blob([imageData], { type: "image/png" }));
    formData.append("title", prompt);
    const resUpload = await fetch("https://slack.com/api/files.upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.token}`,
      },
      body: formData,
    });
    if (!resUpload.ok) {
      return c.res.message(
        `画像のアップロードに失敗したぞ
\`\`\`
${await resUpload.text()}
\`\`\``,
      );
    }

    // 画像のアップロード (投稿) をもって処理完了とするので何も返さない
    return c.res.none();
  },
});
