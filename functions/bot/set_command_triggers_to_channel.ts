import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getJoinedPublicNoSharedChannels } from "../../lib/slack_api.ts";
import { setupActiveChannelTriggers } from "../../bot/management.ts";

export const setCommandTriggersToChannelFunctionDef = DefineFunction({
  callback_id: "set_command_triggers_to_channel",
  title: "Set command triggers for the bot to the channel",
  source_file: "functions/bot/set_command_triggers_to_channel.ts",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
      userId: { type: Schema.slack.types.user_id },
      // Workaround: Remove this if user_id filter becomes available on trigger
      isTriggeredByBotOnly: { type: Schema.types.boolean },
    },
    required: ["channelId", "userId"],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  setCommandTriggersToChannelFunctionDef,
  async ({ inputs, client }) => {
    // Workaround: Remove this if user_id filter becomes available on trigger
    if (inputs.isTriggeredByBotOnly) {
      const resTest = await client.auth.test();
      if (!resTest.ok) {
        return {
          error: `client.auth.test failed: ${
            resTest.error?.toString() || "unknown"
          }`,
        };
      }
      if (resTest.user_id !== inputs.userId) {
        return { outputs: {} };
      }
    }
    const botJoinedChannelIds =
      (await getJoinedPublicNoSharedChannels({ client }))
        .map((c) => c.id);
    const channelIds = [...new Set([...botJoinedChannelIds, inputs.channelId])];
    await setupActiveChannelTriggers({ channelIds, client });
    return { outputs: {} };
  },
);
