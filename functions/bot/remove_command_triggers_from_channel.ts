import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getJoinedPublicNoSharedChannels } from "../../lib/slack_api.ts";
import { setupActiveChannelTriggers } from "../../bot/management.ts";

export const removeCommandTriggersFromChannelFunctionDef = DefineFunction({
  callback_id: "remove_command_triggers_from_channel",
  title: "Remove command triggers for the bot from the channel",
  source_file: "functions/bot/remove_command_triggers_from_channel.ts",
  input_parameters: {
    properties: {
      channelId: { type: Schema.slack.types.channel_id },
      userId: { type: Schema.slack.types.user_id },
    },
    required: ["channelId", "userId"],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  removeCommandTriggersFromChannelFunctionDef,
  async ({ inputs, client }) => {
    const resTest = await client.auth.test();
    if (!resTest.ok) {
      return {
        error: `client.auth.test failed: ${resTest?.error || "unknown"}`,
      };
    }
    if (resTest.user_id !== inputs.userId) {
      return { outputs: {} };
    }
    const botJoinedChannelIds =
      (await getJoinedPublicNoSharedChannels({ client })).map((c) => c.id);
    const channelIds = botJoinedChannelIds.filter((id) =>
      id !== inputs.channelId
    );
    await setupActiveChannelTriggers({ channelIds, client });
    return { outputs: {} };
  },
);
