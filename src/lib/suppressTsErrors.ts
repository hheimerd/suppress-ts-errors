import { SourceFile } from "ts-morph";
import { buildComment } from "./buildComment";

interface SuppressTsErrorArgs {
  sourceFile: SourceFile;
  commentType: CommentType;
  withErrorCode: boolean;
  message: string;
  errorCodeFilter?: number[];
}

export const suppressTsErrors = ({
  sourceFile,
  commentType,
  withErrorCode,
  message,
  errorCodeFilter,
}: SuppressTsErrorArgs): {
  text: string;
  count: number;
} => {
  const sourceTextArray = sourceFile.getFullText().split("\n");
  let insertedCommentCount = 0;
  const listOfLineNumberWithErrors: number[] = [];

  sourceFile.getPreEmitDiagnostics().forEach((d) => {
    const lineNumber = d.getLineNumber();
    const diagnosticCategory = d.getCategory();

    // Skip not error
    if (lineNumber === undefined || diagnosticCategory !== 1) {
      return;
    }

    // Skip errors in rows with errors already found
    if (listOfLineNumberWithErrors.includes(lineNumber)) {
      return;
    }

    if (
      errorCodeFilter !== undefined &&
      !errorCodeFilter.includes(d.getCode())
    ) {
      return;
    }

    // Build comments with indentation matching the error location
    const insertComment = buildComment({
      sourceFile,
      lineNumber,
      commentType: commentType,
      errorCode: d.getCode(),
      withErrorCode: withErrorCode,
      message: message,
    });

    // Insert comment
    sourceTextArray.splice(
      lineNumber + insertedCommentCount - 1,
      0,
      insertComment,
    );

    // Increment comment counts
    insertedCommentCount += 1;
    listOfLineNumberWithErrors.push(lineNumber);
  });

  return {
    text: sourceTextArray.join("\n"),
    count: insertedCommentCount,
  };
};
