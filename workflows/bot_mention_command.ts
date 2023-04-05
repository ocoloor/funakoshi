import { createMentionCommandSlackWorkflow } from "gbas/mod.ts";
import { handleMentionCommandFuncDef } from "../functions/bot/handle_mention_command.ts";
import { respondAsBotFunctionDef } from "../functions/bot/respond_as_bot.ts";

export const botMentionCommandWorkflow = createMentionCommandSlackWorkflow({
  isQuickResponseEnabled: true,
  mentionCommandFuncDef: handleMentionCommandFuncDef,
  respondAsBotFuncDef: respondAsBotFunctionDef,
});
