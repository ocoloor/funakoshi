import { Trigger } from "deno-slack-api/types.ts";
import { BOT_ACTIVATION_IN_CHANNEL_TRIGGER } from "../bot/management.ts";
import { botActivationInChannelWorkflow } from "../workflows/bot_activation_in_channel.ts";

const botActivationInChannelTrigger: Trigger<
  typeof botActivationInChannelWorkflow.definition
> = BOT_ACTIVATION_IN_CHANNEL_TRIGGER;
export default botActivationInChannelTrigger;
