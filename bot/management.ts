import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { PopulatedArray } from "deno-slack-api/type-helpers.ts";
import * as datetime from "std/datetime/mod.ts";
import botMentionCommandTrigger from "../triggers/bot_mention_command.ts";
import botMessageCommandTrigger from "../triggers/bot_message_command.ts";
import botReactionCommandTrigger from "../triggers/bot_reaction_command.ts";
import {
  setupEventTriggers,
  setupScheduledTriggers,
} from "../lib/slack_api.ts";

export const BOT_ACTIVATION_IN_CHANNEL_WORKFLOW_ID =
  "bot_activation_in_channel_workflow" as const;
export const BOT_ACTIVATION_IN_CHANNEL_TRIGGER = {
  type: "event",
  name: "Bot activation in the channel trigger",
  description: "Activate the bot when joining the channel",
  event: {
    // set valid channel_ids in runtime
    channel_ids: ["DUMMY_CHANNEL_ID"] as PopulatedArray<string>,
    event_type: "slack#/events/user_joined_channel",
  },
  workflow: `#/workflows/${BOT_ACTIVATION_IN_CHANNEL_WORKFLOW_ID}`,
  inputs: {
    channelId: { value: "{{data.channel_id}}" },
    inviterId: { value: "{{data.inviter_id}}" },
    userId: { value: "{{data.user_id}}" },
  },
} as const;

export const BOT_DEACTIVATION_IN_CHANNEL_WORKFLOW_ID =
  "bot_deactivation_in_channel_workflow" as const;
export const BOT_DEACTIVATION_IN_CHANNEL_TRIGGER = {
  type: "event",
  name: "Bot deactivation in the channel trigger",
  description: "deactivate the bot when left the channel",
  event: {
    // set valid channel_ids in runtime
    channel_ids: ["DUMMY_CHANNEL_ID"] as PopulatedArray<string>,
    event_type: "slack#/events/user_left_channel",
  },
  workflow: `#/workflows/${BOT_DEACTIVATION_IN_CHANNEL_WORKFLOW_ID}`,
  inputs: {
    channelId: { value: "{{data.channel_id}}" },
    userId: { value: "{{data.user_id}}" },
  },
} as const;

export const BOT_ALL_CHANNEL_CONFIGURATION_WORKFLOW_ID =
  "bot_all_channel_configuration_workflow" as const;
export const BOT_ALL_CHANNEL_CONFIGURATION_TRIGGER = {
  type: "event",
  name: "Bot all channel configuration trigger",
  description:
    "Refresh the bot management triggers for all channels when creating a new channel",
  event: {
    event_type: "slack#/events/channel_created",
  },
  workflow: `#/workflows/${BOT_ALL_CHANNEL_CONFIGURATION_WORKFLOW_ID}`,
  inputs: {
    channelId: { value: "{{data.channel_id}}" },
  },
} as const;

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

export const setupAllChannelTriggers = async (
  { channelIds, client }: { channelIds: string[]; client: SlackAPIClient },
) => {
  await setupEventTriggers({
    channelIds,
    client,
    triggers: [
      BOT_ACTIVATION_IN_CHANNEL_TRIGGER,
      BOT_DEACTIVATION_IN_CHANNEL_TRIGGER,
    ],
  });
};

export const setupWorkspaceTriggers = async (
  { client }: { client: SlackAPIClient },
) => {
  await setupEventTriggers({
    client,
    triggers: [BOT_ALL_CHANNEL_CONFIGURATION_TRIGGER],
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
