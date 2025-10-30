import type { Graph } from "../core/types";

/**
 * Serializes the graph to JSON.
 * Shape:
 * {
 *   "root": "<relative path to entry>",
 *   "nodes": ["fileA.tsx", "fileB.ts", ...],
 *   "edges": [{ "from": "A", "to": "B" }, ...],
 *   "adjacency": { "A": ["B","C"], "B": [], ... }
 * }
 */
export function renderJSON(
  graph: Graph,
  rootRelPath: string,
  compact = false
): string {
  const nodes = Array.from(graph.keys());
  const edges = Array.from(graph.entries()).flatMap(([from, tos]) =>
    tos.map((to) => ({ from, to }))
  );
  const adjacency = Object.fromEntries(graph); // Map<string, string[]> -> Record<string, string[]>

  const normalize = (p: string) => p.replace(/\\/g, "/");

  const payload = {
    root: normalize(rootRelPath),
    nodes: nodes.map(normalize),
    edges: edges.map(({ from, to }) => ({
      from: normalize(from),
      to: normalize(to),
    })),
    adjacency: Object.fromEntries(
      Array.from(graph.entries()).map(([k, v]) => [
        normalize(k),
        v.map(normalize),
      ])
    ),
  };
  return JSON.stringify(payload, null, compact ? 0 : 2);
}
