import * as crypto from "crypto";
import type { Compiler } from "webpack";
import { ExtractModuleToGlobal } from "./ExtractModuleToGlobal";

export function ExtractModuleToGlobalLoader(
  this: {
    _compiler: Compiler;
    resource: string;
    getLogger: () => { error: (message: string) => void };
  },
  content: string,
  map: any
) {
  const logger = this.getLogger();

  const extractModuleToGlobal = this._compiler.options.plugins.find(
    (p) => p instanceof ExtractModuleToGlobal
  ) as ExtractModuleToGlobal;

  if (extractModuleToGlobal) {
    extractModuleToGlobal.addSource(this.resource, content, map);
  } else {
    logger.error(`ExtractModuleToGlobal plugin has not been found`);
  }

  const hash = crypto.createHash("md5").update(content).digest("hex");

  return `/** Extracted to global space ${hash} **/`;
}

export default ExtractModuleToGlobalLoader;
