import { Manifest } from "deno-slack-sdk/mod.ts";
import {
  mentionCommandDispatcher,
  messageCommandDispatcher,
  reactionCommandDispatcher,
} from "./bot/dispatchers.ts";
import { botMentionCommandWorkflow } from "./workflows/bot_mention_command.ts";
import { botMessageCommandWorkflow } from "./workflows/bot_message_command.ts";
import { botReactionCommandWorkflow } from "./workflows/bot_reaction_command.ts";

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
    botMentionCommandWorkflow,
    botMessageCommandWorkflow,
    botReactionCommandWorkflow,
  ],
  outgoingDomains: [
    ...new Set([
      ...mentionCommandDispatcher.outgoingDomains,
      ...messageCommandDispatcher.outgoingDomains,
      ...reactionCommandDispatcher.outgoingDomains,
    ]),
  ],
  botScopes: [
    "app_mentions:read",
    "channels:history",
    "commands",
    "chat:write",
    "chat:write.customize",
    "chat:write.public",
    "files:write", // text2image (client.files.upload)
    "reactions:read",
    "reactions:write",
  ],
});
