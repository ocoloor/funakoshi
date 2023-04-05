import { Trigger } from "deno-slack-api/types.ts";
import { BOT_DEACTIVATION_IN_CHANNEL_TRIGGER } from "../bot/management.ts";
import { botDeactivationInChannelWorkflow } from "../workflows/bot_deactivation_in_channel.ts";

const botDeactivationInChannelTrigger: Trigger<
  typeof botDeactivationInChannelWorkflow.definition
> = BOT_DEACTIVATION_IN_CHANNEL_TRIGGER;
export default botDeactivationInChannelTrigger;
