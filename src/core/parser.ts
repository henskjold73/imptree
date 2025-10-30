import { parse, type ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";

const defaultParserOptions: ParserOptions = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
};

export function parseImports(
  code: string,
  parserOptions: ParserOptions = defaultParserOptions
): string[] {
  const ast = parse(code, parserOptions);
  const imports: string[] = [];

  traverse(ast, {
    ImportDeclaration({ node }) {
      imports.push(node.source.value);
    },
    ExportAllDeclaration({ node }) {
      if (node.source) imports.push(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      if (node.source) imports.push(node.source.value);
    },
  });

  return imports;
}
