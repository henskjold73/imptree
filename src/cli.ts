#!/usr/bin/env node
import { program } from "commander";
import fs from "node:fs";
import path from "node:path";

import { buildGraph } from "./core/crawler";
import { renderTree } from "./render/tree";
import { renderJSON } from "./render/json";
import { renderMermaid } from "./render/mermaid";
import { openLocalMermaid } from "./utils/openLocalMermaid";
import { buildMermaidLiveURL } from "./utils/mermaidLink";
import open from "open";

program
  .name("imptree")
  .description("Builds a hierarchy of component/import usage")
  .version("0.1.0");

program
  .argument("<entryFile>", "Path to the entry component/file")
  .option(
    "-e, --extensions <exts>",
    "File extensions to include",
    "js,jsx,ts,tsx"
  )
  .option("-f, --format <fmt>", "Output format: tree|json|mermaid", "tree")
  .option("--compact", "Compact JSON output")
  .option("--show", "Open a local Mermaid viewer (recommended)")
  .option("--max-text-size <n>", "Mermaid maxTextSize limit", (v) =>
    parseInt(v, 10)
  )
  .option("--max-edges <n>", "Mermaid maxEdges limit", (v) => parseInt(v, 10))
  .option("--live", "Open in Mermaid Live instead of local viewer")
  .option("--edit", "Use editor mode with --live")
  .option("--direction <dir>", "Mermaid direction: LR|TB|BT|RL", "LR")
  .option("--theme <theme>", "Mermaid theme: default|dark", "default")
  .option("--verbose", "Enable verbose logging")
  .action(async (entryFile, options) => {
    const rootPath = path.resolve(entryFile);
    if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isFile()) {
      console.error("Entry file does not exist or is not a file.");
      process.exit(1);
    }

    const extensions = options.extensions
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean);
    const graph = buildGraph(rootPath, {
      extensions,
      verbose: options.verbose,
      logger: console,
    });
    const rootRel = path.relative(process.cwd(), rootPath);

    const fmt = options.show || options.live ? "mermaid" : options.format;

    if (fmt === "json") {
      const json = renderJSON(graph, rootRel, !!options.compact);
      console.log(json);
      return;
    }

    if (fmt === "mermaid") {
      const compactIds = !!options.live; // shorten for Live URLs
      const code = renderMermaid(graph, rootRel, {
        direction: options.direction,
        compactIds,
      });

      if (options.show && !options.live) {
        await openLocalMermaid(code, {
          theme: options.theme,
          maxTextSize: options.maxTextSize,
          maxEdges: options.maxEdges,
        });
        return;
      }

      if (options.live) {
        const url = buildMermaidLiveURL(code, {
          mode: options.edit ? "edit" : "view",
          theme: options.theme,
        });
        if (options.verbose) console.log("Opening:", url);
        await open(url);
        return;
      }

      console.log(code);
      return;
    }

    console.log(renderTree(graph, rootRel));
  });

// Use parseAsync because the action is async
program.parseAsync(process.argv);
