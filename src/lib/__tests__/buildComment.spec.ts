import { Project } from "ts-morph";
import { describe, it, expect, beforeAll } from "vitest";
import { buildComment } from "../buildComment";

describe("buildComment", () => {
  let project: Project;
  beforeAll(() => {
    project = new Project({ compilerOptions: { strict: true } });
  });

  const baseParam = {
    source: `
        const a: string = 1;
      `,
    fileName: "test.ts",
    lineNumber: 2,
    message: "",
    commentType: 1,
    errorCode: 2322,
    withErrorCode: true,
  };

  it.each([
    {
      ...baseParam,
      expected: "        // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      commentType: 2,
      expected: "        // @ts-ignore TS2322",
    },
    {
      ...baseParam,
      message: "test message",
      commentType: 2,
      expected: "        // @ts-ignore TS2322 -- test message",
    },
    {
      ...baseParam,
      commentType: 2,
      withErrorCode: false,
      expected: "        // @ts-ignore",
    },
    {
      ...baseParam,
      commentType: 2,
      message: "test message",
      withErrorCode: false,
      expected: "        // @ts-ignore -- test message",
    },
    {
      ...baseParam,
      source: `
      function func(num: number) {
        if(foo) {
          return num.map(n => n)
        }
      }
      `,
      lineNumber: 4,
      expected: "          // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(num: number) {
        return <div>{num.map(n => n)}</div>
      }
      `,
      lineNumber: 3,
      expected: "        // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(num: number) {
        return (
          <div>{num.map(n => n)}</div>
        )
      }
      `,
      lineNumber: 4,
      expected: "          // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(num: number) {
        return (
          <div>
            <div>{num.map(n => n)}</div>
            <div>foo</div>
          </div>
        )
      }
      `,
      lineNumber: 5,
      expected: "            {/* @ts-expect-error TS2322 */}",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      message: "test message",
      source: `
      function tsxFunc(num: number) {
        return (
          <div>
            <div>{num.map(n => n)}</div>
            <div>foo</div>
          </div>
        )
      }
    `,
      lineNumber: 5,
      expected: "            {/* @ts-expect-error TS2322 -- test message */}",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(num: number) {
        return (
          <div>
            <div>foo</div>
            <div>{num.map(n => n)}</div>
          </div>
        )
      }
      `,
      lineNumber: 6,
      expected: "            {/* @ts-expect-error TS2322 */}",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(num: number) {
        return (
          <div>{
            num.map(n => n)
          }</div>
        )
      }
      `,
      lineNumber: 5,
      expected: "            // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
      function tsxFunc(classList: string[]) {
        return (
          <div
            className="classList"
          >foo</div>
        )
      }
      `,
      lineNumber: 5,
      expected: "            // @ts-expect-error TS2322",
    },
    {
      ...baseParam,
      fileName: "target.tsx",
      source: `
function tsxFunc(num: number) {
  return (
    <div>
      {overlap > 0 && (<>
        <div>foo</div>
        <div>{num.map(n => n)}</div>
      </>)}
    </div>
  )
}
`,
      lineNumber: 6,
      expected: "        {/* @ts-expect-error TS2322 */}",
    },
  ])(
    "build comment",
    ({
      source,
      fileName,
      lineNumber,
      commentType,
      errorCode,
      withErrorCode,
      expected,
      message,
    }) => {
      const sourceFile = project.createSourceFile(fileName, source, {
        overwrite: true,
      });
      const result = buildComment({
        sourceFile,
        lineNumber,
        commentType,
        errorCode,
        withErrorCode,
        message,
      });

      expect(result).toBe(expected);
    },
  );
});
