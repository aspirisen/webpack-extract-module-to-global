# webpack-extract-module-to-global

A plugin for webpack to extract some modules to global space

## How to use

1. Import `import { ExtractModuleToGlobal } from "webpack-extract-module-to-global";`
2. Add to plugins inside webpack config `plugins: [new ExtractModuleToGlobal()]`
3. Add loader with condition which modules should be extracted

```
{
    include: /a.ts/,
    loader: ExtractModuleToGlobal.loader,
}
```

> Important notice: The files that are being extracted must not include imports or exports, because there is no `webpack require` in global space
