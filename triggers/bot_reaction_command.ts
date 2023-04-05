import { createReactionCommandSlackTrigger } from "gbas/mod.ts";
import { botReactionCommandWorkflow } from "../workflows/bot_reaction_command.ts";

export default createReactionCommandSlackTrigger({
  // set valid channel_ids in runtime
  channelIds: ["DUMMY_CHANNEL_ID"],
  workflow: botReactionCommandWorkflow,
});
