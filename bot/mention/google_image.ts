import { createMentionCommand } from "gbas/mod.ts";

const API_ENDPOINT = "https://customsearch.googleapis.com/customsearch/v1";

type SearchResponse = {
  items: Array<{ link: string }>;
};

const getImages = async (
  { env, query, type = "normal" }: {
    env: Record<string, string>;
    query: string;
    type?: "gif" | "normal";
  },
): Promise<SearchResponse["items"]> => {
  const { GOOGLE_CSE_ID, GOOGLE_CSE_KEY } = env;
  const res = await fetch(`${API_ENDPOINT}?${new URLSearchParams({
    q: query,
    searchType: "image",
    fields: "items(link)",
    gl: "jp",
    hl: "ja",
    cx: GOOGLE_CSE_ID,
    key: GOOGLE_CSE_KEY,
    safe: "off",
    ...(type === "gif"
      ? {
        fileType: "gif",
        hq: "animated",
        tbs: "itp:animated",
      }
      : {}),
  })}`);
  if (!res.ok) {
    throw new Error(`failed to fetch: ${await res.text()}`);
  }
  const body: SearchResponse = await res.json();
  return body.items;
};

export const googleImage = createMentionCommand({
  execute: async (c) => {
    const query = c.match[1];
    const images = await getImages({
      env: c.env,
      query,
      type: "normal",
    });
    if (images.length === 0) {
      return c.res.message("画像が見つからなかったぞ");
    }
    return c.res.message(c.randomChoice(images).link);
  },
  examples: ["image <query> - Google画像検索の画像を表示する"],
  name: "google_image",
  pattern: /^(?:image|img)\s+(.+)$/,
  outgoingDomains: ["customsearch.googleapis.com"],
});

export const googleAnimatedImage = createMentionCommand({
  name: "google_animated_image",
  pattern: /^animate\s+(.+)$/,
  examples: ["animate <query> - Google画像検索のGIF画像を表示する"],
  outgoingDomains: ["customsearch.googleapis.com"],
  execute: async (c) => {
    const query = c.match[1];
    const images = await getImages({ env: c.env, query, type: "gif" });
    if (images.length === 0) {
      return c.res.message("画像が見つからなかったぞ");
    }
    return c.res.message(c.randomChoice(images).link);
  },
});
