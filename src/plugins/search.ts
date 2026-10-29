import type { Root } from "mdast";

// Run after remark-toc so its generated list is excluded along with the heading.
export function ignoreSearchToc() {
  return (tree: Root) => {
    tree.children.forEach((node, index) => {
      if (node.type !== "heading") return;
      const title = node.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join("")
        .trim()
        .toLowerCase();
      if (title !== "toc" && title !== "table of contents") return;
      node.data = {
        ...node.data,
        hProperties: { "data-pagefind-ignore": "all" }
      };
      const list = tree.children[index + 1];
      if (list?.type === "list") {
        list.data = {
          ...list.data,
          hProperties: { "data-pagefind-ignore": "all" }
        };
      }
    });
  };
}
