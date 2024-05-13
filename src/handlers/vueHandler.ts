import colors from "ansi-colors";
import { readFile, writeFile } from "fs/promises";
import { Project } from "ts-morph";
import { extractTypeScriptFromVue } from "../lib/extractTypeScriptFromVue";
import { generateProgressBar } from "../lib/progressBar";
import { suppressTsErrors } from "../lib/suppressTsErrors";
import path from "node:path";

export const vueHandler = async ({
  tsconfigPath,
  commentType,
  errorCode,
  targetFilePaths,
  pathToSource,
  message,
  errorCodeFilter,
}: DefaultOptions & {
  targetFilePaths: string[];
}): Promise<number> => {
  // Extract script from vue files
  const allFiles = await Promise.all(
    targetFilePaths.map(async (path) => {
      const fullText = await readFile(path, "utf8");
      const script = extractTypeScriptFromVue(fullText);
      return {
        path,
        fullText,
        script,
      };
    }),
  );

  if (errorCodeFilter) {
    console.log(`Suppressing only ${errorCodeFilter} codes`);
  }

  // Filter only files with script and in source directory
  const grepPath = path.resolve(pathToSource);
  const targetFiles = allFiles.filter(
    (file) => file.script !== "" && file.path.startsWith(grepPath),
  );

  // Start progress bar
  const progressBar = generateProgressBar(colors.green);
  progressBar.start(targetFiles.length, 0);

  // Add source to project
  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const targetFilesWithSourceFile = targetFiles.map((file) => {
    const sourceFile = project.createSourceFile(`${file.path}.ts`, file.script);

    return {
      ...file,
      sourceFile,
    };
  });

  // Rewrite script in vue file with script with comment
  // NOTE: Running in series because the progress bar count does not work well in parallel
  let insertedCommentCount = 0;
  for await (const file of targetFilesWithSourceFile) {
    const { text: scriptWithComment, count } = suppressTsErrors({
      sourceFile: file.sourceFile,
      commentType,
      withErrorCode: errorCode,
      message,
      errorCodeFilter,
    });

    const newText = file.fullText.replace(file.script, scriptWithComment);
    await writeFile(file.path, newText);

    insertedCommentCount += count;
    progressBar.increment();
  }

  progressBar.stop();

  return insertedCommentCount;
};
