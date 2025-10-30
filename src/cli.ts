#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { buildGraph } from "./core/crawler.js";
import { renderTree } from "./render/tree.js";
import { findDefaultEntry, listCandidateEntries } from "./utils/findEntry.js";

const program = new Command();

program
  .name("imptree")
  .description("Builds a hierarchy of React/TS component imports")
  .version("1.0.0");

// Make entry file optional:
program
  .argument("[entryFile]", "Path to the entry component file (optional)")
  .option(
    "-e, --extensions <exts>",
    "File extensions to include",
    "js,jsx,ts,tsx"
  )
  // Expose dirs/names so users can override if they want (defaults match your spec):
  .option(
    "--dirs <dirs>",
    "Comma-separated directories to search when entryFile is omitted",
    ".,src,core"
  )
  .option(
    "--names <names>",
    "Comma-separated base names to search when entryFile is omitted",
    "default,index,main,entry"
  )
  .option("--verbose", "Enable verbose logging")
  .action(
    (
      entryFile: string | undefined,
      options: {
        extensions: string;
        dirs: string;
        names: string;
        verbose?: boolean;
      }
    ) => {
      const extensions = options.extensions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const dirs = options.dirs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const names = options.names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let rootPath: string | null = null;

      if (entryFile) {
        const p = path.resolve(entryFile);
        if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
          console.error("Entry file does not exist or is not a file.");
          process.exit(1);
        }
        rootPath = p;
      } else {
        // No entry provided: auto-detect based on (dirs)/(names).(extensions)
        rootPath = findDefaultEntry({
          cwd: process.cwd(),
          dirs,
          names,
          extensions,
        });

        if (!rootPath) {
          if (options.verbose) {
            const candidates = listCandidateEntries({
              cwd: process.cwd(),
              dirs,
              names,
              extensions,
            });
            const rel = (x: string) => path.relative(process.cwd(), x) || ".";
            console.error(
              "No entry file provided and no default entry found. Tried:"
            );
            for (const c of candidates) console.error(`  - ${rel(c)}`);
          } else {
            console.error(
              "No entry provided and no default entry found. Re-run with --verbose to see candidates."
            );
          }
          process.exit(1);
        }

        if (options.verbose) {
          console.log(
            `Using default entry: ${
              path.relative(process.cwd(), rootPath) || "."
            }`
          );
        }
      }

      // Build + render
      const graph = buildGraph(rootPath, {
        extensions,
        verbose: options.verbose,
        logger: console,
      });

      const rootRel = path.relative(process.cwd(), rootPath);
      const out = renderTree(graph, rootRel);
      console.log(out);
    }
  );

program.parse(process.argv);
