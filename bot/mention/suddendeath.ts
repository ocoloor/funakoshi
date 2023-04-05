import { createMentionCommand } from "gbas/mod.ts";
import easta from "easta";

const CHAR_LENGTHS: Record<ReturnType<typeof easta>, number> = {
  A: 2,
  F: 2,
  H: 1,
  N: 1,
  Na: 1,
  W: 2,
};

// Originally ported from: https://github.com/saihoooooooo/hubot-suddendeath
export const suddendeath = createMentionCommand({
  name: "suddendeath",
  pattern: /^(?:(?:><)|(?:&gt;&lt;)|(?:＞＜))\s*(.+)$/,
  examples: [">< <message> - ＞ 突然の死 ＜"],
  execute: (c) => {
    const message = c.match[1].replace(/(^\s+)|(\s+$)/g, "");
    if (!message) {
      return c.res.message("メッセージを指定してください");
    }
    const messageLength = message.split("").reduce((length, char) => {
      return length + CHAR_LENGTHS[easta(char)];
    }, 0);
    const length = Math.floor(messageLength / 2);
    const rows = [
      `＿${"人".repeat(length + 2)}＿`,
      `＞　${message}　＜`,
      `￣Y${"^Y".repeat(length)}￣`,
    ];
    return c.res.message(rows.join("\n"), { isMrkdwn: false });
  },
});
