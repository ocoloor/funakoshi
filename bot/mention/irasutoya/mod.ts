import { createMentionCommand } from "gbas/mod.ts";

const ENDPOINT = "https://www.irasutoya.com/feeds/posts/summary";

type MinimumIrasutoyaResponse = {
  feed?: {
    entry?: Array<{
      "media$thumbnail"?: {
        url?: string;
      };
    }>;
  };
};

export const irasutoya = createMentionCommand({
  name: "irasutoya",
  pattern: /^irasutoya\s+(.+)$/,
  examples: ["irasutoya - いらすとやの画像をランダムで表示する"],
  execute: async (c) => {
    const q = c.match[1];
    // 検索クエリ付きでリクエストした場合、合計数が取得できないため100件だけ取得する
    const res = await fetch(
      `${ENDPOINT}?alt=json&max-results=100&q=${encodeURI(q)}`,
    );
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const result: MinimumIrasutoyaResponse = await res.json();
    const entries = result?.feed?.entry;
    if (!entries || entries.length === 0) {
      return c.res.message("いらすとが見つからなかったぞ");
    }
    const url = c.randomChoice(entries)?.media$thumbnail?.url;
    if (!url || typeof url !== "string") {
      return c.res.message("いらすとが見つからなかったぞ");
    }
    return c.res.message(
      url.replace("/s72-c/", "/").replace(/=s72-c$/i, "").replace(
        "http://",
        "https://",
      ),
    );
  },
  outgoingDomains: ["www.irasutoya.com"],
});
