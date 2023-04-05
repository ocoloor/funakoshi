import { createMentionCommandSlackFunction } from "gbas/mod.ts";
import { mentionCommandDispatcher } from "../../bot/dispatchers.ts";

const { def: handleMentionCommandFuncDef, func: handleMentionCommandFunc } =
  createMentionCommandSlackFunction({
    sourceFile: "functions/bot/handle_mention_command.ts",
    dispatcher: mentionCommandDispatcher,
  });
export { handleMentionCommandFuncDef };
export default handleMentionCommandFunc;
