import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { BOT_ALL_CHANNEL_CONFIGURATION_WORKFLOW_ID } from "../bot/management.ts";
import { setManagementTriggersToAllChannelsFunctionDef } from "../functions/bot/set_management_triggers_to_all_channels.ts";

export const botAllChannelConfigurationWorkflow = DefineWorkflow({
  callback_id: BOT_ALL_CHANNEL_CONFIGURATION_WORKFLOW_ID,
  title: "Bot all channel configuration workflow",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
    },
    required: ["channelId"],
  },
  output_parameters: { properties: {}, required: [] },
});

botAllChannelConfigurationWorkflow.addStep(
  setManagementTriggersToAllChannelsFunctionDef,
  botAllChannelConfigurationWorkflow.inputs,
);
