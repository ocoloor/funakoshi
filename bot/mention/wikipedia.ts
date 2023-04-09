import { createMentionCommand } from "gbas/mod.ts";

type QueryResponse = {
  batchcomplete: string;
  continue: {
    sroffset: number;
    continue: string;
  };
  query: {
    searchinfo: {
      totalhits: number;
    };
    search: Array<{
      ns: number;
      title: string;
      pageid: number;
      size: number;
      wordcount: number;
      snippet: string;
      timestamp: string;
    }>;
  };
};

export const wikipedia = createMentionCommand({
  name: "wikipedia",
  examples: ["wiki <query> - Wikipediaで検索する"],
  pattern: /^wiki(?:pedia)?\s+(.+)$/i,
  execute: async (c) => {
    const query = c.match[1];
    const res = await fetch(
      `https://ja.wikipedia.org/w/api.php?${new URLSearchParams({
        action: "query",
        format: "json",
        list: "search",
        srlimit: "5",
        srsearch: query,
      })}`,
    );
    if (!res.ok) {
      return c.res.message(`エラーが発生したぞ: \`${await res.text()}\``);
    }
    const body: QueryResponse = await res.json();
    if (body.query.search.length === 0) {
      return c.res.message(`検索結果が見つからなかったぞ: \`${query}\``);
    }
    const { pageid } = c.randomChoice(body.query.search);
    return c.res.message(`https://ja.wikipedia.org/?curid=${pageid}`);
  },
  outgoingDomains: ["ja.wikipedia.org"],
});
