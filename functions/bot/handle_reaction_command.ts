import { createReactionCommandSlackFunction } from "gbas/mod.ts";
import { reactionCommandDispatcher } from "../../bot/dispatchers.ts";

const {
  def: handleReactionCommandFuncDef,
  func: handleReactionCommandFunc,
} = createReactionCommandSlackFunction({
  dispatcher: reactionCommandDispatcher,
  sourceFile: "functions/bot/handle_reaction_command.ts",
});
export { handleReactionCommandFuncDef };
export default handleReactionCommandFunc;
