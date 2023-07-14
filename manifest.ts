import { Manifest } from "deno-slack-sdk/mod.ts";
import {
  mentionCommandDispatcher,
  messageCommandDispatcher,
  reactionCommandDispatcher,
} from "./bot/dispatchers.ts";
import { botConfigurationModalWorkflow } from "./workflows/bot_configuration_modal.ts";
import { botMentionCommandWorkflow } from "./workflows/bot_mention_command.ts";
import { botMessageCommandWorkflow } from "./workflows/bot_message_command.ts";
import { botReactionCommandWorkflow } from "./workflows/bot_reaction_command.ts";
import { botScheduledMaintenanceWorkflow } from "./workflows/bot_scheduled_maintenance.ts";
import { botWebhookMaintenanceWorkflow } from "./workflows/bot_webhook_maintenance.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "funakoshi",
  description: "帝王",
  icon: "assets/icon.jpg",
  functions: [],
  workflows: [
    botConfigurationModalWorkflow,
    botMentionCommandWorkflow,
    botMessageCommandWorkflow,
    botReactionCommandWorkflow,
    botScheduledMaintenanceWorkflow,
    botWebhookMaintenanceWorkflow,
  ],
  outgoingDomains: [
    ...new Set([
      ...mentionCommandDispatcher.outgoingDomains,
      ...messageCommandDispatcher.outgoingDomains,
      ...reactionCommandDispatcher.outgoingDomains,
      // for dependent modules
      "esm.sh",
    ]),
  ],
  botScopes: [
    "app_mentions:read",
    "channels:history",
    "channels:read", // configure_bot
    "commands",
    "chat:write",
    "chat:write.customize",
    "chat:write.public",
    "files:write", // text2image (client.files.upload)
    "reactions:read",
    "reactions:write",
    "triggers:read", // configure_bot
    "triggers:write", // configure_bot
  ],
});
