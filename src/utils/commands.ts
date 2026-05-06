import { useOS } from "@/store/os";
import { getNode, resolvePath } from "@/data/filesystem";

type Ctx = {
  push: (text: string, type?: "in" | "out" | "sys") => void;
};

export function runCommand(raw: string, ctx: Ctx) {
  const trimmed = raw.trim();
  const state = useOS.getState();
  ctx.push(`${state.cwd} ❯ ${raw}`, "in");
  if (!trimmed) return;
  state.pushCmd(trimmed);
  const [cmd, ...args] = trimmed.split(/\s+/);
  const out = (t: string) => ctx.push(t, "out");
  const sys = (t: string) => ctx.push(t, "sys");

  switch (cmd) {
    case "help":
      out("Commands: help, ls, cd <dir>, pwd, cat <file>, clear, neofetch, theme <name>,");
      out("          echo <text>, whoami, date, ff, launcher, open <app>, exit");
      out("  Tmux: tmux [name], tdl [agent], tdlm [agent], tsl [count] [command]");
      break;
    case "ls":
    case "ff": {
      const node = getNode(state.cwd);
      if (!node || node.type !== "dir") {
        out("not a directory");
        break;
      }
      const items = Object.entries(node.children ?? {});
      if (!items.length) {
        out("(empty)");
        break;
      }
      out(items.map(([k, v]) => (v.type === "dir" ? `📁 ${k}/` : `📄 ${k}`)).join("   "));
      break;
    }
    case "cd": {
      const target = args[0] ?? "~";
      const next = resolvePath(state.cwd, target);
      const node = getNode(next);
      if (!node) {
        out(`cd: no such directory: ${target}`);
        break;
      }
      if (node.type !== "dir") {
        out(`cd: not a directory: ${target}`);
        break;
      }
      state.setCwd(next);
      break;
    }
    case "pwd":
      out(state.cwd);
      break;
    case "cat": {
      if (!args[0]) {
        out("usage: cat <file>");
        break;
      }
      const path = resolvePath(state.cwd, args[0]);
      const node = getNode(path);
      if (!node) {
        out(`cat: ${args[0]}: no such file`);
        break;
      }
      if (node.type !== "file") {
        out(`cat: ${args[0]}: is a directory`);
        break;
      }
      out(node.content ?? "");
      break;
    }
    case "clear":
      state.clearTerm();
      break;
    case "echo":
      out(args.join(" "));
      break;
    case "whoami":
      out("developer");
      break;
    case "date":
      out(new Date().toString());
      break;
    case "neofetch":
      sys("");
      sys(" ▄█████▄    ▄███████████▄    ▄███████   ▄███████   ▄███████   ▄█   █▄    ▄█   █▄");
      sys("███   ███  ███   ███   ███  ███   ███  ███   ███  ███   ███  ███   ███  ███   ███");
      sys("███   ███  ███   ███   ███  ███   ███  ███   ███  ███   █▀   ███   ███  ███   ███");
      sys("███   ███  ███   ███   ███ ▄███▄▄▄███ ▄███▄▄▄██▀  ███       ▄███▄▄▄███▄ ███▄▄▄███");
      sys("███   ███  ███   ███   ███ ▀███▀▀▀███ ▀███▀▀▀▀    ███      ▀▀███▀▀▀███  ▀▀▀▀▀▀███");
      sys("███   ███  ███   ███   ███  ███   ███ ██████████  ███   █▄   ███   ███  ▄██   ███");
      sys("███   ███  ███   ███   ███  ███   ███  ███   ███  ███   ███  ███   ███  ███   ███");
      sys(" ▀█████▀    ▀█   ███   █▀   ███   █▀   ███   ███  ███████▀   ███   █▀    ▀█████▀");
      sys("                                      ███   █▀");
      sys("");
      sys("       OS: Omarchy 1.0 (browser)");
      sys("     Host: lovable.dev");
      sys("   Kernel: react 19 + tanstack");
      sys("       WM: hyprland-sim");
      sys("    Shell: jsh 1.0");
      sys("    Theme: tokyo-night");
      sys("      CPU: V8 (4) @ 3.0GHz");
      break;
    case "theme": {
      const t = args[0] as "green" | "purple" | "blue" | "pink";
      if (!["green", "purple", "blue", "pink"].includes(t)) {
        out("usage: theme green|purple|blue|pink");
        break;
      }
      state.setConfig({ accent: t });
      sys(`accent → ${t}`);
      break;
    }
    case "launcher":
      state.toggleLauncher();
      break;
    case "open": {
      const a = args[0] as any;
      if (!["terminal", "keybindings", "config", "install", "tmux-cheatsheet"].includes(a)) {
        out("usage: open terminal|keybindings|config|install|tmux-cheatsheet");
        break;
      }
      state.openApp(a);
      break;
    }
    case "exit":
      sys("nice try. you're trapped in the matrix.");
      break;
    case "tmux": {
      if (state.tmux.active) {
        out("already in tmux. prefix + s to list sessions.");
      } else {
        const s = args[0] || "0";
        state.tmuxNewSession(s);
        state.setTerminal("alacritty");
        sys(`[tmux] started session '${s}'`);
        sys(`[tmux] prefix: Ctrl+Space or Ctrl+B`);
      }
      break;
    }
    case "tdl": {
      if (!state.tmux.active) {
        out("not in tmux. run 'tmux' first.");
        break;
      }
      const agents = args.filter((a) => a);
      const agentStr = agents.length > 0 ? agents.join(" + ") : "none";
      state.tmuxSplitPane("v");
      state.tmuxSplitPane("h");
      state.tmuxRenameWindow("tdl");
      sys("[tmux-tdl] layout: editor | AI terminal | shell");
      sys(`[tmux-tdl] agent: ${agentStr}`);
      break;
    }
    case "tdlm": {
      if (!state.tmux.active) {
        out("not in tmux. run 'tmux' first.");
        break;
      }
      const agent = args[0] || "none";
      state.tmuxRenameWindow("tdlm");
      sys(`[tmux-tdlm] per-subdir layout with agent: ${agent}`);
      sys("[tmux-tdlm] use alt+1/2/3/5/6 to navigate");
      break;
    }
    case "tsl": {
      if (!state.tmux.active) {
        out("not in tmux. run 'tmux' first.");
        break;
      }
      const count = parseInt(args[0], 10) || 4;
      const command = args[1] || "agent";
      for (let i = 0; i < count - 1; i++) state.tmuxSplitPane(i % 2 === 0 ? "v" : "h");
      state.tmuxRenameWindow("tsl");
      sys(`[tmux-tsl] ${count}-way swarm: ${command}`);
      break;
    }
    default:
      out(`command not found: ${cmd}. try 'help'`);
  }
}
