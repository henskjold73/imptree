import fs from "node:fs";
import path from "node:path";

export interface FindEntryOptions {
  cwd?: string;
  dirs?: string[];
  names?: string[];
  extensions?: string[];
}

const DEFAULT_DIRS = [".", "src", "core"];
const DEFAULT_NAMES = ["default", "index", "main", "entry"];
const DEFAULT_EXTS = ["js", "jsx", "ts", "tsx"];

export function findDefaultEntry(opts: FindEntryOptions = {}): string | null {
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  const dirs = opts.dirs ?? DEFAULT_DIRS;
  const names = opts.names ?? DEFAULT_NAMES;
  const exts = opts.extensions ?? DEFAULT_EXTS;

  for (const d of dirs) {
    const baseDir = d === "." ? cwd : path.resolve(cwd, d);
    for (const name of names) {
      for (const ext of exts) {
        const candidate = path.join(baseDir, `${name}.${ext}`);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate; // first match wins by order
        }
      }
    }
  }
  return null;
}

export function listCandidateEntries(opts: FindEntryOptions = {}): string[] {
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  const dirs = opts.dirs ?? DEFAULT_DIRS;
  const names = opts.names ?? DEFAULT_NAMES;
  const exts = opts.extensions ?? DEFAULT_EXTS;

  const out: string[] = [];
  for (const d of dirs) {
    const baseDir = d === "." ? cwd : path.resolve(cwd, d);
    for (const name of names) {
      for (const ext of exts) {
        out.push(path.join(baseDir, `${name}.${ext}`));
      }
    }
  }
  return out;
}
