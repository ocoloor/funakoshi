import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import * as datetime from "std/datetime/mod.ts";
import botMentionCommandTrigger from "../triggers/bot_mention_command.ts";
import botMessageCommandTrigger from "../triggers/bot_message_command.ts";
import botReactionCommandTrigger from "../triggers/bot_reaction_command.ts";
import {
  setupEventTriggers,
  setupScheduledTriggers,
} from "../lib/slack_api.ts";

export const BOT_SCHEDULED_MAINTENANCE_WORKFLOW_ID =
  "bot_scheduled_maintenance_workflow" as const;
export const BOT_SCHEDULED_MAINTENANCE_TRIGGER = {
  type: "scheduled",
  name: "Bot scheduled maintenance trigger",
  workflow: `#/workflows/${BOT_SCHEDULED_MAINTENANCE_WORKFLOW_ID}`,
  inputs: {},
  schedule: {
    start_time: datetime.format(
      // set 1 day after
      // timezone in platform is probably utc
      new Date(new Date().getTime() + datetime.HOUR * 9 + datetime.DAY),
      "yyyy-MM-ddT05:00:00",
    ),
    timezone: "Asia/Tokyo",
    frequency: { type: "daily" },
  },
} as const;

export const setupActiveChannelTriggers = async (
  { channelIds, client }: { channelIds: string[]; client: SlackAPIClient },
) => {
  await setupEventTriggers({
    channelIds,
    client,
    triggers: [
      botMentionCommandTrigger,
      botMessageCommandTrigger,
      botReactionCommandTrigger,
    ],
  });
};

export const setupWorkspaceScheduledTriggers = async (
  { client }: { client: SlackAPIClient },
) => {
  await setupScheduledTriggers({
    client,
    triggers: [BOT_SCHEDULED_MAINTENANCE_TRIGGER],
  });
};
