import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getAllPublicNoSharedChannels } from "../../lib/slack_api.ts";
import { setupAllChannelTriggers } from "../../bot/management.ts";

export const setManagementTriggersToAllChannelsFunctionDef = DefineFunction({
  callback_id: "set_management_triggers_to_all_channels",
  title: "Set management triggers for the bot to all channels",
  source_file: "functions/bot/set_management_triggers_to_all_channels.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  setManagementTriggersToAllChannelsFunctionDef,
  async ({ client }) => {
    const channelIds = (await getAllPublicNoSharedChannels({ client })).map(
      (c) => c.id,
    );
    await setupAllChannelTriggers({ channelIds, client });
    return { outputs: {} };
  },
);
