import { useOS } from "@/store/os";
import { Window } from "./Window";
import { Terminal } from "lucide-react";

type TmuxGroup = {
  category: string;
  binds: { keys: string[]; action: string }[];
};

const tmuxGroups: TmuxGroup[] = [
  {
    category: "Prefix",
    binds: [
      { keys: ["Ctrl+Space"], action: "Prefix key (also Ctrl+B)" },
      { keys: ["Super+Alt+Return"], action: "New tmux session" },
    ],
  },
  {
    category: "Panes",
    binds: [
      { keys: ["Prefix", "v"], action: "Split pane beside (vertical)" },
      { keys: ["Prefix", "h"], action: "Split pane below (horizontal)" },
      { keys: ["Prefix", "x"], action: "Kill pane" },
      { keys: ["Prefix", "z"], action: "Toggle pane zoom (fullscreen)" },
      { keys: ["Ctrl+Alt", "Arrows"], action: "Move between panes" },
      { keys: ["Ctrl+Alt+Shift", "Arrows"], action: "Resize panes" },
    ],
  },
  {
    category: "Windows",
    binds: [
      { keys: ["Prefix", "c"], action: "New window" },
      { keys: ["Prefix", "k"], action: "Kill window" },
      { keys: ["Prefix", "r"], action: "Rename window" },
      { keys: ["Alt", "1-9"], action: "Go to specific window" },
      { keys: ["Alt", "Left/Right"], action: "Move between windows" },
    ],
  },
  {
    category: "Sessions",
    binds: [
      { keys: ["Prefix", "C"], action: "New session" },
      { keys: ["Prefix", "K"], action: "Kill session" },
      { keys: ["Prefix", "R"], action: "Rename session" },
      { keys: ["Prefix", "N"], action: "Next session" },
      { keys: ["Prefix", "P"], action: "Previous session" },
      { keys: ["Alt", "Up/Down"], action: "Move between sessions" },
      { keys: ["Prefix", "s"], action: "List sessions" },
      { keys: ["Prefix", "d"], action: "Detach from session" },
    ],
  },
  {
    category: "Copy Mode (vi-style)",
    binds: [
      { keys: ["Prefix", "["], action: "Enter copy mode" },
      { keys: ["v"], action: "Begin selection (in copy mode)" },
      { keys: ["y"], action: "Copy selection (in copy mode)" },
    ],
  },
  {
    category: "Layout Functions",
    binds: [
      { keys: ["tdl", "[agent]"], action: "IDE layout: editor + AI + terminal" },
      { keys: ["tdlm", "[agent]"], action: "Per-subdirectory layout" },
      { keys: ["tsl", "[count] [cmd]"], action: "Swarm of agent panes" },
    ],
  },
];

export function TmuxCheatsheet() {
  const config = useOS((s) => s.config);

  return (
    <Window appId="tmux-cheatsheet" title="tmux-cheatsheet" accent="var(--neon-green)">
      <div className="h-full flex flex-col bg-[oklch(0.14_0.02_270)]">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg text-neon-green text-glow-green font-bold flex items-center gap-2">
            <Terminal className="h-5 w-5" /> Tmux Cheatsheet
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Prefix:{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-secondary border border-border">
              Ctrl+Space
            </kbd>{" "}
            or{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-secondary border border-border">
              Ctrl+B
            </kbd>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {tmuxGroups.map((g) => (
            <div key={g.category}>
              <h3 className="text-xs uppercase tracking-wider text-neon-green/70 mb-3 font-semibold border-b border-border/50 pb-1">
                {g.category}
              </h3>
              <div className="space-y-1.5">
                {g.binds.map((b, i) => {
                  const keys = Array.isArray(b.keys) ? b.keys : [b.keys];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border/40 bg-card/30"
                    >
                      <div className="flex gap-1 min-w-[140px] flex-wrap">
                        {keys.map((k, j) => (
                          <span key={j} className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-secondary border border-border">
                              {k}
                            </kbd>
                            {j < keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-foreground">{b.action}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}
