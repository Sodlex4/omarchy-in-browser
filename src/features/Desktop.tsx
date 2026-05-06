import { useOS } from "@/store/os";
import { TopBar } from "./TopBar";
import { Launcher } from "./Launcher";
import { Terminal } from "./Terminal";
import { Keybindings } from "./Keybindings";
import { ConfigLab } from "./ConfigLab";
import { InstallGuide } from "./InstallGuide";
import { Terminal as TermIcon, Keyboard, SlidersHorizontal, Download } from "lucide-react";

const dock = [
  { id: "terminal" as const, icon: TermIcon, color: "var(--neon-green)" },
  { id: "keybindings" as const, icon: Keyboard, color: "var(--neon-blue)" },
  { id: "config" as const, icon: SlidersHorizontal, color: "var(--neon-purple)" },
  { id: "install" as const, icon: Download, color: "var(--neon-pink)" },
];

export function Desktop() {
  const { openApps, openApp, toggleLauncher, config } = useOS();
  const accentVar = `var(--neon-${config.accent})`;

  return (
    <div className="fixed inset-0 flex flex-col bg-hero">
      <TopBar />
      <div className="flex-1 relative bg-grid">
        {/* Idle wallpaper */}
        {openApps.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none animate-float">
            <div className="text-7xl md:text-9xl font-bold tracking-tighter" style={{ color: accentVar, textShadow: `0 0 40px ${accentVar}` }}>
              myomarchy
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              press <kbd className="px-1.5 py-0.5 text-xs rounded bg-secondary border border-border mx-1">Alt</kbd>+<kbd className="px-1.5 py-0.5 text-xs rounded bg-secondary border border-border mx-1">D</kbd> for launcher · <kbd className="px-1.5 py-0.5 text-xs rounded bg-secondary border border-border mx-1">Alt</kbd>+<kbd className="px-1.5 py-0.5 text-xs rounded bg-secondary border border-border mx-1">↵</kbd> for terminal
            </div>
          </div>
        )}

        {openApps.includes("terminal") && <Terminal />}
        {openApps.includes("keybindings") && <Keybindings />}
        {openApps.includes("config") && <ConfigLab />}
        {openApps.includes("install") && <InstallGuide />}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border bg-card/80 backdrop-blur-md window-shadow">
          <button
            onClick={toggleLauncher}
            className="h-10 w-10 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 transition-all"
            style={{ background: "color-mix(in oklab, var(--accent) 20%, transparent)" }}
            title="Launcher (Alt+D)"
          >
            <span className="text-xs font-bold" style={{ color: accentVar }}>≡</span>
          </button>
          <div className="w-px h-6 bg-border" />
          {dock.map((d) => {
            const Icon = d.icon;
            const open = openApps.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => openApp(d.id)}
                className="relative h-10 w-10 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 transition-all hover:-translate-y-0.5"
                style={{
                  color: d.color,
                  background: `color-mix(in oklab, ${d.color} 10%, transparent)`,
                  boxShadow: open ? `0 0 14px color-mix(in oklab, ${d.color} 50%, transparent)` : undefined,
                }}
                title={d.id}
              >
                <Icon className="h-4 w-4" />
                {open && <span className="absolute -bottom-1 h-1 w-1 rounded-full" style={{ background: d.color }} />}
              </button>
            );
          })}
        </div>
      </div>

      <Launcher />
    </div>
  );
}
