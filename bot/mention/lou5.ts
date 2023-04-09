import { createMentionCommand } from "gbas/mod.ts";

export const lou5 = createMentionCommand({
  name: "lou5",
  examples: ["lou5 <message> - ルー語に変換する"],
  pattern: /^(?:lou5|ルー語)\s+([\s\S]+)/i,
  execute: async (c) => {
    const text = c.match[1];
    const res = await fetch("https://lou5.jp/api", {
      method: "post",
      body: new URLSearchParams({ text }),
    });
    if (!res.ok) {
      return c.res.message(`エラーが発生したぞ: \`${await res.text()}\``);
    }
    return c.res.message(await res.text());
  },
  outgoingDomains: ["lou5.jp"],
});
