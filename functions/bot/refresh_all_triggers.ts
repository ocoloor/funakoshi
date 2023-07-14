import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getJoinedPublicNoSharedChannels } from "../../lib/slack_api.ts";
import { setupActiveChannelTriggers } from "../../bot/management.ts";

export const refreshAllTriggers = DefineFunction({
  callback_id: "refresh_all_triggers",
  title: "Refresh all triggers for the bot",
  source_file: "functions/bot/refresh_all_triggers.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  refreshAllTriggers,
  async ({ client }) => {
    const botJoinedChannelIds =
      (await getJoinedPublicNoSharedChannels({ client })).map((c) => c.id);
    await setupActiveChannelTriggers({
      channelIds: botJoinedChannelIds,
      client,
    });
    return { outputs: {} };
  },
);
