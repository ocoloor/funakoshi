import { createMessageCommandSlackTrigger } from "gbas/mod.ts";
import { botMessageCommandWorkflow } from "../workflows/bot_message_command.ts";

export default createMessageCommandSlackTrigger({
  // set valid channel_ids in runtime
  channelIds: ["DUMMY_CHANNEL_ID"],
  workflow: botMessageCommandWorkflow,
});
