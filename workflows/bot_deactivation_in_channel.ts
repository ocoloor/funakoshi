import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { BOT_DEACTIVATION_IN_CHANNEL_WORKFLOW_ID } from "../bot/management.ts";
import { removeCommandTriggersFromChannelFunctionDef } from "../functions/bot/remove_command_triggers_from_channel.ts";

export const botDeactivationInChannelWorkflow = DefineWorkflow({
  callback_id: BOT_DEACTIVATION_IN_CHANNEL_WORKFLOW_ID,
  title: "Bot deactivation in the channel workflow",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
      userId: { type: Schema.slack.types.user_id },
    },
    required: ["channelId", "userId"],
  },
  output_parameters: { properties: {}, required: [] },
});

botDeactivationInChannelWorkflow.addStep(
  removeCommandTriggersFromChannelFunctionDef,
  botDeactivationInChannelWorkflow.inputs,
);
