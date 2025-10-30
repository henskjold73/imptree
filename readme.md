# imptree

imptree is a CLI tool that builds a visual hierarchy of import usage in JavaScript/TypeScript projects. It supports output formats like tree view, JSON, and Mermaid diagrams, with options to preview locally or open in Mermaid Live.

## Installation

To install globally:

npm install -g imptree

Or use directly via npx:

npx imptree path/to/entry.tsx

## Usage

imptree <entryFile> [options]

Arguments:
<entryFile> Path to the entry component or file (e.g. src/App.tsx)

Options:
-e, --extensions <exts> File extensions to include (default: js,jsx,ts,tsx)
-f, --format <fmt> Output format: tree, json, or mermaid (default: tree)
--compact Compact JSON output
--show Open a local Mermaid viewer
--live Open diagram in Mermaid Live Editor
--edit Use editor mode with --live
--max-text-size <n> Limit for Mermaid maxTextSize
--max-edges <n> Limit for Mermaid maxEdges
--direction <dir> Mermaid direction: LR, TB, BT, RL (default: LR)
--theme <theme> Mermaid theme: default, dark (default: default)
--verbose Enable verbose logging

## Output Formats

- Tree: ASCII-style hierarchy of imports
- JSON: Structured import graph
- Mermaid: Diagram syntax for rendering graphs

## Examples

# Tree view of imports

imptree src/App.tsx

# JSON output

imptree src/App.tsx --format json --compact

# Mermaid diagram in local viewer

imptree src/App.tsx --format mermaid --show

# Mermaid diagram in live editor

imptree src/App.tsx --live --edit

## Development

npm ci
npm run build
npm link
imptree --help

## License

ISC

## Contributing

Feel free to open issues or PRs for improvements, bug fixes, or feature suggestions.
