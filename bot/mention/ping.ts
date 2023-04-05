import { createMentionCommand } from "gbas/mod.ts";

export const ping = createMentionCommand({
  examples: ["ping - PONG"],
  name: "ping",
  pattern: /^ping$/,
  execute: (c) => c.res.message("PONG"),
});
