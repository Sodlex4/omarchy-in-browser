import { useState } from "react";
import { useOS } from "@/store/os";
import { Window } from "./Window";
import { Search } from "lucide-react";

type HotkeyGroup = {
  category: string;
  binds: { keys: string[]; action: string; desc: string }[];
};

const allHotkeys: HotkeyGroup[] = [
  {
    category: "Navigating",
    binds: [
      { keys: ["Super", "W"], action: "Close window", desc: "Kill focused window" },
      { keys: ["Super", "F"], action: "Toggle fullscreen", desc: "Go full screen" },
      { keys: ["Super", "Alt", "F"], action: "Full width", desc: "Window fills width" },
      {
        keys: ["Super", "Ctrl", "F"],
        action: "Inner fullscreen",
        desc: "Full screen inside window",
      },
      { keys: ["Super", "T"], action: "Toggle tiling", desc: "Tiling ↔ Floating" },
      { keys: ["Super", "J"], action: "Toggle split", desc: "Horizontal ↔ Vertical" },
      { keys: ["Super", "O"], action: "Sticky float", desc: "Pop window sticky/floating" },
      { keys: ["Super", "L"], action: "Toggle layout", desc: "Dwindle ↔ Master" },
      { keys: ["Super", "G"], action: "Toggle grouping", desc: "Window grouping" },
      { keys: ["Super", "Shift", "Backspace"], action: "Toggle gaps", desc: "Window gaps on/off" },
      { keys: ["Super", "Shift", "Space"], action: "Toggle topbar", desc: "Show/hide top bar" },
      { keys: ["Super", "S"], action: "Scratchpad", desc: "Show scratchpad overlay" },
    ],
  },
  {
    category: "Workspaces",
    binds: [
      {
        keys: ["Super", "1/2/3/4"],
        action: "Switch workspace",
        desc: "Jump to specific workspace",
      },
      { keys: ["Super", "Tab"], action: "Next workspace", desc: "Jump to next workspace" },
      {
        keys: ["Super", "Shift", "Tab"],
        action: "Previous workspace",
        desc: "Jump to previous workspace",
      },
      {
        keys: ["Super", "Shift", "1/2/3/4"],
        action: "Move window",
        desc: "Move window to workspace",
      },
      {
        keys: ["Super", "Shift", "Alt", "1/2/3/4"],
        action: "Move without following",
        desc: "Move window without switching",
      },
      { keys: ["Super", "Scroll"], action: "Scroll workspaces", desc: "Scroll through workspaces" },
      { keys: ["Super", "Left/Right Mouse"], action: "Drag/Resize", desc: "Drag or resize window" },
    ],
  },
  {
    category: "Launching Apps",
    binds: [
      { keys: ["Super", "Enter"], action: "Terminal", desc: "Open jsh shell" },
      { keys: ["Super", "Space"], action: "Launcher", desc: "Application launcher" },
      { keys: ["Super", "D"], action: "Launcher (alt)", desc: "Application launcher" },
      { keys: ["Super", "Shift", "Enter"], action: "Browser", desc: "Open web browser" },
      { keys: ["Super", "Shift", "F"], action: "File manager", desc: "Open file browser" },
      { keys: ["Super", "Shift", "N"], action: "Neovim", desc: "Open code editor" },
      { keys: ["Super", "Shift", "M"], action: "Music", desc: "Open Spotify" },
      { keys: ["Super", "K"], action: "Keybindings", desc: "This panel" },
      { keys: ["Super", "C"], action: "Config Lab", desc: "Customize theme" },
      { keys: ["Super", "I"], action: "Install Guide", desc: "Bootstrap Omarchy" },
    ],
  },
  {
    category: "Capture",
    binds: [
      { keys: ["PrintScreen"], action: "Screenshot", desc: "Capture screen" },
      { keys: ["Alt", "PrintScreen"], action: "Screen record", desc: "Start/stop recording" },
      { keys: ["Super", "PrintScreen"], action: "Color picker", desc: "Pick color from screen" },
      { keys: ["Super", "Ctrl", "C"], action: "Capture menu", desc: "Screenshot/record/picker" },
      {
        keys: ["Super", "Ctrl", "Alt", "T"],
        action: "Time notification",
        desc: "Show time as notification",
      },
    ],
  },
  {
    category: "System Controls",
    binds: [
      { keys: ["Super", "Ctrl", "A"], action: "Audio controls", desc: "Open wiremix" },
      { keys: ["Super", "Ctrl", "B"], action: "Bluetooth", desc: "Open bluetui" },
      { keys: ["Super", "Ctrl", "W"], action: "WiFi controls", desc: "Open impala" },
      { keys: ["Super", "Ctrl", "S"], action: "Share menu", desc: "Via LocalSend" },
      { keys: ["Super", "Ctrl", "T"], action: "Activity monitor", desc: "Open btop" },
      { keys: ["Super", "Ctrl", "O"], action: "Toggle menu", desc: "Omarchy control menu" },
      { keys: ["Super", "Ctrl", "H"], action: "Hardware menu", desc: "Hardware info" },
    ],
  },
  {
    category: "Clipboard",
    binds: [
      { keys: ["Super", "C"], action: "Copy", desc: "Unified clipboard copy" },
      { keys: ["Super", "X"], action: "Cut", desc: "Unified clipboard cut" },
      { keys: ["Super", "V"], action: "Paste", desc: "Unified clipboard paste" },
      {
        keys: ["Super", "Ctrl", "V"],
        action: "Clipboard manager",
        desc: "Manage clipboard history",
      },
    ],
  },
  {
    category: "Style",
    binds: [
      { keys: ["Super", "Ctrl", "Shift", "Space"], action: "Pick theme", desc: "Change theme" },
      { keys: ["Super", "Ctrl", "Space"], action: "Pick background", desc: "Change wallpaper" },
      {
        keys: ["Super", "Backspace"],
        action: "Toggle transparency",
        desc: "Toggle single-window square",
      },
      {
        keys: ["Super", "Ctrl", "Backspace"],
        action: "Square aspect",
        desc: "Toggle window aspect",
      },
    ],
  },
  {
    category: "Toggles",
    binds: [
      { keys: ["Super", "Ctrl", "I"], action: "Toggle idle", desc: "Prevent sleep/idle" },
      { keys: ["Super", "Ctrl", "N"], action: "Nightlight", desc: "Toggle display temperature" },
      {
        keys: ["Super", "Ctrl", "Delete"],
        action: "Toggle display",
        desc: "Laptop display on/off",
      },
    ],
  },
  {
    category: "Window Focus",
    binds: [
      { keys: ["Super", "Arrow"], action: "Focus direction", desc: "Move focus to window" },
      {
        keys: ["Super", "Shift", "Arrow"],
        action: "Swap window",
        desc: "Swap with window in direction",
      },
      { keys: ["Alt", "Tab"], action: "Cycle windows", desc: "Cycle forward on workspace" },
      {
        keys: ["Alt", "Shift", "Tab"],
        action: "Cycle windows (back)",
        desc: "Cycle backward on workspace",
      },
      { keys: ["Super", "Equal"], action: "Grow left", desc: "Grow windows to the left" },
      { keys: ["Super", "Minus"], action: "Grow right", desc: "Grow windows to the right" },
      {
        keys: ["Super", "Shift", "Equal"],
        action: "Grow bottom",
        desc: "Grow windows to the bottom",
      },
      { keys: ["Super", "Shift", "Minus"], action: "Grow top", desc: "Grow windows to the top" },
    ],
  },
  {
    category: "Tmux",
    binds: [
      { keys: ["Ctrl+Space"], action: "Prefix key", desc: "Tmux prefix (also Ctrl+B)" },
      {
        keys: ["Super", "Alt", "Enter"],
        action: "New tmux session",
        desc: "Start tmux in terminal",
      },
      { keys: ["Prefix", "v"], action: "Split pane (vertical)", desc: "Pane beside" },
      { keys: ["Prefix", "h"], action: "Split pane (horizontal)", desc: "Pane below" },
      { keys: ["Prefix", "x"], action: "Kill pane", desc: "Close pane" },
      { keys: ["Prefix", "z"], action: "Zoom pane", desc: "Toggle fullscreen" },
      { keys: ["Prefix", "c"], action: "New window", desc: "Create window" },
      { keys: ["Prefix", "k"], action: "Kill window", desc: "Close window" },
      { keys: ["Prefix", "r"], action: "Rename window", desc: "Change window name" },
      { keys: ["Prefix", "C"], action: "New session", desc: "Create session" },
      { keys: ["Prefix", "s"], action: "List sessions", desc: "Show session list" },
      { keys: ["Prefix", "d"], action: "Detach session", desc: "Detach from session" },
      { keys: ["Prefix", "["], action: "Copy mode", desc: "Enter vi-style copy mode" },
    ],
  },
];

