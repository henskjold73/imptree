import { deflate } from "pako";

export function buildMermaidLiveURL(
  code: string,
  opts?: { mode?: "view" | "edit"; theme?: "default" | "dark" }
): string {
  // Minimal JSON to reduce size
  const payload = {
    code,
    mermaid: opts?.theme ? { theme: opts.theme } : undefined,
  };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const deflated = deflate(json, { level: 9 });
  const b64url = Buffer.from(deflated)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  const mode = opts?.mode ?? "view";
  return `https://mermaid.live/${mode}#pako:${b64url}`;
}
