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
      break;
    case "ls":
    case "ff": {
      const node = getNode(state.cwd);
      if (!node || node.type !== "dir") { out("not a directory"); break; }
      const items = Object.entries(node.children ?? {});
      if (!items.length) { out("(empty)"); break; }
      out(items.map(([k, v]) => (v.type === "dir" ? `📁 ${k}/` : `📄 ${k}`)).join("   "));
      break;
    }
    case "cd": {
      const target = args[0] ?? "~";
      const next = resolvePath(state.cwd, target);
      const node = getNode(next);
      if (!node) { out(`cd: no such directory: ${target}`); break; }
      if (node.type !== "dir") { out(`cd: not a directory: ${target}`); break; }
      state.setCwd(next);
      break;
    }
    case "pwd": out(state.cwd); break;
    case "cat": {
      if (!args[0]) { out("usage: cat <file>"); break; }
      const path = resolvePath(state.cwd, args[0]);
      const node = getNode(path);
      if (!node) { out(`cat: ${args[0]}: no such file`); break; }
      if (node.type !== "file") { out(`cat: ${args[0]}: is a directory`); break; }
      out(node.content ?? "");
      break;
    }
    case "clear": state.clearTerm(); break;
    case "echo": out(args.join(" ")); break;
    case "whoami": out("developer"); break;
    case "date": out(new Date().toString()); break;
    case "neofetch":
      sys("       .--.       OS: MyOmarchy 1.0 (browser)");
      sys("      |o_o |      Host: lovable.dev");
      sys("      |:_/ |      Kernel: react 19 + tanstack");
      sys("     //   \\ \\     WM: hyprland-sim");
      sys("    (|     | )    Shell: jsh 1.0");
      sys("   /'\\_   _/`\\    Theme: tokyo-night");
      sys("   \\___)=(___/    CPU: V8 (4) @ 3.0GHz");
      break;
    case "theme": {
      const t = args[0] as "green" | "purple" | "blue" | "pink";
      if (!["green","purple","blue","pink"].includes(t)) { out("usage: theme green|purple|blue|pink"); break; }
      state.setConfig({ accent: t });
      sys(`accent → ${t}`);
      break;
    }
    case "launcher": state.toggleLauncher(); break;
    case "open": {
      const a = args[0] as any;
      if (!["terminal","keybindings","config","install"].includes(a)) { out("usage: open terminal|keybindings|config|install"); break; }
      state.openApp(a);
      break;
    }
    case "exit": sys("nice try. you're trapped in the matrix."); break;
    default:
      out(`command not found: ${cmd}. try 'help'`);
  }
}
