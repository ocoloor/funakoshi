import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { BOT_ACTIVATION_IN_CHANNEL_WORKFLOW_ID } from "../bot/management.ts";
import { setCommandTriggersToChannelFunctionDef } from "../functions/bot/set_command_triggers_to_channel.ts";

export const botActivationInChannelWorkflow = DefineWorkflow({
  callback_id: BOT_ACTIVATION_IN_CHANNEL_WORKFLOW_ID,
  title: "Bot activation in the channel workflow",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
      inviterId: { type: Schema.slack.types.user_id },
      userId: { type: Schema.slack.types.user_id },
    },
    required: ["channelId", "inviterId", "userId"],
  },
  output_parameters: { properties: {}, required: [] },
});

botActivationInChannelWorkflow.addStep(
  setCommandTriggersToChannelFunctionDef,
  { ...botActivationInChannelWorkflow.inputs, isTriggeredByBotOnly: true },
);
