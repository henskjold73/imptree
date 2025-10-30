import fs from "node:fs";
import path from "node:path";

const JS_LIKE_EXTS = new Set([".js", ".mjs", ".cjs", ".jsx"]);

/**
 * Resolve a local import specifier relative to a file.
 * Supports:
 *  - exact file hits
 *  - swapping .js/.mjs/.cjs/.jsx -> provided extensions (ts,tsx,jsx,js,...)
 *  - extensionless imports: <base>.<ext>
 *  - directory imports: <base>/index.<ext>
 */
export function resolveLocalImport(
  fromFile: string,
  spec: string,
  extensions: string[]
): string | null {
  if (!(spec.startsWith(".") || spec.startsWith("/"))) return null;

  const fromDir = path.dirname(fromFile);
  const abs = path.resolve(fromDir, spec);

  const candidates: string[] = [];

  // If the path as given exists and is a file, accept it immediately
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    return abs;
  }

  const parsed = path.parse(abs);
  const hasExt = parsed.ext !== "";

  if (hasExt) {
    // 1) Try as-is (in case fs.existsSync missed due to race/permissions)
    candidates.push(abs);

    // 2) If it's a JS-like extension in TS source, try swapping to provided extensions
    if (JS_LIKE_EXTS.has(parsed.ext)) {
      for (const ext of extensions) {
        candidates.push(
          path.format({ ...parsed, base: undefined, ext: `.${ext}` })
        );
      }
    }
  } else {
    // No extension: try <base>.<ext>
    for (const ext of extensions) {
      candidates.push(`${abs}.${ext}`);
    }
  }

  // Also try directory index resolution:
  const dirBase = hasExt ? path.join(parsed.dir, parsed.name) : abs;

  for (const ext of extensions) {
    candidates.push(path.join(dirBase, `index.${ext}`));
  }

  // Optional: support default.* if you like that convention
  // for (const ext of extensions) {
  //   candidates.push(path.join(dirBase, `default.${ext}`));
  // }

  const hit = candidates.find(
    (p) => fs.existsSync(p) && fs.statSync(p).isFile()
  );
  return hit ?? null;
}
