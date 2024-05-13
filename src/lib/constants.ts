export const COMMENT_TYPE = {
  EXPECT_ERROR: "@ts-expect-error",
  IGNORE: "@ts-ignore",
};

export const DEFAULT_OPTIONS = {
  "tsconfig-path": {
    type: "string",
    default: "./tsconfig.json",
    alias: "t",
    describe: "Path to tsconfig.json",
    requiresArg: true,
  },
  "comment-type": {
    choices: [1, 2] as const,
    default: 1,
    alias: "c",
    describe:
      "Choice of comment type. 1 is @ts-expected-error, 2 is @ts-ignore. default is 1",
    requiresArg: true,
  },
  "error-code": {
    type: "boolean",
    default: true,
    alias: "e",
    describe: "Add error code to comment. e.g. TS2345.",
    requiresArg: true,
  },
  "error-code-filter": {
    type: "array",
    alias: "ef",
    describe:
      "Comment only specified error code number. e.g. --ef 2345 or --ef 2345 2322",
    requiresArg: false,
  },
  "path-to-source": {
    type: "string",
    default: "./src",
    alias: "s",
    describe: "Path to source, where comments needed. e.g. src/",
    requiresArg: true,
  },
  message: {
    type: "string",
    default: "",
    alias: "m",
    describe: "Message after comment",
    requiresArg: true,
  },
} as const;
