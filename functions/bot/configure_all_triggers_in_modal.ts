import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { getJoinedPublicNoSharedChannels } from "../../lib/slack_api.ts";
import {
  setupActiveChannelTriggers,
  setupWorkspaceScheduledTriggers,
} from "../../bot/management.ts";

export const ConfigureAllTriggersInModalFunctionDef = DefineFunction({
  callback_id: "configure_all_triggers_in_modal",
  title: "Configure all triggers for the bot in modal",
  source_file: "functions/bot/configure_all_triggers_in_modal.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["interactivity"],
  },
  output_parameters: { properties: {}, required: [] },
});

const BASE_MODAL_VIEW = {
  title: { type: "plain_text", text: "設定 (funakoshi)" },
  close: { type: "plain_text", text: "閉じる" },
};

export default SlackFunction(
  ConfigureAllTriggersInModalFunctionDef,
  async ({ inputs, client }) => {
    const botJoinedChannelIds =
      (await getJoinedPublicNoSharedChannels({ client })).map((c) => c.id);
    const res = await client.views.open({
      interactivity_pointer: inputs.interactivity.interactivity_pointer,
      view: {
        ...BASE_MODAL_VIEW,
        type: "modal",
        callback_id: "configure_active_channels",
        submit: { type: "plain_text", text: "有効にする" },
        blocks: [
          {
            type: "input",
            block_id: "channels",
            element: {
              type: "multi_channels_select",
              initial_channels: botJoinedChannelIds,
              action_id: "action",
            },
            label: {
              type: "plain_text",
              text: "ボットを有効にするチャンネル",
            },
          },
        ],
      },
    });
    if (!res.ok) {
      return {
        error: `client.views.open failed: ${
          res.error?.toString() || "unknown"
        }`,
      };
    }
    return { completed: false };
  },
).addViewSubmissionHandler(
  ["configure_active_channels"],
  async ({ client, view }) => {
    const channelIds = view.state.values.channels.action.selected_channels;
    await setupActiveChannelTriggers({ channelIds, client });
    return {
      response_action: "update",
      view: {
        ...BASE_MODAL_VIEW,
        type: "modal",
        callback_id: "configure_all_channels",
        submit: { type: "plain_text", text: "有効にする" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "指定のチャンネルでボットが有効になりました :white_check_mark:\n\n次は, ワークスペースレベルのワークフローを有効にします.",
            },
          },
        ],
      },
    };
  },
).addViewSubmissionHandler(["configure_all_channels"], async ({ client }) => {
  await setupWorkspaceScheduledTriggers({ client });
  return {
    response_action: "update",
    view: {
      ...BASE_MODAL_VIEW,
      "type": "modal",
      "callback_id": "completion",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              "*Complete!*\n\n全てのワークフローが有効になりました :white_check_mark:",
          },
        },
      ],
    },
  };
});
