import { createMessageCommandSlackFunction } from "gbas/mod.ts";
import { messageCommandDispatcher } from "../../bot/dispatchers.ts";

const { def: handleMessageCommandFuncDef, func: botMessageCommandFunc } =
  createMessageCommandSlackFunction({
    sourceFile: "functions/bot/handle_message_command.ts",
    dispatcher: messageCommandDispatcher,
  });
export { handleMessageCommandFuncDef };
export default botMessageCommandFunc;
