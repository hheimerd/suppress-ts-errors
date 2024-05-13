import type { Arguments, Argv } from "yargs";
import { DEFAULT_OPTIONS } from "../lib/constants";
import { tsHandler } from "../handlers/tsHandler";
import { tsconfigExists } from "../lib/validator";

export const command: string[] = ["*", "ts"];
export const desc = "Suppress TS errors in TypeScript files";

export const builder = (yargs: Argv<DefaultOptions>): Argv<DefaultOptions> =>
  yargs.options(DEFAULT_OPTIONS).check(tsconfigExists);

export const handler = (argv: Arguments<DefaultOptions>): void => {
  const {
    commentType,
    tsconfigPath,
    errorCode,
    pathToSource,
    message,
    errorCodeFilter,
  } = argv;

  const insertedCommentCount = tsHandler({
    tsconfigPath,
    commentType,
    errorCode,
    pathToSource,
    message,
    errorCodeFilter: errorCodeFilter?.filter(
      (code) => !Number.isNaN(Number(code)),
    ),
  });

  console.log("\nCompleted 🎉");
  console.log(`suppress errors: ${insertedCommentCount}`);
};
