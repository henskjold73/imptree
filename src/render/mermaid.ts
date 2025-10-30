import path from "node:path";
import type { Graph } from "../core/types";

export interface MermaidRenderOptions {
  direction?: "LR" | "TB" | "BT" | "RL";
  compactIds?: boolean; // short IDs (n1,n2,...) to minimize code size
  showRootComment?: boolean;
}

export function renderMermaid(
  graph: Graph,
  rootRelPath: string,
  opts: MermaidRenderOptions = {}
): string {
  const dir = opts.direction ?? "LR";
  const norm = (p: string) => p.replace(/\\/g, "/");

  const nodes = Array.from(graph.keys()).map(norm);
  const edges: Array<{ from: string; to: string }> = [];
  for (const [from, tos] of graph.entries()) {
    for (const to of tos) edges.push({ from: norm(from), to: norm(to) });
  }

  // Optional compaction to keep code short (useful for Mermaid Live URLs)
  const idOf = (() => {
    if (!opts.compactIds) {
      return (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "_");
    }
    const map = new Map<string, string>();
    let i = 1;
    return (s: string) => {
      let id = map.get(s);
      if (!id) {
        id = `n${i++}`;
        map.set(s, id);
      }
      return id;
    };
  })();

  const lines: string[] = [];
  lines.push(`flowchart ${dir}`);
  if (opts.showRootComment !== false)
    lines.push(`%% Root: ${norm(rootRelPath)}`);

  // Declare nodes with short IDs but readable labels (basename)
  for (const n of nodes) {
    const label = path.basename(n);
    lines.push(`  ${idOf(n)}["${escapeLabel(label)}"]`);
  }
  // Edges
  for (const { from, to } of edges) {
    lines.push(`  ${idOf(from)} --> ${idOf(to)}`);
  }

  return lines.join("\n");
}

function escapeLabel(s: string): string {
  return s.replace(/"/g, '\\"');
}
