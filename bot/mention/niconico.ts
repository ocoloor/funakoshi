import { createMentionCommand } from "gbas/mod.ts";

const API_ENDPOINT =
  "https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search";
const VIDEO_ENDPOINT = "https://nico.ms/";

type SearchResponse = {
  data: Array<{ contentId: string }>;
  meta: { id: string; totalCount: number; status: number };
};

export const niconico = createMentionCommand({
  name: "niconico",
  pattern: /^(?:ニコニコ|niconico)\s+(.+)$/i,
  examples: ["niconico <query> - ニコニコ動画の動画を検索して表示する"],
  execute: async (c) => {
    const q = c.match[1];
    const params = new URLSearchParams({
      fields: "contentId",
      q,
      targets: "title,description,tags",
      _context: "slack-bot",
      _limit: "20",
      _sort: "-viewCounter",
    });
    const res = await fetch(
      `${API_ENDPOINT}?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const { data = [] }: SearchResponse = await res.json();
    if (data.length === 0) {
      return c.res.message(`動画が見つからなかったぞ: \`${q}\``);
    }
    const { contentId } = c.randomChoice(data);
    return c.res.message(`${VIDEO_ENDPOINT}${contentId}`);
  },
  outgoingDomains: ["api.search.nicovideo.jp"],
});
