import { createMentionCommand } from "gbas/mod.ts";

const SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const VIDEO_ENDPOINT = "https://www.youtube.com/watch";

type MinimumSearchResultResponse = {
  items: Array<{ id: { kind: string; videoId: string } }>;
};

export const youtube = createMentionCommand({
  name: "youtube",
  pattern: /^youtube\s+(.+)$/i,
  examples: ["youtube <query> - YouTube動画を表示する"],
  execute: async (c) => {
    const query = c.match[1];
    const params = new URLSearchParams({
      maxResults: "15",
      order: "relevance",
      part: "snippet",
      regionCode: "JP",
      q: query,
      type: "video",
      key: c.env.YOUTUBE_API_KEY,
    });
    const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const { items = [] }: MinimumSearchResultResponse = await res.json();
    if (items.length === 0) {
      return c.res.message(`動画が見つからなかったぞ: ${query}}`);
    }
    const { videoId } = c.randomChoice(items).id;
    return c.res.message(`${VIDEO_ENDPOINT}?v=${videoId}`);
  },
  outgoingDomains: ["www.googleapis.com"],
});
