import { Trigger } from "deno-slack-api/types.ts";
import { BOT_ALL_CHANNEL_CONFIGURATION_TRIGGER } from "../bot/management.ts";
import { botAllChannelConfigurationWorkflow } from "../workflows/bot_all_channel_configuration.ts";

const botAllChannelConfigurationTrigger: Trigger<
  typeof botAllChannelConfigurationWorkflow.definition
> = BOT_ALL_CHANNEL_CONFIGURATION_TRIGGER;
export default botAllChannelConfigurationTrigger;