export function Keybindings() {
  const pressedKeys = useOS((s) => s.pressedKeys);
  const config = useOS((s) => s.config);
  const [search, setSearch] = useState("");

  const filtered = allHotkeys
    .map((g) => ({
      category: g.category,
      binds: g.binds.filter(
        (b) =>
          b.action.toLowerCase().includes(search.toLowerCase()) ||
          b.desc.toLowerCase().includes(search.toLowerCase()) ||
          b.keys.join(" ").toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.binds.length > 0);

  return (
    <Window appId="keybindings" title="hyprland-bindings" accent="var(--neon-blue)">
      <div className="h-full flex flex-col bg-[oklch(0.14_0.02_270)]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg text-glow-blue text-neon-blue font-bold">Keybindings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Omarchy hotkeys — live detection active.
              </p>
            </div>
            <div className="flex gap-1.5 min-h-[34px] items-center">
              {pressedKeys.length === 0 ? (
                <span className="text-xs text-muted-foreground">no keys pressed</span>
              ) : (
                pressedKeys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-xs rounded border border-neon-blue text-neon-blue bg-neon-blue/10"
                    style={{
                      boxShadow: "0 0 12px color-mix(in oklab, var(--neon-blue) 60%, transparent)",
                    }}
                  >
                    {k}
                  </kbd>
                ))
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotkeys..."
              className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:border-neon-blue/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filtered.map((g) => (
            <div key={g.category}>
              <h3 className="text-xs uppercase tracking-wider text-neon-purple/70 mb-3 font-semibold border-b border-border/50 pb-1">
                {g.category}
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {g.binds.map((b) => {
                  const triggered = b.keys.every((k) => pressedKeys.includes(k));
                  return (
                    <div
                      key={b.action + b.keys.join("")}
                      className="p-3 rounded-lg border border-border bg-card/40 transition-all"
                      style={{
                        borderRadius: config.borderRadius,
                        borderColor: triggered ? "var(--neon-blue)" : undefined,
                        boxShadow: triggered
                          ? "0 0 24px color-mix(in oklab, var(--neon-blue) 40%, transparent)"
                          : undefined,
                      }}
                    >
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {b.keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-secondary border border-border">
                              {k}
                            </kbd>
                            {i < b.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-foreground font-medium">{b.action}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="text-center text-sm text-muted-foreground py-12">
              no matching hotkeys
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
