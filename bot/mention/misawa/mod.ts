import { createMentionCommand } from "gbas/mod.ts";

const ENDPOINT = "https://horesase.github.io/horesase-boys/meigens.json";

export const misawa = createMentionCommand({
  name: "misawa",
  pattern: /^misawa(\s+(.+))?$/,
  examples: [
    "misawa - ミサワをランダムに表示する",
    "misawa <query> - クエリに合致するミサワをランダムに表示する",
  ],
  execute: async (c) => {
    const res = await fetch(ENDPOINT);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const meigens: Array<
      { title: string; body: string; character: string; image: string }
    > = await res.json();
    const q = c.match[2];
    const results = q
      ? meigens.filter((meigen) => {
        return (["title", "body", "character"] as const).some((key) =>
          meigen[key].includes(q)
        );
      })
      : meigens;
    if (results.length === 0) {
      return c.res.message("ミサワが見つからなかったぞ");
    }
    return c.res.message(
      c.randomChoice(results).image.replace(
        "http://",
        "https://",
      ),
    );
  },
  outgoingDomains: ["horesase.github.io"],
});
