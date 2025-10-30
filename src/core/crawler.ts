import fs from "node:fs";
import path from "node:path";
import { parseImports } from "./parser";
import { resolveLocalImport } from "./resolver";
import type { BuildOptions, Graph } from "./types";

export function buildGraph(entryFile: string, options: BuildOptions): Graph {
  const cwd = options.cwd ?? process.cwd();
  const rootAbs = path.resolve(entryFile);

  const visited = new Set<string>();
  const graph: Graph = new Map();

  function scan(absFile: string) {
    if (visited.has(absFile)) return;
    visited.add(absFile);

    let code = "";
    try {
      code = fs.readFileSync(absFile, "utf-8");
    } catch (e) {
      if (options.verbose)
        options.logger?.warn?.(
          `Failed to read ${absFile}: ${(e as Error).message}`
        );
      return;
    }

    let specs: string[] = [];
    try {
      specs = parseImports(code);
    } catch (e) {
      if (options.verbose)
        options.logger?.warn?.(
          `Failed to parse ${absFile}: ${(e as Error).message}`
        );
    }

    const children: string[] = [];
    for (const spec of specs) {
      const resolved = resolveLocalImport(absFile, spec, options.extensions);
      if (resolved) {
        const rel = path.relative(cwd, resolved);
        children.push(rel);
        scan(resolved);
      }
    }

    graph.set(path.relative(cwd, absFile), children);
  }

  scan(rootAbs);
  return graph;
}
