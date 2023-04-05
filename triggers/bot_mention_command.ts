import { createMentionCommandSlackTrigger } from "gbas/mod.ts";
import { botMentionCommandWorkflow } from "../workflows/bot_mention_command.ts";

export default createMentionCommandSlackTrigger({
  // set valid channel_ids in runtime
  channelIds: ["DUMMY_CHANNEL_ID"],
  workflow: botMentionCommandWorkflow,
});
