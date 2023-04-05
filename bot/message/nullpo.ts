import { createMessageCommand } from "gbas/mod.ts";

export const nullpo = createMessageCommand({
  name: "nullpo",
  pattern: /ぬるぽ|ヌルポ|nullpo/i,
  examples: ["ぬるぽ - ｶﾞｯ"],
  execute: (c) => c.res.message("ｶﾞｯ"),
});
