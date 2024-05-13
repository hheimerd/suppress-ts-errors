type CommentType = 1 | 2;

type DefaultOptions = {
  tsconfigPath: string;
  commentType: CommentType;
  errorCode: boolean;
  pathToSource: string;
  message: string;
  errorCodeFilter?: number[];
};
