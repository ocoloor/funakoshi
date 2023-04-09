import { createReactionCommandSlackWorkflow } from "gbas/mod.ts";
import { handleReactionCommandFuncDef } from "../functions/bot/handle_reaction_command.ts";
import { respondAsBotFunctionDef } from "../functions/bot/respond_as_bot.ts";

export const botReactionCommandWorkflow = createReactionCommandSlackWorkflow({
  reactionCommandFuncDef: handleReactionCommandFuncDef,
  respondAsBotFuncDef: respondAsBotFunctionDef,
  isQuickResponseEnabled: true,
});
