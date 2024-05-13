import { Project } from "ts-morph";
import { generateProgressBar } from "../lib/progressBar";
import { suppressTsErrors } from "../lib/suppressTsErrors";
import path from "node:path";

export const tsHandler = ({
  tsconfigPath,
  commentType,
  errorCode,
  message,
  pathToSource,
  errorCodeFilter,
}: DefaultOptions): number => {
  // Get all project files
  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const grepPath = path.resolve(pathToSource);

  // Filter only files with script and in source directory
  const sourceFiles = project.getSourceFiles().filter((sourceFile) => {
    const filePath = sourceFile.getFilePath();
    return filePath.startsWith(grepPath);
  });

  if (errorCodeFilter) {
    console.log(`Suppressing only ${errorCodeFilter} codes`);
  }

  // Initialize progress bar
  const progressBar = generateProgressBar();
  progressBar.start(sourceFiles.length, 0);

  // Rewrite source in ts/tsx file with source with comment
  let insertedCommentCount = 0;
  sourceFiles.forEach((sourceFile) => {
    const { text: textWithComment, count: insertedCommentCountPerFile } =
      suppressTsErrors({
        sourceFile,
        commentType,
        withErrorCode: errorCode,
        message,
        errorCodeFilter: errorCodeFilter,
      });

    if (insertedCommentCountPerFile > 0) {
      sourceFile.replaceWithText(textWithComment);
      sourceFile.saveSync();
      insertedCommentCount += insertedCommentCountPerFile;
    }
    progressBar.increment();
  });

  progressBar.stop();
  return insertedCommentCount;
};
