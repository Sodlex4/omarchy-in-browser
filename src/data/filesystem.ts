export type FsNode = { type: "dir" | "file"; children?: Record<string, FsNode>; content?: string };

export const fs: FsNode = {
  type: "dir",
  children: {
    "~": {
      type: "dir",
      children: {
        projects: {
          type: "dir",
          children: {
            "myomarchy": { type: "dir", children: {
              "README.md": { type: "file", content: "# MyOmarchy\nA browser-based Omarchy simulation." },
              "src": { type: "dir", children: {} },
            }},
            "dotfiles": { type: "dir", children: {
              "hyprland.conf": { type: "file", content: "monitor=,preferred,auto,1\nbind=SUPER,Return,exec,alacritty" },
            }},
          },
        },
        "config": {
          type: "dir",
          children: {
            "omarchy.toml": { type: "file", content: "theme = \"tokyo-night\"\nfont = \"JetBrains Mono\"" },
          },
        },
        "notes.txt": { type: "file", content: "Try: help, ls, cd projects, cat README.md, neofetch, theme" },
      },
    },
  },
};

export function resolvePath(cwd: string, target: string): string {
  if (!target || target === ".") return cwd;
  if (target === "~" || target === "/") return "~";
  if (target.startsWith("/")) return target;
  if (target === "..") {
    if (cwd === "~") return "~";
    const parts = cwd.split("/");
    parts.pop();
    return parts.join("/") || "~";
  }
  return cwd === "~" ? `~/${target}` : `${cwd}/${target}`;
}

export function getNode(path: string): FsNode | null {
  const parts = path.split("/").filter(Boolean);
  let node: FsNode | undefined = fs.children?.["~"];
  if (parts[0] !== "~") return null;
  for (let i = 1; i < parts.length; i++) {
    if (!node?.children) return null;
    node = node.children[parts[i]];
    if (!node) return null;
  }
  return node ?? null;
}
