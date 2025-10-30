import path from "node:path";
import type { Graph } from "../core/types";

export function renderTree(graph: Graph, rootRelPath: string): string {
  const printed = new Set<string>();
  const nameMap = new Map<string, string | null>();
  const lines: string[] = ["", "📁 Component Hierarchy:", ""];

  function printNode(file: string, depth = 0) {
    const fileName = path.basename(file);
    const parentFolder = path.basename(path.dirname(file));

    if (!nameMap.has(fileName)) nameMap.set(fileName, file);
    else if (nameMap.get(fileName) !== file) nameMap.set(fileName, null);

    const duplicate = nameMap.get(fileName) === null;
    const display = duplicate ? `${fileName} (${parentFolder})` : fileName;

    lines.push(`${"  ".repeat(depth)}- ${display}`);

    if (printed.has(file)) {
      lines.push(`${"  ".repeat(depth + 1)}`); // marker for repeated node
      return;
    }
    printed.add(file);

    const children = graph.get(file) ?? [];
    for (const child of children) printNode(child, depth + 1);
  }

  printNode(rootRelPath, 0);
  return lines.join("\n");
}
