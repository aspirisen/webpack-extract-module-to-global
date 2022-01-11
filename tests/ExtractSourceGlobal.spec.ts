import * as path from "path";
import webpack from "webpack";
import prettier from "prettier";
import { createFsFromVolume, Volume } from "memfs";
import { ExtractModuleToGlobal } from "../src";

describe("ExtractModuleToGlobal", () => {
  it("should extract module", (done) => {
    const compiler = webpack({
      mode: "development",
      context: path.resolve(__dirname, "./spec-app"),
      entry: "./index.ts",
      target: ["web", "es5"],
      output: {
        path: "/",
        filename: "out.js",
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
      },
      module: {
        rules: [
          {
            include: /a.ts/,
            loader: ExtractModuleToGlobal.loader,
          },
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
          },
        ],
      },
      devtool: false,
      plugins: [new ExtractModuleToGlobal()],
    });

    const fs = createFsFromVolume(new Volume());
    compiler.outputFileSystem = fs;

    compiler.run(() => {
      const content = prettier.format(fs.readFileSync("/out.js").toString(), {
        parser: "babel",
      });

      expect(content).toMatchSnapshot();

      const scope = {} as { a: () => string };
      Function(content + "; this.a = a").call(scope);

      expect(scope.a()).toBe("from global space");

      done();
    });
  });
});
