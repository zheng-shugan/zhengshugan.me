import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const parser = unified().use(remarkParse).use(remarkGfm);

interface TextNode {
  type: string;
  value?: string;
  children?: TextNode[];
}

function plainText(node: TextNode): string {
  if (node.type === "text" || node.type === "inlineCode") return node.value ?? "";
  if (node.type === "break") return " ";
  if (
    ["paragraph", "link", "linkReference", "emphasis", "strong", "delete"].includes(
      node.type
    )
  ) {
    return (node.children ?? []).map(plainText).join("");
  }
  return "";
}

/** Extract ordinary prose only; headings, TOC lists and other blocks are excluded. */
export function getPostExcerpt(markdown: string): string {
  const text = parser
    .parse(markdown)
    .children.filter((node) => node.type === "paragraph")
    .map(plainText)
    .filter((paragraph) => !/^\s*\[\[?toc\]?\]\s*$/i.test(paragraph))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const characters = Array.from(text);
  return characters.length > 200 ? characters.slice(0, 200).join("") + "…" : text;
}
