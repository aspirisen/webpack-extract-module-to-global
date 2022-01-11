import webpack from "webpack";

export class ExtractModuleToGlobal {
  public static pluginName = "ExtractModuleToGlobal";

  public static loader = require.resolve("./ExtractModuleToGlobalLoader");

  private trackPaths: Record<string, [content: string, sourceMap: any]> = {};

  public addSource(path: string, content: string, map: any) {
    this.trackPaths[path] = [content, map];
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap(
      ExtractModuleToGlobal.pluginName,
      (compilation) => {
        const jsHooks =
          webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation
          );

        jsHooks.render.tap(
          ExtractModuleToGlobal.pluginName,
          (source, renderContext) => {
            if (!(source instanceof webpack.sources.ConcatSource)) {
              return source;
            }

            const finalSource = new webpack.sources.ConcatSource();
            const modules = Array.from(
              renderContext.chunkGraph.getChunkModulesIterable(
                renderContext.chunk
              )
            );

            modules.forEach((m) => {
              const resourceName = (m as any).resource;
              const resource = this.trackPaths[resourceName];

              if (!resource) {
                return;
              }

              const [content, sourceMap] = resource;

              const newSource = sourceMap
                ? new webpack.sources.SourceMapSource(
                    content,
                    resourceName,
                    sourceMap
                  )
                : new webpack.sources.OriginalSource(content, resourceName);

              finalSource.add(newSource);
              finalSource.add("\n");
              finalSource.add(";\n");
            });

            finalSource.add(new webpack.sources.CachedSource(source));

            return finalSource;
          }
        );
      }
    );
  }
}
