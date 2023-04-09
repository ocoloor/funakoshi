import { createMessageCommandSlackWorkflow } from "gbas/mod.ts";
import { handleMessageCommandFuncDef } from "../functions/bot/handle_message_command.ts";
import { respondAsBotFunctionDef } from "../functions/bot/respond_as_bot.ts";

export const botMessageCommandWorkflow = createMessageCommandSlackWorkflow({
  isQuickResponseEnabled: true,
  messageCommandFuncDef: handleMessageCommandFuncDef,
  respondAsBotFuncDef: respondAsBotFunctionDef,
});
