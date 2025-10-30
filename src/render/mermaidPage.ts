export function mermaidHtmlPage(
  mermaidCode: string,
  theme: "default" | "dark" = "default",
  opts?: { maxTextSize?: number; maxEdges?: number }
) {
  const maxTextSize = opts?.maxTextSize ?? 1_000_000; // bump limits here
  const maxEdges = opts?.maxEdges ?? 50_000;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>imptree</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>html,body{height:100%;margin:0}body{padding:16px;box-sizing:border-box}</style>
</head>
<body>
  <pre class="mermaid">
${escapeHtml(mermaidCode)}
  </pre>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: '${theme}',
      maxTextSize: ${maxTextSize},
      maxEdges: ${maxEdges}
    });
  </script>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
