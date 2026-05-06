import { useOS } from "@/store/os";
import { Window } from "./Window";

const binds: { keys: string[]; action: string; desc: string }[] = [
  { keys: ["Super", "Enter"], action: "open terminal", desc: "Launch jsh shell" },
  { keys: ["Super", "D"], action: "open launcher", desc: "App switcher" },
  { keys: ["Super", "K"], action: "open keybindings", desc: "This panel" },
  { keys: ["Super", "C"], action: "open config", desc: "Customize wm" },
  { keys: ["Super", "I"], action: "open install", desc: "Install guide" },
  { keys: ["Super", "Q"], action: "close window", desc: "Kill focused" },
  { keys: ["Esc"], action: "close launcher", desc: "Dismiss" },
];

export function Keybindings() {
  const { pressedKeys, config } = useOS();

  return (
    <Window appId="keybindings" title="hyprland-bindings" accent="var(--neon-blue)">
      <div className="h-full overflow-y-auto p-6 bg-[oklch(0.14_0.02_270)]">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl text-glow-blue text-neon-blue">Keybindings</h2>
            <p className="text-xs text-muted-foreground mt-1">Press combinations — they're live.</p>
          </div>
          <div className="flex gap-1.5 min-h-[34px]">
            {pressedKeys.length === 0 ? (
              <span className="text-xs text-muted-foreground self-center">no keys pressed</span>
            ) : pressedKeys.map((k) => (
              <kbd
                key={k}
                className="px-2.5 py-1 text-xs rounded border border-neon-blue text-neon-blue bg-neon-blue/10"
                style={{ boxShadow: "0 0 12px color-mix(in oklab, var(--neon-blue) 60%, transparent)" }}
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {binds.map((b) => {
            const triggered = b.keys.every((k) => pressedKeys.includes(k));
            return (
              <div
                key={b.action}
                className="p-4 rounded-lg border border-border bg-card/50 transition-all"
                style={{
                  borderRadius: config.borderRadius,
                  borderColor: triggered ? "var(--neon-blue)" : undefined,
                  boxShadow: triggered ? "0 0 24px color-mix(in oklab, var(--neon-blue) 40%, transparent)" : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex gap-1">
                    {b.keys.map((k, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd className="px-2 py-0.5 text-[11px] rounded bg-secondary border border-border">{k}</kbd>
                        {i < b.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-foreground">{b.action}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Window>
  );
}
