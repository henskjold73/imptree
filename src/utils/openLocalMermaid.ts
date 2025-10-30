import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import open from "open";
import { mermaidHtmlPage } from "../render/mermaidPage";

export async function openLocalMermaid(
  mermaidCode: string,
  opts?: { theme?: "default" | "dark"; maxTextSize?: number; maxEdges?: number }
) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "imptree-"));
  const file = path.join(dir, "diagram.html");

  fs.writeFileSync(
    file,
    mermaidHtmlPage(mermaidCode, opts?.theme ?? "default", {
      maxTextSize: opts?.maxTextSize,
      maxEdges: opts?.maxEdges,
    }),
    "utf8"
  );
  await open(file);
  return file;
}
