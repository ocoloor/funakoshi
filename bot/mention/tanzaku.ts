import { createMentionCommand } from "gbas/mod.ts";
import tanzakunize from "tanzaku";

export const tanzaku = createMentionCommand({
  name: "tanzaku",
  pattern: /^tanzaku\s+(.+)$/i,
  examples: ["tanzaku <message> - メッセージを短冊にする"],
  execute: (c) => {
    return c.res.message(tanzakunize(c.match[1]), { isMrkdwn: false });
  },
});
